# routes.py
import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException
from xpose_ml.models import ReportInput, ReportClassification, HealthResponse
from xpose_ml.classifier import classify_report

logger = logging.getLogger("uvicorn")

router = APIRouter()

@router.get("/", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        message="Xpose ML API is running ✅",
        timestamp=datetime.now().isoformat(),
        version="2.0.0"
    )

@router.get("/health", response_model=HealthResponse)
def detailed_health():
    try:
        test_result = classify_report("This is a test message for health check")
        return HealthResponse(
            status="healthy",
            message="All ML models loaded and functioning properly",
            timestamp=datetime.now().isoformat(),
            version="2.0.0"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="ML models not responding properly")

@router.post("/classify", response_model=ReportClassification)
def classify(report: ReportInput):
    try:
        logger.info(f"Received report description from Spring: {report.description[:100]}...")

        if not report.description or len(report.description.strip()) == 0:
            raise HTTPException(status_code=400, detail="Description cannot be empty")

        result = classify_report(report.description)

        logger.info(f"Classification result: is_spam={result['is_spam']}, urgency={result['urgency']}, confidence={result['confidence']:.3f}")

        if result.get('error'):
            logger.error(f"Classification error: {result['error']}")

        return ReportClassification(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during classification: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/classify/batch")
def classify_batch(reports: list[ReportInput]):
    try:
        if len(reports) > 100:
            raise HTTPException(status_code=400, detail="Maximum 100 reports allowed per batch")

        results = []
        for i, report in enumerate(reports):
            try:
                result = classify_report(report.description)
                result['batch_index'] = i
                results.append(result)
            except Exception as e:
                logger.error(f"Error classifying report {i}: {e}")
                results.append({
                    "batch_index": i,
                    "is_spam": True,
                    "is_hate_speech": False,
                    "is_toxic": False,
                    "urgency": "LOW",
                    "confidence": 0.0,
                    "spam_score": 1.0,
                    "report_quality": "LOW",
                    "toxicity_analysis": {},
                    "word_count": 0,
                    "char_count": 0,
                    "needs_review": True,
                    "error": str(e)
                })

        return {"results": results, "processed_count": len(results)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch classification error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")