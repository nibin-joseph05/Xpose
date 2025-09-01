import logging
from fastapi import APIRouter
from xpose_ml.models import ReportInput, ReportClassification
from xpose_ml.classifier import classify_report

logger = logging.getLogger("uvicorn")

router = APIRouter()

@router.post("/classify", response_model=ReportClassification)
def classify(report: ReportInput):
    logger.info(f"Received report description from Spring: {report.description[:100]}...")
    result = classify_report(report.description)
    logger.info(f"Classification result: {result}")
    return result
