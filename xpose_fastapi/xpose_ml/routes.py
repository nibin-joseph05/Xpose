from fastapi import APIRouter
from xpose_ml.models import ReportInput, ReportClassification
from xpose_ml.classifier import classify_report

router = APIRouter()

@router.post("/classify", response_model=ReportClassification)
def classify(report: ReportInput):
    return classify_report(report.description)
