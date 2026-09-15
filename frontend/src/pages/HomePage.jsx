import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PhoneCall, 
  MapPin, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Ambulance, 
  Radio, 
  Activity, 
  UserPlus 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '70px 0 60px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '840px' }}>
          {/* Status Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            border: '1px solid rgba(220, 38, 38, 0.35)',
            borderRadius: 'var(--radius-pill)',
            padding: '6px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#f87171',
            marginBottom: '24px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            <Radio size={14} className="animate-pulse" />
            24/7 AI-Assisted Emergency Dispatch Discovery
          </div>

          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '20px',
          }}>
            Find a nearby ambulance when every second matters.
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '680px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Instant GPS positioning, real-time vehicle telemetry, and AI suitability ranking. 
            Connect with verified ambulance drivers in your immediate vicinity with a single tap.
          </p>

          {/* Primary Action */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            justifyContent: 'center',
          }}>
            <Link
              to="/emergency"
              className="btn-emergency"
              style={{
                fontSize: '1.25rem',
                padding: '16px 36px',
                fontWeight: 800,
                borderRadius: 'var(--radius-md)',
                letterSpacing: '-0.01em',
              }}
            >
              <PhoneCall size={24} />
              FIND NEARBY AMBULANCE
            </Link>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/register" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                <UserPlus size={16} />
                Register as Driver / Provider
              </Link>
              <Link to="/login" className="btn-secondary" style={{ fontSize: '0.9rem' }}>
                Sign In to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Workflow Section */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emergency-red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            RAPID RESPONSE PIPELINE
          </div>
          <h2>How It Works In An Emergency</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(220, 38, 38, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emergency-red)',
              marginBottom: '14px',
            }}>
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>1. Share GPS Location</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              One-click browser GPS positioning accurately pinpoints your emergency coordinates, with manual address fallback if needed.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(37, 99, 235, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              marginBottom: '14px',
            }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>2. AI Suitability Match</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              Our AI engine evaluates live proximity, traffic-aware ETA, and emergency nature (Cardiac, Trauma, ICU) to rank available ambulances.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              marginBottom: '14px',
            }}>
              <Ambulance size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>3. Live Interactive Map</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              Inspect verified ambulances moving on OpenStreetMap, review driver credentials, vehicle equipment, and estimated response minutes.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              marginBottom: '14px',
            }}>
              <PhoneCall size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>4. One-Tap Direct Calling</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              Dial the ambulance driver directly with no third-party call center delays. Automatic call logs ensure complete audit visibility.
            </p>
          </div>
        </div>
      </section>

      {/* Ambulance Types Guide */}
      <section className="container">
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '32px',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ marginBottom: '8px' }}>Specialized Emergency Vehicle Fleet</h2>
            <p>Our platform indexes multiple tiers of medical response vehicles to match patient urgency.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            <div style={{ borderLeft: '3px solid #dc2626', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>ICU / CARDIAC AMBULANCE</div>
              <p style={{ fontSize: '0.85rem' }}>
                Equipped with transport ventilators, biphasic defibrillators, multi-parameter ICU monitors, and critical care paramedics.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #2563eb', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '4px' }}>ADVANCED LIFE SUPPORT (ALS)</div>
              <p style={{ fontSize: '0.85rem' }}>
                Features airway kits, IV infusion apparatus, trauma immobilization splints, and emergency drug reserves.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>BASIC LIFE SUPPORT (BLS)</div>
              <p style={{ fontSize: '0.85rem' }}>
                Continuous oxygen supply, foldaway stretcher, automated external defibrillator (AED), and emergency first-aid kit.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #64748b', paddingLeft: '12px' }}>
              <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: '4px' }}>PATIENT TRANSPORT</div>
              <p style={{ fontSize: '0.85rem' }}>
                Wheelchair-accessible non-emergency transport for stable patients, dialysis transfers, and clinical mobility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Driver Registration CTA */}
      <section className="container">
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
        }}>
          <Ambulance size={36} color="var(--status-online)" />
          <h2>Are You An Ambulance Driver Or Fleet Owner?</h2>
          <p style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Register your vehicle, broadcast live availability, receive direct emergency calls from nearby patients, and reduce transit latency.
          </p>
          <Link to="/register" className="btn-online" style={{ marginTop: '8px' }}>
            <ShieldCheck size={18} />
            Register Ambulance Fleet Free
          </Link>
        </div>
      </section>
    </div>
  );
}
