import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      marginTop: 'auto',
      padding: '40px 0 24px 0',
    }}>
      <div className="container">
        {/* Safety Disclaimer Banner */}
        <div style={{
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}>
          <AlertTriangle color="var(--emergency-red)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#f87171', marginBottom: '4px' }}>
              CRITICAL EMERGENCY NOTICE & DISCLAIMER
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ambulance Tracker is a direct peer-to-peer discovery and communication platform connecting users directly with independent emergency ambulance operators. 
              This service is NOT a replacement for official government emergency dispatch centers. In life-threatening emergencies, always dial official municipal emergency numbers (112 / 911 / 108) simultaneously.
            </p>
          </div>
        </div>

        {/* Footer Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff', marginBottom: '8px' }}>
              AMBULANCE TRACKER
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              AI-assisted emergency ambulance discovery system enabling sub-minute positioning, intelligent suitability scoring, and direct one-tap driver calling.
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
              NATIONAL EMERGENCY LINES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a href="tel:112" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 600, fontSize: '0.88rem' }}>
                <PhoneCall size={15} /> Dial 112 (National Emergency)
              </a>
              <a href="tel:108" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                <PhoneCall size={15} /> Dial 108 (Disaster & Medical)
              </a>
              <a href="tel:102" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                <PhoneCall size={15} /> Dial 102 (Maternity Ambulance)
              </a>
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
              PLATFORM ARCHITECTURE
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Engineered with React Vite PWA, FastAPI REST Gateway, PostgreSQL/SQLAlchemy, Scikit-learn ETA pipeline, and Leaflet OpenStreetMap telemetry.
            </p>
          </div>
        </div>

        {/* Bottom Rights */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          <div>
            Ambulance Tracker Platform. Built for rapid emergency discovery.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} /> AI Ranking Engine v1.0 Operational
          </div>
        </div>
      </div>
    </footer>
  );
}
