import React, { useState, useEffect } from 'react';
import { driverApi } from '../../api/driver';
import { 
  Radio, 
  Power, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Truck,
  RefreshCw 
} from 'lucide-react';

export default function DriverDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [requests, setRequests] = useState({ calls: [], dispatches: [] });
  const [gpsStatus, setGpsStatus] = useState({
    active: false,
    lastUpdate: null,
    coords: null,
    error: null,
  });

  const fetchProfileAndRequests = async () => {
    try {
      const p = await driverApi.getProfile();
      setProfile(p);
      setIsOnline(p.ambulance?.is_online || false);
      if (p.ambulance?.current_latitude) {
        setGpsStatus(prev => ({
          ...prev,
          coords: {
            lat: p.ambulance.current_latitude,
            lon: p.ambulance.current_longitude,
          },
          lastUpdate: p.ambulance.last_location_time,
        }));
      }

      const reqData = await driverApi.getRequests();
      setRequests(reqData);
    } catch (err) {
      console.error('Failed to load driver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndRequests();
  }, []);

  // Live GPS Broadcast while Online
  useEffect(() => {
    if (!isOnline) {
      setGpsStatus(prev => ({ ...prev, active: false }));
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus(prev => ({ ...prev, error: 'GPS not supported on this device' }));
      return;
    }

    setGpsStatus(prev => ({ ...prev, active: true, error: null }));

    const sendCoords = (pos) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(5));
      const lon = parseFloat(pos.coords.longitude.toFixed(5));
      const heading = pos.coords.heading || 0.0;
      const speed = pos.coords.speed || 0.0;

      driverApi.updateLocation(lat, lon, heading, speed, 'Live In-Service Patrol')
        .then(() => {
          setGpsStatus({
            active: true,
            coords: { lat, lon },
            lastUpdate: new Date().toISOString(),
            error: null,
          });
        })
        .catch(err => {
          console.error('Location broadcast error:', err);
        });
    };

    const watchId = navigator.geolocation.watchPosition(
      sendCoords,
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        setGpsStatus(prev => ({ ...prev, error: err.message }));
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    // Periodic heartbeat every 15 seconds
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendCoords, () => {}, { enableHighAccuracy: true });
    }, 15000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  const handleToggleOnline = async () => {
    setToggling(true);
    const nextState = !isOnline;
    try {
      await driverApi.toggleAvailability(nextState);
      setIsOnline(nextState);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <RefreshCw size={32} className="animate-spin" color="var(--emergency-red)" style={{ margin: '0 auto 12px auto' }} />
        <div>Loading Driver Console...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 16px 60px 16px', maxWidth: '1000px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={profile?.photo_url || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80'}
            alt="Driver"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              objectFit: 'cover',
              border: '2px solid var(--border-strong)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem' }}>{profile?.full_name}</h1>
              {profile?.is_verified && (
                <span className="badge badge-online" title="Verified Driver">
                  <ShieldCheck size={14} /> Verified
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              License: <strong>{profile?.license_number}</strong> • Exp: {profile?.experience_years} years
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Phone: {profile?.phone}
            </div>
          </div>
        </div>

        {/* Master Availability Switch */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
            CURRENT DISPATCH STATUS
          </div>
          <button
            onClick={handleToggleOnline}
            disabled={toggling}
            className={isOnline ? 'btn-online' : 'btn-offline'}
            style={{
              fontSize: '1.05rem',
              padding: '14px 24px',
              fontWeight: 800,
            }}
          >
            <Power size={20} />
            {isOnline ? 'ONLINE / AVAILABLE' : 'OFFLINE / UNAVAILABLE'}
          </button>
        </div>
      </div>

      {/* Grid: Vehicle Status & GPS Live Telemetry */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {/* Vehicle Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Truck size={20} color="var(--emergency-red)" />
            <h2 style={{ fontSize: '1.1rem' }}>Registered Ambulance</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Vehicle Plate: </span>
              <strong>{profile?.ambulance?.vehicle_number}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Ambulance Type: </span>
              <span className={`badge ${profile?.ambulance?.ambulance_type === 'ICU' ? 'badge-icu' : 'badge-als'}`}>
                {profile?.ambulance?.ambulance_type}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Verification: </span>
              <span style={{ color: profile?.ambulance?.verification_status === 'APPROVED' ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                {profile?.ambulance?.verification_status}
              </span>
            </div>
            {profile?.ambulance?.equipment_details && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                <strong>Onboard Kit: </strong>
                {profile?.ambulance?.equipment_details}
              </div>
            )}
          </div>
        </div>

        {/* GPS Telemetry Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Navigation size={20} color={isOnline ? 'var(--status-online)' : 'var(--text-muted)'} />
              <h2 style={{ fontSize: '1.1rem' }}>Live GPS Radar Broadcast</h2>
            </div>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isOnline ? 'var(--status-online)' : '#64748b',
              boxShadow: isOnline ? '0 0 10px rgba(16, 185, 129, 0.8)' : 'none',
            }} />
          </div>

          {isOnline ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div style={{ color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={16} /> Actively broadcasting coordinates to emergency map
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Latitude: </span>
                <code>{gpsStatus.coords?.lat || 'Acquiring...'}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Longitude: </span>
                <code>{gpsStatus.coords?.lon || 'Acquiring...'}</code>
              </div>
              {gpsStatus.lastUpdate && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Last signal sent: {new Date(gpsStatus.lastUpdate).toLocaleTimeString()}
                </div>
              )}
              {gpsStatus.error && (
                <div style={{ color: '#fbbf24', fontSize: '0.82rem' }}>
                  GPS Note: {gpsStatus.error}
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              You are currently <strong>OFFLINE</strong>. Turn your status ON above to begin receiving emergency dispatch calls and appear on patient maps.
            </div>
          )}
        </div>
      </div>

      {/* Inbound Calls & Dispatches History */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PhoneCall size={20} color="var(--emergency-red)" />
            <h2 style={{ fontSize: '1.15rem' }}>Direct Emergency Call Logs</h2>
          </div>
          <button onClick={fetchProfileAndRequests} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh Logs
          </button>
        </div>

        {requests.calls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No incoming emergency calls logged yet. Ensure your status is ONLINE to receive dispatch alerts.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px' }}>Call ID</th>
                  <th style={{ padding: '10px' }}>Caller Contact</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Initiated Time</th>
                </tr>
              </thead>
              <tbody>
                {requests.calls.map((call) => (
                  <tr key={call.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px' }}>#{call.id}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{call.driver_phone}</td>
                    <td style={{ padding: '10px' }}>
                      <span className="badge badge-online">{call.status}</span>
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                      {new Date(call.call_initiated_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
