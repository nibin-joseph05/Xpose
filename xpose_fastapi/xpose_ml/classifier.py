from transformers import BertTokenizer, BertForSequenceClassification, pipeline
import torch
import re
import logging
from detoxify import Detoxify
import numpy as np
import shap
from functools import lru_cache

logger = logging.getLogger("uvicorn")

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=3)
model.eval()

detox = Detoxify('original')
hate_speech_detector = pipeline("text-classification", model="unitary/toxic-bert")

explainer = None

spam_keywords = [
    'click here', 'free money', 'congratulations', 'winner', 'prize',
    'urgent', 'act now', 'limited time', 'earn money', 'work from home',
    'haha', 'lol', 'testing', 'test', 'fake', 'joke', 'prank',
    'buy now', 'amazing deal', 'discount', 'offer expires'
]

crime_keywords = [
    'murder', 'killed', 'assault', 'robbery', 'theft', 'burglary',
    'violence', 'attack', 'weapon', 'gun', 'knife', 'threat',
    'harassment', 'abuse', 'fraud', 'scam', 'drugs', 'trafficking',
    'stolen', 'vandalism', 'breaking', 'entering', 'shot', 'stabbed'
]

legitimate_crime_words = [
    'police', 'report', 'incident', 'happened', 'occurred', 'witnessed',
    'victim', 'suspect', 'location', 'time', 'date', 'emergency',
    'help', 'assistance', 'investigation', 'evidence'
]


@lru_cache(maxsize=100)
def get_shap_explanation(text: str, max_words: int = 50):
    global explainer
    if explainer is None:
        return None
    try:
        truncated_text = ' '.join(text.split()[:max_words])
        shap_values = explainer([truncated_text], max_evals=100)
        explanation = {
            'base_value': 0.0,
            'word_importances': [],
            'top_influential_words': []
        }
        if hasattr(shap_values, 'base_values') and len(shap_values.base_values) > 0:
            base_val = shap_values.base_values[0]
            if isinstance(base_val, np.ndarray):
                if base_val.ndim > 0:
                    explanation['base_value'] = float(base_val[0]) if len(base_val) > 0 else 0.0
                else:
                    explanation['base_value'] = float(base_val)
            else:
                explanation['base_value'] = float(base_val)
        if hasattr(shap_values, 'values') and len(shap_values.values) > 0:
            values = shap_values.values[0]
            if hasattr(shap_values, 'data') and len(shap_values.data) > 0:
                words = shap_values.data[0]
            else:
                words = truncated_text.split()
            if isinstance(values, np.ndarray):
                if values.ndim > 1:
                    if values.shape[-1] > 1:
                        values = np.sum(values, axis=-1)
                    else:
                        values = values[:, 0]
                values = values.flatten()
            min_len = min(len(words), len(values))
            for i in range(min_len):
                try:
                    word = str(words[i]).strip()
                    shap_val = values[i]
                    if isinstance(shap_val, (np.generic, np.ndarray)):
                        shap_val = float(np.nan_to_num(shap_val, nan=0.0))
                    else:
                        shap_val = float(shap_val) if shap_val is not None else 0.0
                    explanation['word_importances'].append({
                        "word": word,
                        "score": shap_val
                    })
                except Exception as e:
                    logger.warning(f"Error processing SHAP value at index {i}: {e}")
                    explanation['word_importances'].append({
                        "word": str(words[i]) if i < len(words) else f"word_{i}",
                        "score": 0.0
                    })
        if explanation['word_importances']:
            sorted_words = sorted(
                explanation['word_importances'],
                key=lambda x: abs(x['score']),
                reverse=True
            )[:5]
            explanation['top_influential_words'] = [
                {
                    'word': item['word'],
                    'impact': float(item['score']),
                    'influence': 'positive' if item['score'] > 0 else 'negative'
                }
                for item in sorted_words
            ]
        else:
            logger.warning("No word importances found in SHAP explanation")
        return explanation
    except Exception as e:
        logger.error(f"Error generating SHAP explanation: {e}")
        logger.error(f"SHAP values type: {type(shap_values) if 'shap_values' in locals() else 'undefined'}")
        if 'shap_values' in locals():
            logger.error(f"SHAP values attributes: {dir(shap_values)}")
        return None
def initialize_shap_explainer():
    global explainer
    try:
        def bert_predict_function(texts):
            predictions = []
            for text in texts:
                inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)
                with torch.no_grad():
                    outputs = model(**inputs)
                    probs = torch.nn.functional.softmax(outputs.logits, dim=1)
                    predictions.append(probs.cpu().numpy()[0])
            return np.array(predictions)
        masker = shap.maskers.Text(tokenizer)
        explainer = shap.Explainer(bert_predict_function, masker)
        test_texts = ["A man was stabbed on the street"]
        test_explanation = explainer(test_texts, max_evals=50)
        # logger.info(f"Test SHAP explanation type: {type(test_explanation)}")
        # logger.info(f"Test SHAP explanation attributes: {dir(test_explanation)}")
        # if hasattr(test_explanation, 'values'):
        #     logger.info(f"Test SHAP values shape: {test_explanation.values[0].shape}")
        #     logger.info(f"Test SHAP values sample: {test_explanation.values[0][:5]}")
        # if hasattr(test_explanation, 'data'):
        #     logger.info(f"Test SHAP data sample: {test_explanation.data[0][:5]}")
        logger.info("SHAP explainer initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize SHAP explainer: {e}")
        return False

def preprocess_text(text: str) -> str:
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def calculate_spam_score(text: str) -> float:
    text_lower = text.lower()
    spam_count = sum(1 for keyword in spam_keywords if keyword in text_lower)
    crime_count = sum(1 for keyword in crime_keywords if keyword in text_lower)
    legit_count = sum(1 for keyword in legitimate_crime_words if keyword in text_lower)

    if len(text.split()) < 5:
        spam_count += 1

    if re.search(r'\b(ha){2,}|\b(lo){2,}', text_lower):
        spam_count += 2

    if len(set(text.split())) < len(text.split()) * 0.4:
        spam_count += 1

    spam_ratio = spam_count / max(1, len(text.split()))
    crime_ratio = crime_count / max(1, len(text.split()))
    legit_ratio = legit_count / max(1, len(text.split()))

    final_score = max(0, min(1, spam_ratio - (crime_ratio * 0.7) - (legit_ratio * 0.5)))
    return final_score


def detect_toxicity(text: str) -> dict:
    try:
        toxicity_scores = detox.predict(text)
        hate_result = hate_speech_detector(text)[0]

        hate_score = float(hate_result['score']) if hate_result['label'] == 'TOXIC' else 1 - float(hate_result['score'])

        text_lower = text.lower()
        crime_word_count = sum(1 for word in crime_keywords if word in text_lower)
        legit_word_count = sum(1 for word in legitimate_crime_words if word in text_lower)

        if crime_word_count > 0 and legit_word_count > 0 and toxicity_scores['toxicity'] < 0.3:
            hate_score = min(hate_score, 0.3)

        return {
            'toxicity': float(toxicity_scores['toxicity']),
            'severe_toxicity': float(toxicity_scores['severe_toxicity']),
            'obscene': float(toxicity_scores['obscene']),
            'threat': float(toxicity_scores['threat']),
            'insult': float(toxicity_scores['insult']),
            'identity_attack': float(toxicity_scores['identity_attack']),
            'hate_speech_score': hate_score
        }
    except Exception as e:
        logger.error(f"Toxicity detection failed: {e}")
        return {
            'toxicity': 0.0,
            'severe_toxicity': 0.0,
            'obscene': 0.0,
            'threat': 0.0,
            'insult': 0.0,
            'identity_attack': 0.0,
            'hate_speech_score': 0.0
        }


def classify_urgency(text: str, toxicity_scores: dict) -> str:
    text_lower = text.lower()
    high_urgency_words = ['murder', 'killed', 'gun', 'weapon', 'emergency', 'help', 'urgent', 'immediate', 'shot',
                          'bleeding']
    medium_urgency_words = ['theft', 'robbery', 'assault', 'harassment', 'threat', 'attack', 'violence']

    high_count = sum(1 for word in high_urgency_words if word in text_lower)
    medium_count = sum(1 for word in medium_urgency_words if word in text_lower)

    if high_count >= 2 or toxicity_scores['threat'] > 0.7 or toxicity_scores['toxicity'] > 0.8:
        return 'HIGH'
    elif high_count >= 1 or medium_count >= 2 or toxicity_scores['toxicity'] > 0.5:
        return 'MEDIUM'
    else:
        return 'LOW'


def classify_report(text: str) -> dict:
    try:
        processed_text = preprocess_text(text)

        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.nn.functional.softmax(outputs.logits, dim=1)
            confidence, predicted_class = torch.max(probs, dim=1)

        spam_score = calculate_spam_score(text)
        toxicity_scores = detect_toxicity(text)

        word_count = len(text.split())

        is_spam = (
                spam_score > 0.4 or
                (word_count < 3) or
                (word_count < 8 and spam_score > 0.2) or
                (toxicity_scores['toxicity'] < 0.05 and word_count < 6 and spam_score > 0.1)
        )

        is_hate_speech = (
                toxicity_scores['hate_speech_score'] > 0.75 and
                toxicity_scores['toxicity'] > 0.2
        )

        is_toxic = toxicity_scores['toxicity'] > 0.6

        urgency = classify_urgency(text, toxicity_scores)

        overall_confidence = (
                confidence.item() * 0.4 +
                (1 - spam_score) * 0.3 +
                min(1.0, sum(toxicity_scores.values()) / len(toxicity_scores)) * 0.3
        )

        report_quality = (
            'HIGH' if not is_spam and not is_toxic and word_count >= 10 and spam_score < 0.2
            else 'MEDIUM' if not is_spam and word_count >= 5
            else 'LOW'
        )

        shap_explanation = get_shap_explanation(text) if not is_spam else None

        result = {
            "is_spam": bool(is_spam),
            "is_hate_speech": bool(is_hate_speech),
            "is_toxic": bool(is_toxic),
            "urgency": urgency,
            "confidence": float(overall_confidence),
            "spam_score": float(spam_score),
            "report_quality": report_quality,
            "toxicity_analysis": toxicity_scores,
            "word_count": word_count,
            "char_count": len(text),
            "needs_review": bool(is_hate_speech or toxicity_scores['threat'] > 0.5),
            "shap_explanation": shap_explanation
        }

        if shap_explanation:
            logger.info(
                f"SHAP analysis completed - Top influential words: {[w['word'] for w in shap_explanation.get('top_influential_words', [])]}")

        return result

    except Exception as e:
        logger.error(f"Classification failed: {e}")
        return {
            "is_spam": True,
            "is_hate_speech": False,
            "is_toxic": False,
            "urgency": "LOW",
            "confidence": 0.0,
            "spam_score": 1.0,
            "report_quality": "LOW",
            "toxicity_analysis": {
                "toxicity": 0.0,
                "severe_toxicity": 0.0,
                "obscene": 0.0,
                "threat": 0.0,
                "insult": 0.0,
                "identity_attack": 0.0,
                "hate_speech_score": 0.0
            },
            "word_count": 0,
            "char_count": 0,
            "needs_review": True,
            "shap_explanation": None,
            "error": str(e)
        }