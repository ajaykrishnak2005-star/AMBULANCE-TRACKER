from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AIRankItem(BaseModel):
    ambulance_id: int
    suitability_score: float
    distance: float
    estimated_response_time: int
    ranking: int
    breakdown: Optional[Dict[str, Any]] = None

class AIRankRequest(BaseModel):
    emergency_type: str = "GENERAL"
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    ambulance_ids: Optional[List[int]] = None

class AIRankResponse(BaseModel):
    rankings: List[AIRankItem]
    total_evaluated: int
    model_version: str
    evaluated_at: datetime

class ETAEstimateRequest(BaseModel):
    distance_km: float = Field(..., ge=0.0)
    ambulance_type: str = "BASIC"
    hour_of_day: Optional[int] = None

class ETAEstimateResponse(BaseModel):
    distance_km: float
    estimated_response_time_min: int
    confidence: float
    method: str
