import { apiClient } from './client';

export const emergencyApi = {
  createRequest: (payload) =>
    apiClient('/emergency/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  searchNearby: (latitude, longitude, radiusKm = 30, emergencyType = 'GENERAL') =>
    apiClient(`/emergency/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}&emergency_type=${encodeURIComponent(emergencyType)}`),

  getRequest: (id) => apiClient(`/emergency/${id}`),

  getHistory: () => apiClient('/emergency/history'),

  recordCall: (ambulanceId, driverPhone, emergencyRequestId = null) =>
    apiClient('/emergency/call-record', {
      method: 'POST',
      body: JSON.stringify({
        ambulance_id: ambulanceId,
        driver_phone: driverPhone,
        emergency_request_id: emergencyRequestId,
      }),
    }),
};
