from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.models.ambulance import AmbulanceType, VerificationStatus

class DriverRegisterRequest(BaseModel):
    # User fields
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: str
    # Driver fields
    license_number: str
    experience_years: int = Field(default=1, ge=0)
    photo_url: Optional[str] = None
    # Ambulance fields
    vehicle_number: str
    ambulance_type: AmbulanceType = AmbulanceType.BASIC
    equipment_details: Optional[str] = None

class DriverProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    experience_years: Optional[int] = None
    photo_url: Optional[str] = None

class AvailabilityUpdate(BaseModel):
    is_online: bool

class LocationUpdate(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    heading: Optional[float] = 0.0
    speed: Optional[float] = 0.0
    address: Optional[str] = None

class DriverAmbulanceInfo(BaseModel):
    id: int
    vehicle_number: str
    ambulance_type: AmbulanceType
    equipment_details: Optional[str] = None
    verification_status: VerificationStatus
    is_online: bool
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    last_location_time: Optional[datetime] = None

class DriverResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    email: str
    phone: str
    license_number: str
    experience_years: int
    photo_url: Optional[str] = None
    is_verified: bool
    created_at: datetime
    ambulance: Optional[DriverAmbulanceInfo] = None

    class Config:
        from_attributes = True
