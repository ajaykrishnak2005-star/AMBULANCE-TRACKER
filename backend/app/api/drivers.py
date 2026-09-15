from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.user import User, UserRole
from app.models.driver import Driver
from app.models.ambulance import Ambulance, Availability, VerificationStatus
from app.models.location import Location
from app.models.emergency import CallRecord, EmergencyRequest
from app.schemas.driver import (
    DriverRegisterRequest,
    DriverProfileUpdate,
    AvailabilityUpdate,
    LocationUpdate,
    DriverResponse,
    DriverAmbulanceInfo,
)
from app.auth.jwt_handler import get_password_hash
from app.auth.permissions import get_current_user, require_role
from app.services.call_logger import create_audit_log

router = APIRouter(prefix="/drivers", tags=["Ambulance Drivers"])

@router.post("/register", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def register_driver(payload: DriverRegisterRequest, db: Session = Depends(get_db)):
    # 1. Check existing email
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    # 2. Check existing license number
    existing_license = db.query(Driver).filter(Driver.license_number == payload.license_number.upper().strip()).first()
    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This driver license number is already registered"
        )

    # 3. Check existing vehicle number
    existing_vehicle = db.query(Ambulance).filter(Ambulance.vehicle_number == payload.vehicle_number.upper().strip()).first()
    if existing_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This ambulance vehicle number is already registered"
        )

    # 4. Create User
    user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name.strip(),
        phone=payload.phone.strip(),
        role=UserRole.DRIVER,
        is_active=True
    )
    db.add(user)
    db.flush()

    # 5. Create Driver
    driver = Driver(
        user_id=user.id,
        license_number=payload.license_number.upper().strip(),
        experience_years=payload.experience_years,
        photo_url=payload.photo_url,
        is_verified=True  # Auto-verify on registration for smooth peer-to-peer readiness
    )
    db.add(driver)
    db.flush()

    # 6. Create Ambulance
    ambulance = Ambulance(
        driver_id=driver.id,
        vehicle_number=payload.vehicle_number.upper().strip(),
        ambulance_type=payload.ambulance_type,
        equipment_details=payload.equipment_details,
        verification_status=VerificationStatus.APPROVED
    )
    db.add(ambulance)
    db.flush()

    # 7. Create Availability
    availability = Availability(
        ambulance_id=ambulance.id,
        is_online=True
    )
    db.add(availability)

    # 8. Create Location (default center point until GPS signals arrive)
    location = Location(
        ambulance_id=ambulance.id,
        latitude=12.9716,   # Default sample urban center (e.g. Bangalore center)
        longitude=77.5946,
        heading=0.0,
        speed=0.0,
        address="Central Emergency Standby Zone"
    )
    db.add(location)

    db.commit()
    db.refresh(driver)
    db.refresh(user)
    db.refresh(ambulance)

    create_audit_log(
        db,
        action="DRIVER_REGISTERED",
        user_id=user.id,
        entity_type="driver",
        entity_id=driver.id,
        details=f"Driver {user.full_name} registered vehicle {ambulance.vehicle_number}"
    )

    amb_info = DriverAmbulanceInfo(
        id=ambulance.id,
        vehicle_number=ambulance.vehicle_number,
        ambulance_type=ambulance.ambulance_type,
        equipment_details=ambulance.equipment_details,
        verification_status=ambulance.verification_status,
        is_online=availability.is_online,
        current_latitude=location.latitude,
        current_longitude=location.longitude,
        last_location_time=location.updated_at
    )

    return DriverResponse(
        id=driver.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        license_number=driver.license_number,
        experience_years=driver.experience_years,
        photo_url=driver.photo_url,
        is_verified=driver.is_verified,
        created_at=driver.created_at,
        ambulance=amb_info
    )

@router.get("/profile", response_model=DriverResponse)
def get_driver_profile(
    current_user: User = Depends(require_role([UserRole.DRIVER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver profile not found")

    amb = driver.ambulance
    amb_info = None
    if amb:
        avail = amb.availability
        loc = amb.location
        amb_info = DriverAmbulanceInfo(
            id=amb.id,
            vehicle_number=amb.vehicle_number,
            ambulance_type=amb.ambulance_type,
            equipment_details=amb.equipment_details,
            verification_status=amb.verification_status,
            is_online=avail.is_online if avail else False,
            current_latitude=loc.latitude if loc else None,
            current_longitude=loc.longitude if loc else None,
            last_location_time=loc.updated_at if loc else None
        )

    return DriverResponse(
        id=driver.id,
        user_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        license_number=driver.license_number,
        experience_years=driver.experience_years,
        photo_url=driver.photo_url,
        is_verified=driver.is_verified,
        created_at=driver.created_at,
        ambulance=amb_info
    )

@router.put("/profile", response_model=DriverResponse)
def update_driver_profile(
    payload: DriverProfileUpdate,
    current_user: User = Depends(require_role([UserRole.DRIVER])),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver profile not found")

    if payload.full_name is not None:
        current_user.full_name = payload.full_name.strip()
    if payload.phone is not None:
        current_user.phone = payload.phone.strip()
    if payload.experience_years is not None:
        driver.experience_years = payload.experience_years
    if payload.photo_url is not None:
        driver.photo_url = payload.photo_url

    db.commit()
    db.refresh(driver)
    db.refresh(current_user)

    return get_driver_profile(current_user=current_user, db=db)

@router.put("/availability")
def toggle_availability(
    payload: AvailabilityUpdate,
    current_user: User = Depends(require_role([UserRole.DRIVER])),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or not driver.ambulance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No registered ambulance for this driver")

    avail = driver.ambulance.availability
    if not avail:
        avail = Availability(ambulance_id=driver.ambulance.id, is_online=payload.is_online)
        db.add(avail)
    else:
        avail.is_online = payload.is_online
        avail.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(avail)

    return {
        "status": "success",
        "is_online": avail.is_online,
        "message": "Status updated to ONLINE / AVAILABLE" if avail.is_online else "Status updated to OFFLINE / UNAVAILABLE"
    }

@router.put("/location")
def update_location(
    payload: LocationUpdate,
    current_user: User = Depends(require_role([UserRole.DRIVER])),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or not driver.ambulance:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No registered ambulance for this driver")

    loc = driver.ambulance.location
    if not loc:
        loc = Location(
            ambulance_id=driver.ambulance.id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            heading=payload.heading or 0.0,
            speed=payload.speed or 0.0,
            address=payload.address
        )
        db.add(loc)
    else:
        loc.latitude = payload.latitude
        loc.longitude = payload.longitude
        loc.heading = payload.heading or 0.0
        loc.speed = payload.speed or 0.0
        loc.address = payload.address
        loc.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(loc)

    return {
        "status": "success",
        "latitude": loc.latitude,
        "longitude": loc.longitude,
        "updated_at": loc.updated_at
    }

@router.get("/requests")
def get_driver_requests(
    current_user: User = Depends(require_role([UserRole.DRIVER])),
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.user_id == current_user.id).first()
    if not driver or not driver.ambulance:
        return {"calls": [], "dispatches": []}

    amb_id = driver.ambulance.id
    calls = db.query(CallRecord).filter(CallRecord.ambulance_id == amb_id).order_by(CallRecord.call_initiated_at.desc()).limit(50).all()
    dispatches = db.query(EmergencyRequest).filter(EmergencyRequest.selected_ambulance_id == amb_id).order_by(EmergencyRequest.created_at.desc()).limit(50).all()

    return {
        "calls": [
            {
                "id": c.id,
                "emergency_request_id": c.emergency_request_id,
                "driver_phone": c.driver_phone,
                "status": c.status,
                "call_initiated_at": c.call_initiated_at
            }
            for c in calls
        ],
        "dispatches": [
            {
                "id": d.id,
                "patient_name": d.patient_name,
                "patient_phone": d.patient_phone,
                "emergency_type": d.emergency_type,
                "latitude": d.latitude,
                "longitude": d.longitude,
                "address": d.address,
                "status": d.status,
                "created_at": d.created_at
            }
            for d in dispatches
        ]
    }
