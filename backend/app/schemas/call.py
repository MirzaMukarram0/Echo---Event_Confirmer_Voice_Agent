from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

from app.core.exceptions import InvalidPhoneNumberException


ScenarioType = Literal[
    "appointment_reminder",
    "lead_qualification",
    "customer_satisfaction",
    "payment_followup",
    "event_registration",
]

CallStatusType = Literal["queued", "in-progress", "ended", "failed"]

ScenarioFieldType = Literal["text", "date", "phone"]


class ScenarioField(BaseModel):
    key: str
    label: str
    required: bool = False
    placeholder: Optional[str] = None
    type: ScenarioFieldType = "text"


class ScenarioInfo(BaseModel):
    id: ScenarioType
    label: str
    description: str
    fields: List[ScenarioField]


class ScenarioListResponse(BaseModel):
    scenarios: List[ScenarioInfo]


class CallScenarioConfig(BaseModel):
    model_config = {"extra": "allow"}


class InitiateCallRequest(BaseModel):
    phone_number: str = Field(..., description="Customer phone number in E.164 format")
    scenario: ScenarioType
    scenario_config: Dict[str, str]

    @field_validator("phone_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned.startswith("+"):
            raise InvalidPhoneNumberException("Phone number must start with '+'.")
        digits = cleaned[1:]
        if not digits.isdigit() or len(digits) < 8 or len(digits) > 15:
            raise InvalidPhoneNumberException("Phone number must be valid E.164.")
        return cleaned


class InitiateCallResponse(BaseModel):
    success: bool
    call_id: str
    message: Optional[str] = None
    status: CallStatusType
    phone_number: str
    scenario: ScenarioType


class CallStatus(BaseModel):
    call_id: str
    status: CallStatusType
    phone_number: str
    scenario: ScenarioType
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    transcript: Optional[str] = None
    recording_url: Optional[str] = None
    ended_reason: Optional[str] = None
    cost: Optional[float] = None


class CallListResponse(BaseModel):
    calls: List[CallStatus]
    total: int


class WebhookEvent(BaseModel):
    message: Dict[str, object]
