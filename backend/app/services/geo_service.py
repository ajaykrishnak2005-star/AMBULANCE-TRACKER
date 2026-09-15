import math
from typing import Tuple

EARTH_RADIUS_KM = 6371.0088

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in kilometers between two points
    on the earth (specified in decimal degrees).
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    distance = EARTH_RADIUS_KM * c
    return round(distance, 2)

def get_bounding_box(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
    """
    Returns (min_lat, max_lat, min_lon, max_lon) for an approximate bounding box
    to efficiently filter database records before exact haversine calculation.
    """
    # 1 deg latitude is roughly 111.32 km
    lat_delta = radius_km / 111.32
    
    # 1 deg longitude depends on latitude
    lon_delta = radius_km / (111.32 * math.cos(math.radians(lat))) if math.cos(math.radians(lat)) > 0.0001 else radius_km / 111.32
    
    return (
        lat - lat_delta,
        lat + lat_delta,
        lon - abs(lon_delta),
        lon + abs(lon_delta)
    )
