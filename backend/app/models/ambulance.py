import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base

class AmbulanceType(str, enum.Enum):
    BASIC = "BASIC"                  # Basic Life Support (BLS)
    ADVANCED = "ADVANCED"            # Advanced Life Support (ALS)
    ICU = "ICU"                      # Intensive Care Unit / Cardiac
    PATIENT_TRANSPORT = "PATIENT_TRANSPORT"  # Non-emergency transit

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Ambulance(Base):
    __tablename__ = "ambulances"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id", ondelete="CASCADE"), unique=True, nullable=False)
    vehicle_number = Column(String(50), unique=True, nullable=False, index=True)
    ambulance_type = Column(Enum(AmbulanceType), default=AmbulanceType.BASIC, nullable=False, index=True)
    equipment_details = Column(Text, nullable=True)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    driver = relationship("Driver", back_populates="ambulance")
    availability = relationship("Availability", back_populates="ambulance", uselist=False, cascade="all, delete-orphan")
    location = relationship("Location", back_populates="ambulance", uselist=False, cascade="all, delete-orphan")
    call_records = relationship("CallRecord", back_populates="ambulance")

class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, index=True)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id", ondelete="CASCADE"), unique=True, nullable=False)
    is_online = Column(Boolean, default=False, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    ambulance = relationship("Ambulance", back_populates="availability")
