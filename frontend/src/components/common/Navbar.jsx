import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Ambulance, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Clock, 
  User as UserIcon,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--emergency-red)',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px var(--emergency-red-glow)',
          }}>
            <Ambulance size={22} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              AMBULANCE TRACKER
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Emergency Discovery
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '20px' }} className="desktop-nav">
          <Link
            to="/emergency"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isActive('/emergency') ? 'var(--emergency-red)' : 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isActive('/emergency') ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
            }}
          >
            <Phone size={16} />
            Find Ambulance
          </Link>

          {isAuthenticated && role === 'DRIVER' && (
            <Link
              to="/driver"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isActive('/driver') ? 'var(--status-online)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <LayoutDashboard size={16} />
              Driver Console
            </Link>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <Link
              to="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isActive('/admin') ? 'var(--status-warning)' : 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <ShieldCheck size={16} />
              Admin Center
            </Link>
          )}

          {isAuthenticated && role === 'USER' && (
            <Link
              to="/history"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isActive('/history') ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <Clock size={16} />
              Emergency History
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '1px solid var(--border-strong)', paddingLeft: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.full_name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {user?.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  color: 'var(--text-secondary)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-emergency" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'block',
            padding: '8px',
            color: 'var(--text-primary)',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-strong)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <Link
            to="/emergency"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-emergency"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Phone size={18} />
            Find Nearby Ambulance
          </Link>

          {isAuthenticated && role === 'DRIVER' && (
            <Link
              to="/driver"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <LayoutDashboard size={16} />
              Driver Console
            </Link>
          )}

          {isAuthenticated && role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <ShieldCheck size={16} />
              Admin Center
            </Link>
          )}

          {isAuthenticated && (
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Clock size={16} />
              Emergency History
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Signed in as: <strong>{user?.full_name}</strong> ({user?.role})
              </div>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-secondary"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-emergency"
                style={{ flex: 1, textAlign: 'center' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Media query styling for responsive navbar */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
