from transformers import BertTokenizer, BertForSequenceClassification
import torch

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
model = BertForSequenceClassification.from_pretrained("bert-base-uncased", num_labels=2)
model.eval()

def classify_report(text: str):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.nn.functional.softmax(outputs.logits, dim=1)
        confidence, predicted_class = torch.max(probs, dim=1)

    is_spam = predicted_class.item() == 1
    urgency = "HIGH" if len(text.split()) > 10 else "LOW"

    return {
        "is_spam": is_spam,
        "urgency": urgency,
        "confidence": confidence.item()
    }
