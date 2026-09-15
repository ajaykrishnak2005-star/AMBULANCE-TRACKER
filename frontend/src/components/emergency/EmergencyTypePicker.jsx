import React from 'react';
import { HeartPulse, AlertTriangle, Wind, Baby, Cross } from 'lucide-react';

const EMERGENCY_TYPES = [
  { id: 'GENERAL', label: 'General / Illness', icon: Cross, desc: 'Fever, nausea, transit' },
  { id: 'CARDIAC', label: 'Cardiac / Heart', icon: HeartPulse, desc: 'Chest pain, arrest' },
  { id: 'TRAUMA', label: 'Trauma / Accident', icon: AlertTriangle, desc: 'Fracture, hemorrhage' },
  { id: 'RESPIRATORY', label: 'Respiratory', icon: Wind, desc: 'Severe breathlessness' },
  { id: 'PREGNANCY', label: 'Maternity', icon: Baby, desc: 'Active labour, bleeding' },
];

export default function EmergencyTypePicker({ selectedType, onChange }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
        SELECT EMERGENCY NATURE (OPTIMIZES AI VEHICLE MATCH):
      </label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
      }}>
        {EMERGENCY_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              style={{
                backgroundColor: isSelected ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-base)',
                border: isSelected ? '2px solid var(--emergency-red)' : '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 8px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={16} color={isSelected ? 'var(--emergency-red)' : 'var(--text-secondary)'} />
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                }}>
                  {type.label}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {type.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
