import api from './axios'

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
  getSales: () => api.get('/dashboard/sales'),
  getLogistics: () => api.get('/dashboard/logistics'),
}

export const vehiclesAPI = {
  getAll: (status) => api.get(status ? `/vehicles?status=${status}` : '/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status?status=${status}`),
  uploadImage: (id, formData) => api.post(`/vehicles/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getImages: (id) => api.get(`/vehicles/${id}/images`),
  deleteImage: (imageId) => api.delete(`/vehicles/images/${imageId}`),
  getImageUrl: (id, filename) => `${api.defaults.baseURL}/vehicles/${id}/images/${filename}`,
}

export const shipmentsAPI = {
  getAll: () => api.get('/shipments'),
  getById: (id) => api.get(`/shipments/${id}`),
  create: (data) => api.post('/shipments', data),
  addVehicle: (id, vehicleId) => api.post(`/shipments/${id}/vehicles/${vehicleId}`),
  updateStatus: (id, status) => api.patch(`/shipments/${id}/status?status=${status}`),
  track: (trackingNumber) => api.get(`/shipments/track/${trackingNumber}`),
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

export const reportsAPI = {
  getSales: () => api.get('/reports/sales'),
  getVehicles: () => api.get('/reports/vehicles'),
  getShipments: () => api.get('/reports/shipments'),
  exportSalesCsv: () => `${api.defaults.baseURL}/reports/sales/export`,
  exportVehiclesCsv: () => `${api.defaults.baseURL}/reports/vehicles/export`,
  exportShipmentsCsv: () => `${api.defaults.baseURL}/reports/shipments/export`,
}
