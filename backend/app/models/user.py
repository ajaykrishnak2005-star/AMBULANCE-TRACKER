import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database.base import Base

class UserRole(str, enum.Enum):
    USER = "USER"
    DRIVER = "DRIVER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=False, index=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    driver_profile = relationship("Driver", back_populates="user", uselist=False, cascade="all, delete-orphan")
    emergency_requests = relationship("EmergencyRequest", back_populates="user")
    call_records = relationship("CallRecord", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
