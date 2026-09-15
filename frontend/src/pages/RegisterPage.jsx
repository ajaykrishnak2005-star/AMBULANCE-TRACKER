import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { driverApi } from '../api/driver';
import { UserPlus, Ambulance, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const [tab, setTab] = useState('USER'); // 'USER' or 'DRIVER'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  // User form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Driver form state
  const [licenseNumber, setLicenseNumber] = useState('');
  const [experienceYears, setExperienceYears] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ambulanceType, setAmbulanceType] = useState('BASIC');
  const [equipmentDetails, setEquipmentDetails] = useState('');

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        role: 'USER',
      });
      navigate('/emergency');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await driverApi.register({
        full_name: fullName,
        email,
        phone,
        password,
        license_number: licenseNumber,
        experience_years: parseInt(experienceYears, 10),
        vehicle_number: vehicleNumber,
        ambulance_type: ambulanceType,
        equipment_details: equipmentDetails,
      });
      setSuccessMsg('Driver and ambulance vehicle registered successfully! You can now sign in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Driver registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '50px 16px', maxWidth: '580px' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Create Your Account</h1>
          <p style={{ fontSize: '0.88rem' }}>Join the Ambulance Tracker emergency discovery network</p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          backgroundColor: 'var(--bg-base)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
        }}>
          <button
            type="button"
            onClick={() => { setTab('USER'); setError(null); }}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: tab === 'USER' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'USER' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <User size={16} />
            Emergency User
          </button>
          <button
            type="button"
            onClick={() => { setTab('DRIVER'); setError(null); }}
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: tab === 'DRIVER' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'DRIVER' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '0.88rem',
            }}
          >
            <Ambulance size={16} />
            Ambulance Driver
          </button>
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

        {successMsg && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#34d399',
            fontSize: '0.85rem',
          }}>
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {tab === 'USER' ? (
          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label>Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Krishnan"
                required
              />
            </div>

            <div>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maya@example.com"
                required
              />
            </div>

            <div>
              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                required
              />
            </div>

            <div>
              <label>Account Password (min 6 chars)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-emergency"
              style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Register As Emergency User'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleDriverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Driver Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  required
                />
              </div>
              <div>
                <label>Driver Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919800112233"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@transport.com"
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
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Commercial Driver License</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="DL-04-2018-0918"
                  required
                />
              </div>
              <div>
                <label>Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Vehicle Registration Plate</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="KA-05-EA-9911"
                  required
                />
              </div>
              <div>
                <label>Ambulance Tier</label>
                <select
                  value={ambulanceType}
                  onChange={(e) => setAmbulanceType(e.target.value)}
                >
                  <option value="BASIC">Basic Life Support (BLS)</option>
                  <option value="ADVANCED">Advanced Life Support (ALS)</option>
                  <option value="ICU">Mobile ICU / Cardiac</option>
                  <option value="PATIENT_TRANSPORT">Patient Transport Van</option>
                </select>
              </div>
            </div>

            <div>
              <label>Onboard Medical Equipment Summary</label>
              <input
                type="text"
                value={equipmentDetails}
                onChange={(e) => setEquipmentDetails(e.target.value)}
                placeholder="Oxygen, Stretcher, AED, Monitor, Ventilator"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-online"
              style={{ width: '100%', padding: '12px', marginTop: '10px', justifyContent: 'center' }}
            >
              <Ambulance size={18} />
              {loading ? 'Submitting Application...' : 'Register Ambulance & Driver'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--emergency-red)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
