from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.emergency import EmergencyStatus

class EmergencyRequestCreate(BaseModel):
    patient_name: str = Field(..., min_length=2)
    patient_phone: str = Field(..., min_length=7)
    emergency_type: str = Field(default="GENERAL")
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    address: Optional[str] = None
    notes: Optional[str] = None
    selected_ambulance_id: Optional[int] = None

class EmergencyRequestUpdate(BaseModel):
    status: Optional[EmergencyStatus] = None
    selected_ambulance_id: Optional[int] = None
    notes: Optional[str] = None

class EmergencyRequestResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    patient_name: str
    patient_phone: str
    emergency_type: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    notes: Optional[str] = None
    status: EmergencyStatus
    selected_ambulance_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CallRecordCreate(BaseModel):
    emergency_request_id: Optional[int] = None
    ambulance_id: int
    driver_phone: str

class CallRecordResponse(BaseModel):
    id: int
    emergency_request_id: Optional[int] = None
    user_id: Optional[int] = None
    ambulance_id: int
    driver_phone: str
    status: str
    call_initiated_at: datetime

    class Config:
        from_attributes = True
