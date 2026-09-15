import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class EmergencyStatus(str, enum.Enum):
    PENDING = "PENDING"
    DISPATCHED = "DISPATCHED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    patient_name = Column(String(150), nullable=False)
    patient_phone = Column(String(30), nullable=False, index=True)
    emergency_type = Column(String(100), default="GENERAL", nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(Enum(EmergencyStatus), default=EmergencyStatus.PENDING, nullable=False, index=True)
    selected_ambulance_id = Column(Integer, ForeignKey("ambulances.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="emergency_requests")
    selected_ambulance = relationship("Ambulance")
    call_records = relationship("CallRecord", back_populates="emergency_request", cascade="all, delete-orphan")

class CallRecord(Base):
    __tablename__ = "call_records"

    id = Column(Integer, primary_key=True, index=True)
    emergency_request_id = Column(Integer, ForeignKey("emergency_requests.id", ondelete="SET NULL"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    ambulance_id = Column(Integer, ForeignKey("ambulances.id", ondelete="CASCADE"), nullable=False, index=True)
    driver_phone = Column(String(30), nullable=False)
    status = Column(String(50), default="INITIATED", nullable=False)
    call_initiated_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    emergency_request = relationship("EmergencyRequest", back_populates="call_records")
    user = relationship("User", back_populates="call_records")
    ambulance = relationship("Ambulance", back_populates="call_records")
