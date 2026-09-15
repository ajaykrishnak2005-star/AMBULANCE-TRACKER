from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.emergency import EmergencyRequest, EmergencyStatus, CallRecord
from app.models.ambulance import Ambulance
from app.schemas.emergency import (
    EmergencyRequestCreate,
    EmergencyRequestUpdate,
    EmergencyRequestResponse,
    CallRecordCreate,
    CallRecordResponse,
)
from app.schemas.ambulance import AmbulanceNearbyResponse
from app.auth.permissions import get_current_user, get_optional_current_user
from app.api.ambulances import get_nearby_ambulances
from app.services.call_logger import log_call_record, create_audit_log

router = APIRouter(prefix="/emergency", tags=["Emergency Requests"])

@router.post("/request", response_model=EmergencyRequestResponse, status_code=status.HTTP_201_CREATED)
def create_emergency_request(
    payload: EmergencyRequestCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates an emergency request. Works for both authenticated users and anonymous emergency callers.
    """
    req = EmergencyRequest(
        user_id=current_user.id if current_user else None,
        patient_name=payload.patient_name.strip(),
        patient_phone=payload.patient_phone.strip(),
        emergency_type=payload.emergency_type.upper(),
        latitude=payload.latitude,
        longitude=payload.longitude,
        address=payload.address,
        notes=payload.notes,
        status=EmergencyStatus.PENDING,
        selected_ambulance_id=payload.selected_ambulance_id
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    create_audit_log(
        db,
        action="EMERGENCY_REQUEST_CREATED",
        user_id=current_user.id if current_user else None,
        entity_type="emergency_request",
        entity_id=req.id,
        details=f"Emergency ({req.emergency_type}) logged for {req.patient_name} at ({req.latitude}, {req.longitude})"
    )

    return req

@router.get("/nearby", response_model=List[AmbulanceNearbyResponse])
def search_nearby(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(30.0, ge=1.0, le=150.0),
    emergency_type: str = Query("GENERAL"),
    db: Session = Depends(get_db)
):
    return get_nearby_ambulances(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        emergency_type=emergency_type,
        db=db
    )

@router.get("/history", response_model=List[EmergencyRequestResponse])
def get_user_emergency_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == UserRole.ADMIN:
        requests = db.query(EmergencyRequest).order_by(EmergencyRequest.created_at.desc()).limit(100).all()
    else:
        requests = db.query(EmergencyRequest).filter(EmergencyRequest.user_id == current_user.id).order_by(EmergencyRequest.created_at.desc()).all()
    return requests

@router.get("/{id}", response_model=EmergencyRequestResponse)
def get_emergency_request(id: int, db: Session = Depends(get_db)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency request not found")
    return req

@router.put("/{id}", response_model=EmergencyRequestResponse)
def update_emergency_request(
    id: int,
    payload: EmergencyRequestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency request not found")

    if payload.status:
        req.status = payload.status
    if payload.selected_ambulance_id:
        req.selected_ambulance_id = payload.selected_ambulance_id
    if payload.notes:
        req.notes = payload.notes

    db.commit()
    db.refresh(req)
    return req

@router.post("/call-record", response_model=CallRecordResponse)
def record_call(
    payload: CallRecordCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    amb = db.query(Ambulance).filter(Ambulance.id == payload.ambulance_id).first()
    if not amb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ambulance not found")

    call = log_call_record(
        db=db,
        ambulance_id=payload.ambulance_id,
        driver_phone=payload.driver_phone,
        emergency_request_id=payload.emergency_request_id,
        user_id=current_user.id if current_user else None,
        status="INITIATED"
    )

    create_audit_log(
        db,
        action="ONE_TAP_CALL_INITIATED",
        user_id=current_user.id if current_user else None,
        entity_type="call_record",
        entity_id=call.id,
        details=f"Call initiated to ambulance #{amb.vehicle_number} ({payload.driver_phone})"
    )

    return call
