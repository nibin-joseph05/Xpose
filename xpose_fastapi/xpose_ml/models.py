# models.py
from pydantic import BaseModel, Field
from typing import Dict, Optional
from enum import Enum

class UrgencyLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class ReportQuality(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class ReportInput(BaseModel):
    description: str = Field(..., min_length=1, max_length=5000, description="Crime report description")

class ToxicityAnalysis(BaseModel):
    toxicity: float = Field(..., ge=0.0, le=1.0)
    severe_toxicity: float = Field(..., ge=0.0, le=1.0)
    obscene: float = Field(..., ge=0.0, le=1.0)
    threat: float = Field(..., ge=0.0, le=1.0)
    insult: float = Field(..., ge=0.0, le=1.0)
    identity_attack: float = Field(..., ge=0.0, le=1.0)
    hate_speech_score: float = Field(..., ge=0.0, le=1.0)

class ReportClassification(BaseModel):
    is_spam: bool = Field(..., description="Whether the report is classified as spam")
    is_hate_speech: bool = Field(..., description="Whether the report contains hate speech")
    is_toxic: bool = Field(..., description="Whether the report is toxic")
    urgency: UrgencyLevel = Field(..., description="Urgency level of the report")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Overall classification confidence")
    spam_score: float = Field(..., ge=0.0, le=1.0, description="Calculated spam score")
    report_quality: ReportQuality = Field(..., description="Quality assessment of the report")
    toxicity_analysis: ToxicityAnalysis = Field(..., description="Detailed toxicity analysis")
    word_count: int = Field(..., ge=0, description="Number of words in the report")
    char_count: int = Field(..., ge=0, description="Number of characters in the report")
    needs_review: bool = Field(..., description="Whether the report needs manual review")
    error: Optional[str] = Field(None, description="Error message if classification failed")

class HealthResponse(BaseModel):
    status: str = Field(..., description="API health status")
    message: str = Field(..., description="Health check message")
    timestamp: str = Field(..., description="Current timestamp")
    version: str = Field(..., description="API version")