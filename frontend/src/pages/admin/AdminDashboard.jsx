import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { 
  Users, 
  Truck, 
  Radio, 
  AlertCircle, 
  Clock, 
  PhoneCall, 
  ShieldCheck, 
  Check, 
  X, 
  Activity,
  FileText,
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const [statsData, ambData, logsData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAmbulances(),
        adminApi.getAuditLogs(),
      ]);
      setStats(statsData);
      setAmbulances(ambData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (id, status) => {
    setVerifyingId(id);
    try {
      await adminApi.verifyAmbulance(id, status);
      await fetchAdminData();
    } catch (err) {
      alert('Verification update failed: ' + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <RefreshCw size={32} className="animate-spin" color="var(--emergency-red)" style={{ margin: '0 auto 12px auto' }} />
        <div>Loading Administrative Command Center...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 16px 60px 16px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            OPERATIONAL CONTROL CENTER
          </div>
          <h1 style={{ fontSize: '1.6rem' }}>System Administrator Dashboard</h1>
        </div>

        <button onClick={fetchAdminData} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={15} /> Refresh All Metrics
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>REGISTERED FLEET</span>
            <Truck size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.registered_ambulances}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Across {stats?.registered_drivers} drivers
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>LIVE AVAILABLE</span>
            <Radio size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
            {stats?.available_ambulances}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Broadcasting GPS coordinates
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>ACTIVE DISPATCHES</span>
            <AlertCircle size={18} color="var(--emergency-red)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f87171' }}>
            {stats?.active_emergency_requests}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {stats?.completed_requests} historical completed
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>TOTAL CALLS</span>
            <PhoneCall size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats?.total_call_records}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Avg response: {stats?.average_response_time_min}m
          </div>
        </div>
      </div>

      {/* Fleet Verification & Management Table */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>Ambulance Fleet Verification & Status</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Authorize and monitor emergency response vehicles in the network
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '10px' }}>Vehicle Reg</th>
                <th style={{ padding: '10px' }}>Driver Name</th>
                <th style={{ padding: '10px' }}>Type</th>
                <th style={{ padding: '10px' }}>Online Status</th>
                <th style={{ padding: '10px' }}>Verification</th>
                <th style={{ padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ambulances.map((amb) => (
                <tr key={amb.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: '#f8fafc' }}>
                    {amb.vehicle_number}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {amb.driver_name} ({amb.driver_phone})
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge ${amb.ambulance_type === 'ICU' ? 'badge-icu' : 'badge-als'}`}>
                      {amb.ambulance_type}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge ${amb.is_online ? 'badge-online' : 'badge-offline'}`}>
                      {amb.is_online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <strong style={{
                      color: amb.verification_status === 'APPROVED' ? '#34d399' : amb.verification_status === 'PENDING' ? '#fbbf24' : '#ef4444'
                    }}>
                      {amb.verification_status}
                    </strong>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleVerify(amb.id, 'APPROVED')}
                        disabled={verifyingId === amb.id || amb.verification_status === 'APPROVED'}
                        className="btn-online"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        title="Approve Ambulance"
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => handleVerify(amb.id, 'REJECTED')}
                        disabled={verifyingId === amb.id || amb.verification_status === 'REJECTED'}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#f87171' }}
                        title="Reject Ambulance"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FileText size={20} color="var(--status-info)" />
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>Platform Security & Audit Logs</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time chronological trace of logins, verifications, and emergency dispatches
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '360px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '8px' }}>Time (UTC)</th>
                <th style={{ padding: '8px' }}>Action</th>
                <th style={{ padding: '8px' }}>Entity</th>
                <th style={{ padding: '8px' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 30).map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px', color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', fontWeight: 700, color: '#f8fafc' }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {log.entity_type} #{log.entity_id || '-'}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
