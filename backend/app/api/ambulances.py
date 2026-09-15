from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.ambulance import Ambulance, AmbulanceType, VerificationStatus, Availability
from app.models.location import Location
from app.models.driver import Driver
from app.models.user import User
from app.schemas.ambulance import AmbulanceResponse, AmbulanceNearbyResponse, LocationInfo
from app.services.geo_service import haversine_distance, get_bounding_box
from app.ai.ranking_engine import ranking_engine

router = APIRouter(prefix="/ambulances", tags=["Ambulances"])

@router.get("", response_model=List[AmbulanceResponse])
def list_ambulances(
    ambulance_type: Optional[AmbulanceType] = None,
    verification_status: Optional[VerificationStatus] = None,
    online_only: bool = False,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Ambulance).join(Driver).join(User)

    if ambulance_type:
        query = query.filter(Ambulance.ambulance_type == ambulance_type)
    if verification_status:
        query = query.filter(Ambulance.verification_status == verification_status)
    if online_only:
        query = query.join(Availability).filter(Availability.is_online == True)

    ambulances = query.limit(limit).all()
    results = []
    for a in ambulances:
        avail = a.availability
        loc = a.location
        loc_info = None
        if loc:
            loc_info = LocationInfo(
                latitude=loc.latitude,
                longitude=loc.longitude,
                heading=loc.heading,
                speed=loc.speed,
                address=loc.address,
                updated_at=loc.updated_at
            )
        results.append(AmbulanceResponse(
            id=a.id,
            driver_id=a.driver_id,
            vehicle_number=a.vehicle_number,
            ambulance_type=a.ambulance_type,
            equipment_details=a.equipment_details,
            verification_status=a.verification_status,
            is_online=avail.is_online if avail else False,
            driver_name=a.driver.user.full_name if a.driver and a.driver.user else None,
            driver_phone=a.driver.user.phone if a.driver and a.driver.user else None,
            driver_photo=a.driver.photo_url if a.driver else None,
            location=loc_info,
            created_at=a.created_at
        ))
    return results

@router.get("/nearby", response_model=List[AmbulanceNearbyResponse])
def get_nearby_ambulances(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(30.0, ge=1.0, le=150.0),
    emergency_type: str = Query("GENERAL"),
    db: Session = Depends(get_db)
):
    """
    Find nearby available ambulances within radius_km, ranked by the AI engine.
    Only approved & online ambulances are considered available.
    """
    # 1. Bounding box pre-filtering for fast spatial query
    min_lat, max_lat, min_lon, max_lon = get_bounding_box(latitude, longitude, radius_km)

    query = (
        db.query(Ambulance)
        .join(Driver)
        .join(User)
        .join(Availability)
        .join(Location)
        .filter(
            Ambulance.verification_status == VerificationStatus.APPROVED,
            Availability.is_online == True,
            Location.latitude >= min_lat,
            Location.latitude <= max_lat,
            Location.longitude >= min_lon,
            Location.longitude <= max_lon,
        )
    )

    candidates = query.all()
    ambulances_for_ranking = []

    for amb in candidates:
        loc = amb.location
        if not loc:
            continue
        dist = haversine_distance(latitude, longitude, loc.latitude, loc.longitude)
        if dist <= radius_km:
            driver_user = amb.driver.user
            ambulances_for_ranking.append({
                "id": amb.id,
                "vehicle_number": amb.vehicle_number,
                "ambulance_type": amb.ambulance_type,
                "equipment_details": amb.equipment_details,
                "driver_id": amb.driver_id,
                "driver_name": driver_user.full_name if driver_user else "Emergency Driver",
                "driver_phone": driver_user.phone if driver_user else "911",
                "driver_photo": amb.driver.photo_url,
                "is_online": amb.availability.is_online,
                "latitude": loc.latitude,
                "longitude": loc.longitude,
                "distance_km": dist,
                "verification_status": amb.verification_status
            })

    if not ambulances_for_ranking:
        return []

    # 2. AI Ranking Engine: calculates suitability score and sorts
    ranked = ranking_engine.rank_ambulances(ambulances_for_ranking, emergency_type=emergency_type)

    response_items = []
    for item in ranked:
        response_items.append(AmbulanceNearbyResponse(
            id=item["id"],
            vehicle_number=item["vehicle_number"],
            ambulance_type=item["ambulance_type"],
            equipment_details=item.get("equipment_details"),
            driver_id=item["driver_id"],
            driver_name=item["driver_name"],
            driver_phone=item["driver_phone"],
            driver_photo=item.get("driver_photo"),
            is_online=item["is_online"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            distance_km=item["distance_km"],
            estimated_response_time_min=item["estimated_response_time"],
            suitability_score=item["suitability_score"],
            ranking=item["ranking"],
            verification_status=item["verification_status"]
        ))

    return response_items

@router.get("/{id}", response_model=AmbulanceResponse)
def get_ambulance(id: int, db: Session = Depends(get_db)):
    amb = db.query(Ambulance).filter(Ambulance.id == id).first()
    if not amb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ambulance not found")

    avail = amb.availability
    loc = amb.location
    loc_info = None
    if loc:
        loc_info = LocationInfo(
            latitude=loc.latitude,
            longitude=loc.longitude,
            heading=loc.heading,
            speed=loc.speed,
            address=loc.address,
            updated_at=loc.updated_at
        )

    return AmbulanceResponse(
        id=amb.id,
        driver_id=amb.driver_id,
        vehicle_number=amb.vehicle_number,
        ambulance_type=amb.ambulance_type,
        equipment_details=amb.equipment_details,
        verification_status=amb.verification_status,
        is_online=avail.is_online if avail else False,
        driver_name=amb.driver.user.full_name if amb.driver and amb.driver.user else None,
        driver_phone=amb.driver.user.phone if amb.driver and amb.driver.user else None,
        driver_photo=amb.driver.photo_url if amb.driver else None,
        location=loc_info,
        created_at=amb.created_at
    )
