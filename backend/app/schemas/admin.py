from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from app.models.ambulance import VerificationStatus

class AmbulanceVerifyRequest(BaseModel):
    verification_status: VerificationStatus

class AdminStatsResponse(BaseModel):
    total_users: int
    registered_drivers: int
    registered_ambulances: int
    available_ambulances: int
    active_emergency_requests: int
    completed_requests: int
    total_call_records: int
    average_response_time_min: float

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
