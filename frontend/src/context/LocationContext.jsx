import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

// Default coordinates (urban center emergency test grid)
const DEFAULT_LAT = 12.9716;
const DEFAULT_LON = 77.5946;

export function LocationProvider({ children }) {
  const [coordinates, setCoordinates] = useState({
    latitude: DEFAULT_LAT,
    longitude: DEFAULT_LON,
  });
  const [address, setAddress] = useState('Central Emergency Zone, MG Road');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isManual, setIsManual] = useState(false);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please enter your location manually.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(5));
        const lon = parseFloat(position.coords.longitude.toFixed(5));
        setCoordinates({ latitude: lat, longitude: lon });
        setAddress(`GPS Position: ${lat.toFixed(4)}N, ${lon.toFixed(4)}E`);
        setIsManual(false);
        setIsLocating(false);
      },
      (error) => {
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access was denied. You can enter your emergency coordinates or use the default zone.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable. Switched to manual entry mode.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Using last known emergency sector.';
        }
        setLocationError(msg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const setManualLocation = (lat, lon, customAddress = '') => {
    setCoordinates({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
    if (customAddress) {
      setAddress(customAddress);
    } else {
      setAddress(`Manual Location (${lat}, ${lon})`);
    }
    setIsManual(true);
    setLocationError(null);
  };

  useEffect(() => {
    // Attempt detection on first mount
    detectLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        address,
        isLocating,
        locationError,
        isManual,
        detectLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
