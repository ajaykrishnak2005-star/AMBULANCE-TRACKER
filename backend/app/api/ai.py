from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.schemas.ai import (
    AIRankRequest,
    AIRankResponse,
    AIRankItem,
    ETAEstimateRequest,
    ETAEstimateResponse,
)
from app.models.ambulance import Ambulance, VerificationStatus, Availability
from app.models.location import Location
from app.services.geo_service import haversine_distance
from app.ai.ranking_engine import ranking_engine
from app.ai.eta_predictor import eta_predictor

router = APIRouter(prefix="/ai", tags=["AI & Machine Learning Engine"])

@router.post("/rank-ambulances", response_model=AIRankResponse)
def rank_ambulances(payload: AIRankRequest, db: Session = Depends(get_db)):
    query = (
        db.query(Ambulance)
        .join(Availability)
        .join(Location)
        .filter(
            Ambulance.verification_status == VerificationStatus.APPROVED,
            Availability.is_online == True
        )
    )

    if payload.ambulance_ids:
        query = query.filter(Ambulance.id.in_(payload.ambulance_ids))

    ambulances = query.all()
    candidates = []

    for a in ambulances:
        loc = a.location
        if not loc:
            continue
        dist = haversine_distance(payload.latitude, payload.longitude, loc.latitude, loc.longitude)
        candidates.append({
            "id": a.id,
            "ambulance_type": a.ambulance_type,
            "distance_km": dist,
            "is_online": a.availability.is_online if a.availability else False
        })

    if not candidates:
        return AIRankResponse(
            rankings=[],
            total_evaluated=0,
            model_version="1.0.0-rf-heuristic-ensemble",
            evaluated_at=datetime.utcnow()
        )

    ranked = ranking_engine.rank_ambulances(candidates, emergency_type=payload.emergency_type)

    results = []
    for item in ranked:
        results.append(AIRankItem(
            ambulance_id=item["id"],
            suitability_score=item["suitability_score"],
            distance=item["distance"],
            estimated_response_time=item["estimated_response_time"],
            ranking=item["ranking"],
            breakdown=item.get("breakdown")
        ))

    return AIRankResponse(
        rankings=results,
        total_evaluated=len(results),
        model_version="1.0.0-rf-heuristic-ensemble",
        evaluated_at=datetime.utcnow()
    )

@router.post("/estimate-response", response_model=ETAEstimateResponse)
def estimate_response_time(payload: ETAEstimateRequest):
    eta_min, conf, method = eta_predictor.predict(
        distance_km=payload.distance_km,
        ambulance_type=payload.ambulance_type,
        hour_of_day=payload.hour_of_day
    )
    return ETAEstimateResponse(
        distance_km=payload.distance_km,
        estimated_response_time_min=eta_min,
        confidence=conf,
        method=method
    )
