from pydantic import BaseModel

class ReportInput(BaseModel):
    description: str

class ReportClassification(BaseModel):
    is_spam: bool
    urgency: str
    confidence: float
