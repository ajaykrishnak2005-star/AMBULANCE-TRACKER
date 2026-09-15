from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.models.ambulance import AmbulanceType, VerificationStatus

class AmbulanceBase(BaseModel):
    vehicle_number: str
    ambulance_type: AmbulanceType = AmbulanceType.BASIC
    equipment_details: Optional[str] = None

class AmbulanceCreate(AmbulanceBase):
    pass

class AmbulanceUpdate(BaseModel):
    vehicle_number: Optional[str] = None
    ambulance_type: Optional[AmbulanceType] = None
    equipment_details: Optional[str] = None

class LocationInfo(BaseModel):
    latitude: float
    longitude: float
    heading: Optional[float] = 0.0
    speed: Optional[float] = 0.0
    address: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

class AmbulanceResponse(AmbulanceBase):
    id: int
    driver_id: int
    verification_status: VerificationStatus
    is_online: bool = False
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    driver_photo: Optional[str] = None
    location: Optional[LocationInfo] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AmbulanceNearbyResponse(BaseModel):
    id: int
    vehicle_number: str
    ambulance_type: AmbulanceType
    equipment_details: Optional[str] = None
    driver_id: int
    driver_name: str
    driver_phone: str
    driver_photo: Optional[str] = None
    is_online: bool
    latitude: float
    longitude: float
    distance_km: float
    estimated_response_time_min: int
    suitability_score: float
    ranking: int
    verification_status: VerificationStatus
