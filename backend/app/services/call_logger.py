from typing import Optional
from sqlalchemy.orm import Session
from app.models.emergency import CallRecord
from app.models.audit import AuditLog

def log_call_record(
    db: Session,
    ambulance_id: int,
    driver_phone: str,
    emergency_request_id: Optional[int] = None,
    user_id: Optional[int] = None,
    status: str = "INITIATED"
) -> CallRecord:
    record = CallRecord(
        emergency_request_id=emergency_request_id,
        user_id=user_id,
        ambulance_id=ambulance_id,
        driver_phone=driver_phone,
        status=status
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

def create_audit_log(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details,
        ip_address=ip_address
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
