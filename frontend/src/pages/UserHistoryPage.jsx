import React, { useState, useEffect } from 'react';
import { emergencyApi } from '../api/emergency';
import { Clock, AlertCircle, Phone, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

export default function UserHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await emergencyApi.getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="container" style={{ padding: '32px 16px 60px 16px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={22} color="var(--emergency-red)" />
            Emergency Request History
          </h1>
          <p style={{ fontSize: '0.85rem' }}>Review all logged emergency discovery dispatches</p>
        </div>

        <button onClick={fetchHistory} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <RefreshCw size={28} className="animate-spin" color="var(--emergency-red)" style={{ margin: '0 auto 12px auto' }} />
          <div>Loading emergency records...</div>
        </div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
          <AlertCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3>No Emergency Requests Logged</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            You haven't initiated any ambulance discovery requests from this account yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {history.map((item) => (
            <div key={item.id} className="card card-highlight">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    REQUEST #{item.id} • {new Date(item.created_at).toLocaleString()}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginTop: '2px' }}>
                    Patient: {item.patient_name}
                  </h3>
                </div>
                <span className="badge badge-online">
                  {item.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> {item.patient_phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> {item.address || `${item.latitude}, ${item.longitude}`}
                </div>
                <div>
                  Emergency Nature: <strong style={{ color: '#f8fafc' }}>{item.emergency_type}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
