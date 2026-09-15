import { apiClient } from './client';

export const driverApi = {
  register: (payload) =>
    apiClient('/drivers/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () => apiClient('/drivers/profile'),

  updateProfile: (payload) =>
    apiClient('/drivers/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  toggleAvailability: (isOnline) =>
    apiClient('/drivers/availability', {
      method: 'PUT',
      body: JSON.stringify({ is_online: isOnline }),
    }),

  updateLocation: (latitude, longitude, heading = 0, speed = 0, address = '') =>
    apiClient('/drivers/location', {
      method: 'PUT',
      body: JSON.stringify({
        latitude,
        longitude,
        heading,
        speed,
        address,
      }),
    }),

  getRequests: () => apiClient('/drivers/requests'),
};
