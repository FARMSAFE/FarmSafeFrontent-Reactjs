import api from './index'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  check: () => api.get('/auth/check'),
  getProfile: () => api.get('/auth/profile'),
  getSessions: () => api.get('/auth/sessions'),
  revokeSession: (id) => api.delete(`/auth/sessions/${id}`),
  revokeAllSessions: () => api.delete('/auth/sessions'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const cropsApi = {
  getAll: (category) => api.get('/crops', { params: category ? { category } : {} }),
  getOne: (id) => api.get(`/crops/${id}`),
  create: (data) => api.post('/crops', data),
  update: (id, data) => api.patch(`/crops/${id}`, data),
  remove: (id) => api.delete(`/crops/${id}`),
}

export const listingsApi = {
  getAll: (filters) => api.get('/listings', { params: filters }),
  getOne: (id) => api.get(`/listings/${id}`),
  getMine: () => api.get('/listings/farmer/mine'),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.patch(`/listings/${id}`, data),
  remove: (id) => api.delete(`/listings/${id}`),
}

export const procurementApi = {
  getAll: (filters) => api.get('/procurement', { params: filters }),
  getOne: (id) => api.get(`/procurement/${id}`),
  getMine: () => api.get('/procurement/buyer/mine'),
  create: (data) => api.post('/procurement', data),
  update: (id, data) => api.patch(`/procurement/${id}`, data),
  remove: (id) => api.delete(`/procurement/${id}`),
}

export const dealsApi = {
  getAll: () => api.get('/deals'),
  getOne: (id) => api.get(`/deals/${id}`),
  getMine: () => api.get('/deals/mine'),
  create: (data) => api.post('/deals', data),
  updateStatus: (id, status) => api.patch(`/deals/${id}/status`, { status }),
}

export const messagesApi = {
  getAll: () => api.get('/messages'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  send: (data) => api.post('/messages', data),
  markRead: (id) => api.patch(`/messages/${id}/read`),
}

export const alertsApi = {
  getAll: (district) => api.get('/alerts', { params: district ? { district } : {} }),
  getOne: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.patch(`/alerts/${id}`, data),
  remove: (id) => api.delete(`/alerts/${id}`),
}

export const climateApi = {
  getDistricts: () => api.get('/climate/districts'),
  getByDistrict: (district, days) => api.get(`/climate/${district}`, { params: days ? { days } : {} }),
  getLatest: (district) => api.get(`/climate/${district}/latest`),
  create: (data) => api.post('/climate', data),
}

export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getMarketTrends: () => api.get('/analytics/market-trends'),
  getDistricts: () => api.get('/analytics/districts'),
  getMyActivity: () => api.get('/analytics/my-activity'),
}

export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/email/${email}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
  verifyEmail: (id) => api.post(`/users/${id}/verify-email`),
  verifyPhone: (id) => api.post(`/users/${id}/verify-phone`),
  updatePreferredCrops: (id, crops) => api.patch(`/users/${id}/preferred-crops`, { preferredCrops: crops }),
}
