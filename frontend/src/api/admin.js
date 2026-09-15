import { apiClient } from './client';

export const adminApi = {
  getDashboardStats: () => apiClient('/admin/dashboard'),

  getUsers: (role = null) =>
    apiClient(`/admin/users${role ? `?role=${role}` : ''}`),

  toggleUserStatus: (id) =>
    apiClient(`/admin/users/${id}/toggle-status`, {
      method: 'PUT',
    }),

  getDrivers: () => apiClient('/admin/drivers'),

  getAmbulances: (status = null) =>
    apiClient(`/admin/ambulances${status ? `?status_filter=${status}` : ''}`),

  verifyAmbulance: (id, verificationStatus) =>
    apiClient(`/admin/ambulances/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verification_status: verificationStatus }),
    }),

  getEmergencyRequests: () => apiClient('/admin/emergency-requests'),

  getAuditLogs: () => apiClient('/admin/audit-logs'),
};
