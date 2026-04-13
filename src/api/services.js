import api from './axios'

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status?status=${status}`),
}

export const shipmentsAPI = {
  getAll: () => api.get('/shipments'),
  getById: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  addVehicle: (id, vehicleId) => api.post(`/shipments/${id}/vehicles/${vehicleId}`),
  updateStatus: (id, status) => api.patch(`/shipments/${id}/status?status=${status}`),
}

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  addVehicle: (vehicleId, location) => api.post(`/inventory/vehicle/${vehicleId}?location=${location}`),
}

export const customersAPI = {
  getAll: () => api.get('/sales/customers'),
  create: (data) => api.post('/sales/customers', data),
}

export const salesAPI = {
  getAll: () => api.get('/sales'),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  complete: (id) => api.patch(`/sales/${id}/complete`),
}

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  getBySale: (saleId) => api.get(`/payments/sale/${saleId}`),
  create: (data) => api.post('/payments', data),
}

export const documentsAPI = {
  getAll: (relatedType, relatedId) => api.get(`/documents?relatedType=${relatedType}&relatedId=${relatedId}`),
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
}
