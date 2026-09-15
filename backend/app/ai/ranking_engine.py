from typing import Dict, Any, List
from app.ai.eta_predictor import eta_predictor
from app.models.ambulance import AmbulanceType

SERVICE_COMPATIBILITY_MATRIX = {
    "CARDIAC": {
        AmbulanceType.ICU: 15.0,
        AmbulanceType.ADVANCED: 12.5,
        AmbulanceType.BASIC: 7.0,
        AmbulanceType.PATIENT_TRANSPORT: 2.0
    },
    "TRAUMA": {
        AmbulanceType.ADVANCED: 15.0,
        AmbulanceType.ICU: 14.0,
        AmbulanceType.BASIC: 8.5,
        AmbulanceType.PATIENT_TRANSPORT: 3.0
    },
    "RESPIRATORY": {
        AmbulanceType.ADVANCED: 15.0,
        AmbulanceType.ICU: 14.5,
        AmbulanceType.BASIC: 9.0,
        AmbulanceType.PATIENT_TRANSPORT: 3.0
    },
    "PREGNANCY": {
        AmbulanceType.ADVANCED: 15.0,
        AmbulanceType.BASIC: 13.0,
        AmbulanceType.ICU: 12.0,
        AmbulanceType.PATIENT_TRANSPORT: 6.0
    },
    "GENERAL": {
        AmbulanceType.BASIC: 15.0,
        AmbulanceType.ADVANCED: 15.0,
        AmbulanceType.ICU: 14.0,
        AmbulanceType.PATIENT_TRANSPORT: 10.0
    }
}

class AIRankingEngine:
    """
    AI-assisted multi-criteria decision ranking engine for emergency ambulances.
    Computes normalized (0-100) suitability score based on:
    - Distance (40 pts)
    - Response Time via ML ETA (25 pts)
    - Availability Status (20 pts)
    - Emergency Service Suitability (15 pts)
    """

    @staticmethod
    def calculate_distance_score(distance_km: float) -> float:
        if distance_km <= 0.5:
            return 40.0
        decay = max(0.0, 1.0 - (distance_km / 25.0))
        return round(40.0 * decay, 2)

    @staticmethod
    def calculate_response_time_score(eta_minutes: int) -> float:
        if eta_minutes <= 4:
            return 25.0
        decay = max(0.0, 1.0 - (max(0, eta_minutes - 4) / 26.0))
        return round(25.0 * decay, 2)

    @staticmethod
    def calculate_availability_score(is_online: bool) -> float:
        return 20.0 if is_online else 0.0

    @staticmethod
    def calculate_service_suitability_score(ambulance_type: AmbulanceType, emergency_type: str) -> float:
        etype = emergency_type.upper()
        type_scores = SERVICE_COMPATIBILITY_MATRIX.get(etype, SERVICE_COMPATIBILITY_MATRIX["GENERAL"])
        return type_scores.get(ambulance_type, 10.0)

    def evaluate_ambulance(
        self,
        ambulance_id: int,
        distance_km: float,
        is_online: bool,
        ambulance_type: AmbulanceType,
        emergency_type: str = "GENERAL"
    ) -> Dict[str, Any]:
        # 1. Predict ETA using Scikit-learn regression pipeline
        type_str = ambulance_type.value if hasattr(ambulance_type, "value") else str(ambulance_type)
        eta_minutes, confidence, method = eta_predictor.predict(distance_km, ambulance_type=type_str)

        # 2. Factor scores
        distance_score = self.calculate_distance_score(distance_km)
        availability_score = self.calculate_availability_score(is_online)
        response_score = self.calculate_response_time_score(eta_minutes)
        service_score = self.calculate_service_suitability_score(ambulance_type, emergency_type)

        # 3. Aggregate Suitability Score (0 - 100)
        total_score = distance_score + availability_score + response_score + service_score
        normalized_score = round(min(100.0, max(0.0, total_score)), 1)

        return {
            "ambulance_id": ambulance_id,
            "suitability_score": normalized_score,
            "distance": distance_km,
            "estimated_response_time": eta_minutes,
            "breakdown": {
                "distance_score": distance_score,
                "availability_score": availability_score,
                "response_time_score": response_score,
                "service_suitability_score": service_score,
                "eta_confidence": confidence,
                "eta_method": method
            }
        }

    def rank_ambulances(
        self,
        ambulances_data: List[Dict[str, Any]],
        emergency_type: str = "GENERAL"
    ) -> List[Dict[str, Any]]:
        scored_list = []
        for amb in ambulances_data:
            eval_res = self.evaluate_ambulance(
                ambulance_id=amb["id"],
                distance_km=amb["distance_km"],
                is_online=amb.get("is_online", True),
                ambulance_type=amb["ambulance_type"],
                emergency_type=emergency_type
            )
            # Merge additional info
            merged = {**amb, **eval_res}
            scored_list.append(merged)

        # Sort descending by suitability_score, then ascending by distance
        scored_list.sort(key=lambda x: (-x["suitability_score"], x["distance"]))

        # Assign rankings
        for rank_idx, item in enumerate(scored_list, 1):
            item["ranking"] = rank_idx

        return scored_list

ranking_engine = AIRankingEngine()
