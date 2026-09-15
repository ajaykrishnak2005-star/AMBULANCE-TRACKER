import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { emergencyApi } from '../api/emergency';
import AmbulanceMap from '../components/map/AmbulanceMap';
import AmbulanceCard from '../components/emergency/AmbulanceCard';
import EmergencyTypePicker from '../components/emergency/EmergencyTypePicker';
import { 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  Phone, 
  CheckCircle, 
  Navigation, 
  Info,
  SlidersHorizontal 
} from 'lucide-react';

export default function EmergencyPage() {
  const { 
    latitude, 
    longitude, 
    address, 
    isLocating, 
    locationError, 
    detectLocation, 
    setManualLocation 
  } = useLocation();

  const { user } = useAuth();

  const [emergencyType, setEmergencyType] = useState('GENERAL');
  const [ambulances, setAmbulances] = useState([]);
  const [loadingAmbulances, setLoadingAmbulances] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [searchRadius, setSearchRadius] = useState(35);

  // Manual location modal / toggle
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualLat, setManualLat] = useState(latitude);
  const [manualLon, setManualLon] = useState(longitude);
  const [manualAddress, setManualAddress] = useState(address);

  // Emergency request details
  const [patientName, setPatientName] = useState(user?.full_name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [emergencyRequestId, setEmergencyRequestId] = useState(null);
  const [callStatusMessage, setCallStatusMessage] = useState(null);

  // Fetch nearby ambulances
  const fetchNearbyAmbulances = async () => {
    if (!latitude || !longitude) return;
    setLoadingAmbulances(true);
    try {
      const results = await emergencyApi.searchNearby(
        latitude,
        longitude,
        searchRadius,
        emergencyType
      );
      setAmbulances(results);
      if (results.length > 0 && (!selectedAmbulance || !results.find(a => a.id === selectedAmbulance.id))) {
        setSelectedAmbulance(results[0]);
      }
    } catch (err) {
      console.error('Failed to search nearby ambulances:', err);
    } finally {
      setLoadingAmbulances(false);
    }
  };

  useEffect(() => {
    fetchNearbyAmbulances();
  }, [latitude, longitude, emergencyType, searchRadius]);

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    setManualLocation(manualLat, manualLon, manualAddress);
    setShowManualForm(false);
  };

  const handleCallAmbulance = async (amb) => {
    // 1. If request hasn't been logged yet, log it
    let reqId = emergencyRequestId;
    try {
      if (!reqId) {
        const req = await emergencyApi.createRequest({
          patient_name: patientName || 'Emergency Patient',
          patient_phone: patientPhone || amb.driver_phone,
          emergency_type: emergencyType,
          latitude,
          longitude,
          address,
          selected_ambulance_id: amb.id,
        });
        reqId = req.id;
        setEmergencyRequestId(req.id);
      }

      // 2. Record call
      await emergencyApi.recordCall(amb.id, amb.driver_phone, reqId);
      setCallStatusMessage(`Emergency call dispatched to ${amb.driver_name} (${amb.vehicle_number}). Response team alerted.`);
    } catch (err) {
      console.error('Failed to record emergency call:', err);
    }
  };

  return (
    <div className="container" style={{ padding: '24px 16px 60px 16px' }}>
      {/* Top Location Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emergency-red)',
            flexShrink: 0,
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emergency-red)', letterSpacing: '0.04em' }}>
              EMERGENCY LOCATION PINPOINT
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>
              {address}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              GPS: {latitude.toFixed(4)}N, {longitude.toFixed(4)}E
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Navigation size={16} className={isLocating ? 'animate-spin' : ''} />
            {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
          </button>

          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <SlidersHorizontal size={16} />
            {showManualForm ? 'Hide Coordinates' : 'Manual Coordinates'}
          </button>
        </div>
      </div>

      {/* Location Error Alert */}
      {locationError && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          color: '#fbbf24',
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{locationError}</span>
        </div>
      )}

      {/* Manual Coordinates Form Modal/Dropdown */}
      {showManualForm && (
        <form onSubmit={handleManualLocationSubmit} style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'end',
        }}>
          <div>
            <label>Latitude (-90 to 90)</label>
            <input
              type="number"
              step="any"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Longitude (-180 to 180)</label>
            <input
              type="number"
              step="any"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Emergency Landmark / Street</label>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="e.g. Ring Road Junction"
            />
          </div>
          <div>
            <button type="submit" className="btn-emergency" style={{ width: '100%' }}>
              Apply Location
            </button>
          </div>
        </form>
      )}

      {/* Call Dispatched Notification Banner */}
      {callStatusMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#34d399',
        }}>
          <CheckCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Direct Call Initiated</div>
            <div style={{ fontSize: '0.85rem' }}>{callStatusMessage}</div>
          </div>
        </div>
      )}

      {/* Emergency Nature Selector */}
      <EmergencyTypePicker selectedType={emergencyType} onChange={setEmergencyType} />

      {/* Main Grid: Interactive Map + Sorted Ambulances */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start',
      }}>
        {/* Left Column: Interactive Map */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="var(--emergency-red)" />
              Real-Time Ambulance Radar
            </h2>
            <button
              onClick={fetchNearbyAmbulances}
              disabled={loadingAmbulances}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              title="Refresh radar"
            >
              <RefreshCw size={14} className={loadingAmbulances ? 'animate-spin' : ''} />
              {loadingAmbulances ? 'Scanning...' : 'Refresh'}
            </button>
          </div>

          <AmbulanceMap
            userLocation={{ latitude, longitude }}
            ambulances={ambulances}
            selectedAmbulance={selectedAmbulance}
            onSelectAmbulance={(amb) => setSelectedAmbulance(amb)}
            onCallAmbulance={handleCallAmbulance}
          />

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} /> Click any vehicle pin on the map to inspect equipment and dial driver directly.
          </div>
        </div>

        {/* Right Column: AI Sorted Ambulance List */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>Nearby Available Ambulances</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {ambulances.length} verified ambulances found • AI Ranked by suitability
              </div>
            </div>
          </div>

          {loadingAmbulances && ambulances.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw size={32} className="animate-spin" color="var(--emergency-red)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontWeight: 700 }}>Scanning Emergency Perimeter...</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Querying active GPS beacons and computing response time matrix...
              </div>
            </div>
          ) : ambulances.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
              <AlertCircle size={36} color="var(--status-warning)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No Available Ambulances Found</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '18px' }}>
                No active ambulances are currently broadcasting within a {searchRadius} km radius of your emergency coordinates.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href="tel:112" className="btn-emergency" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                  <Phone size={18} /> DIAL NATIONAL EMERGENCY 112
                </a>
                <button
                  onClick={() => setSearchRadius(searchRadius + 20)}
                  className="btn-secondary"
                  style={{ justifyContent: 'center' }}
                >
                  Expand Search Radius (+20 km)
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {ambulances.map((amb) => (
                <AmbulanceCard
                  key={amb.id}
                  ambulance={amb}
                  isSelected={selectedAmbulance && selectedAmbulance.id === amb.id}
                  onSelect={() => setSelectedAmbulance(amb)}
                  onCall={handleCallAmbulance}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
