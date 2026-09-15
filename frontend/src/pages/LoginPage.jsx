import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, ShieldCheck, Ambulance, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userInfo = await login(email, password);
      if (userInfo.role === 'ADMIN') {
        navigate('/admin');
      } else if (userInfo.role === 'DRIVER') {
        navigate('/driver');
      } else {
        navigate('/emergency');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="container" style={{ padding: '60px 16px', maxWidth: '480px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emergency-red)',
            marginBottom: '12px',
          }}>
            <LogIn size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Sign In to Ambulance Tracker</h1>
          <p style={{ fontSize: '0.88rem' }}>Access your dispatch records, driver patrol, or control center</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@ambulance.org"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-emergency"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Testing */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Instant Demo Account Fill:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@ambulance.org', 'AdminPassword123')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={14} color="var(--status-warning)" />
              Admin: admin@ambulance.org
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('driver.rajesh@ambulance.org', 'DriverPassword123')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <Ambulance size={14} color="var(--status-online)" />
              Driver (ICU): driver.rajesh@ambulance.org
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('patient@ambulance.org', 'UserPassword123')}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 10px', justifyContent: 'flex-start' }}
            >
              <User size={14} color="#60a5fa" />
              Patient User: patient@ambulance.org
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--emergency-red)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
