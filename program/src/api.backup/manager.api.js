import { apiClient } from './apiClient';

/**
 * Manager API
 * Handles all manager-related endpoints
 */
export const managerAPI = {
  // Dashboard
  dashboard: () => apiClient('/manager/dashboard'),
  branchOverview: () => apiClient('/manager/dashboard/branch'),
  inventorySummary: () => apiClient('/manager/dashboard/inventory'),
  salesSummary: () => apiClient('/manager/dashboard/sales'),
  notifications: () => apiClient('/manager/dashboard/notifications'),
  topSelling: () => apiClient('/manager/dashboard/top-selling'),

  // Staff Management
  createStaff: (staffData) =>
    apiClient('/manager/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    }),
  verifyStaffCode: (data) =>
    apiClient('/manager/staff/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resendStaffCode: (email) =>
    apiClient(`/auth/resend-verification`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  getStaffMembers: () => apiClient('/manager/staff'),
  updateStaff: (userId, data) =>
    apiClient(`/manager/staff/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  removeStaff: (userId) =>
    apiClient(`/manager/staff/${userId}`, {
      method: 'DELETE',
    }),
  resetStaffPassword: (userId, data) =>
    apiClient(`/manager/staff/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createManager: (managerData) =>
    apiClient('/manager/managers', {
      method: 'POST',
      body: JSON.stringify(managerData),
    }),

  // Medicine Management
  getAllMedicines: () => apiClient('/manager/medicines'),
  searchMedicines: (query) => apiClient(`/manager/medicines/search?q=${encodeURIComponent(query)}`),
  getMedicinesByCategory: (categoryId) => apiClient(`/manager/medicines/category/${categoryId}`),
  getMedicineById: (medicineId) => apiClient(`/manager/medicines/${medicineId}`),
  addMedicine: (medicineData) =>
    apiClient('/manager/medicines', {
      method: 'POST',
      body: JSON.stringify(medicineData),
    }),
  importMedicinesExcel: (formData) =>
    apiClient('/manager/medicines/import-excel', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for multipart/form-data
      body: formData,
    }),
  updateMedicineStock: (medicineId, data) =>
    apiClient(`/manager/medicines/${medicineId}/stock`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  removeMedicine: (medicineId) =>
    apiClient(`/manager/medicines/${medicineId}`, {
      method: 'DELETE',
    }),
  getSoldItemsHistory: () => apiClient('/manager/medicines/sold-items/history'),

  // Branch Management
  getAllBranches: () => apiClient('/manager/branches'),
  createBranch: (branchData) =>
    apiClient('/manager/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    }),
  requestBranch: (branchData) =>
    apiClient('/manager/branches/request', {
      method: 'POST',
      body: JSON.stringify(branchData),
    }),
  updateBranch: (id, data) =>
    apiClient(`/manager/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBranch: (id) =>
    apiClient(`/manager/branches/${id}`, {
      method: 'DELETE',
    }),
  activateBranch: (id) =>
    apiClient(`/manager/branches/${id}/activate`, {
      method: 'PUT',
    }),
  deactivateBranch: (id) =>
    apiClient(`/manager/branches/${id}/deactivate`, {
      method: 'PUT',
    }),

  // Sales Management
  createSale: (saleData) =>
    apiClient('/manager/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    }),
  processPayment: (saleId, data) =>
    apiClient(`/manager/sales/${saleId}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  processRefund: (saleId, data) =>
    apiClient(`/manager/sales/${saleId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Audit Trail
  getAuditTrail: () => apiClient('/manager/audit-trail'),
  getAuditTrailById: (id) => apiClient(`/manager/audit-trail/${id}`),

  // Pharmacy Management
  getPharmacies: () => apiClient('/manager/pharmacies'),
  generatePharmacyCode: (pharmacyId) => apiClient(`/manager/pharmacies/${pharmacyId}/generate-code`, { method: 'POST' }),
  verifyPharmacyCode: (code) => apiClient('/admin/pharmacies/verify-code', { method: 'POST', body: JSON.stringify({ code }) }),

  // Settings
  getRefundPolicy: () => apiClient('/manager/settings/refund-policy'),
  updateRefundPolicy: (data) =>
    apiClient('/manager/settings/refund-policy', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Reports
  getSalesReport: (period) => apiClient(`/manager/reports/sales?period=${period}`),
  getInventoryReport: () => apiClient('/manager/reports/inventory'),
  getStaffActivityReport: () => apiClient('/manager/reports/staff-activity'),

  // Notifications
  markNotificationRead: (id) =>
    apiClient(`/manager/dashboard/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Staff Activity Logs
  getStaffActivityLogs: (staffId) => apiClient(`/manager/staff/${staffId}/activity-logs`),

  // Additional Features
  getBranchApprovals: () => apiClient('/manager/branches/approvals'),
  requestMedicineRestock: (data) =>
    apiClient('/manager/medicines/restock', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  transferStock: (data) =>
    apiClient('/manager/medicines/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Chapa Payment Endpoints
  initializeChapaPayment: (data) =>
    apiClient('/manager/chapa/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyChapaPayment: (transactionId) => apiClient(`/manager/chapa/verify/${transactionId}`),
  checkChapaPaymentStatus: (transactionId) => apiClient(`/manager/chapa/status/${transactionId}`),
};
