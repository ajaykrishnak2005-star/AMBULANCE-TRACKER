import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import InstallPrompt from './components/pwa/InstallPrompt';

import HomePage from './pages/HomePage';
import EmergencyPage from './pages/EmergencyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserHistoryPage from './pages/UserHistoryPage';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Validating credentials...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <InstallPrompt />
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public / Core Emergency Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Authenticated User Routes */}
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                      <UserHistoryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Driver Routes */}
                <Route
                  path="/driver"
                  element={
                    <ProtectedRoute allowedRoles={['DRIVER', 'ADMIN']}>
                      <DriverDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LocationProvider>
    </AuthProvider>
  );
}
