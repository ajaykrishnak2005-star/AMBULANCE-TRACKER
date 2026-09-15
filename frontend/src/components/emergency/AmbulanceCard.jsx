import React from 'react';
import { Phone, Clock, MapPin, Award, CheckCircle, ShieldAlert } from 'lucide-react';

export default function AmbulanceCard({
  ambulance,
  isSelected,
  onSelect,
  onCall,
}) {
  const {
    id,
    driver_name,
    driver_phone,
    driver_photo,
    vehicle_number,
    ambulance_type,
    distance_km,
    estimated_response_time_min,
    suitability_score,
    is_online,
    ranking,
    equipment_details,
  } = ambulance;

  const getScoreColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#60a5fa';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getBadgeClass = (type) => {
    if (type === 'ICU') return 'badge badge-icu';
    if (type === 'ADVANCED') return 'badge badge-als';
    return 'badge badge-bls';
  };

  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: isSelected ? '2px solid var(--emergency-red)' : '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative',
        boxShadow: isSelected ? '0 0 16px var(--emergency-red-glow)' : 'none',
      }}
    >
      {/* Ranking Badge if top 3 */}
      {ranking <= 3 && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '16px',
          backgroundColor: ranking === 1 ? 'var(--emergency-red)' : '#1e293b',
          border: '1px solid var(--border-strong)',
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 'var(--radius-pill)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <Award size={12} />
          AI TOP #{ranking}
        </div>
      )}

      {/* Main Row: Photo + Info */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '12px' }}>
        <img
          src={driver_photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80'}
          alt={driver_name}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            objectFit: 'cover',
            border: '2px solid var(--border-strong)',
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {driver_name}
            </h3>
            <span className={getBadgeClass(ambulance_type)}>
              {ambulance_type}
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Vehicle: <strong style={{ color: 'var(--text-primary)' }}>{vehicle_number}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.78rem' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: is_online ? 'var(--status-online)' : 'var(--status-offline)',
            }} />
            <span style={{ color: is_online ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
              {is_online ? 'AVAILABLE NOW' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Row: Distance, ETA, AI Score */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px',
        marginBottom: '14px',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DISTANCE</div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            {distance_km} km
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>EST. ETA</div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10b981' }}>
            ~{estimated_response_time_min} min
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI MATCH</div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: getScoreColor(suitability_score) }}>
            {suitability_score}/100
          </div>
        </div>
      </div>

      {equipment_details && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.3 }}>
          Equipped with: {equipment_details}
        </div>
      )}

      {/* One-Tap Call Action */}
      <a
        href={`tel:${driver_phone}`}
        onClick={(e) => {
          e.stopPropagation();
          onCall(ambulance);
        }}
        className="btn-emergency"
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '1rem',
          fontWeight: 800,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Phone size={18} />
        CALL DRIVER NOW ({driver_phone})
      </a>
    </div>
  );
}
