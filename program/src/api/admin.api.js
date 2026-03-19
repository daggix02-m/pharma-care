import { apiClient } from './apiClient';

/**
 * Admin API
 * Handles all admin-related endpoints
 *
 * Verified endpoints (tested 2026-03-14):
 *
 * Pharmacies: GET/POST/PUT/DELETE /admin/pharmacies, /admin/pharmacies/:id
 *   - NO pending/approve/reject/activate/deactivate endpoints exist
 *
 * Branches: Full lifecycle
 *   - GET /admin/branches, /admin/branches/pending, /admin/branches/:id
 *   - PUT approve/reject/activate/deactivate
 *   - DELETE /admin/branches/:id
 *
 * Managers: Full lifecycle
 *   - GET /admin/managers (returns {all, pending, activated} with counts)
 *   - GET /admin/managers/pending, /admin/managers/activated
 *   - GET /admin/managers/branch/:branch_id
 *   - PUT activate/deactivate, PUT update, DELETE, POST reset-password
 *
 * Profile:
 *   - GET /profile/me, /profile/users, /profile/users/:user_id
 */
export const adminAPI = {
  // Dashboard
  dashboard: () => apiClient('/admin/dashboard'),
  totalBranches: () => apiClient('/admin/dashboard/branches'),
  totalUsers: () => apiClient('/admin/dashboard/users'),
  totalSales: () => apiClient('/admin/dashboard/sales'),

  // Pharmacy Management (CRUD only - no lifecycle endpoints)
  getPharmacies: () => apiClient('/admin/pharmacies'),
  createPharmacy: (data) => apiClient('/admin/pharmacies', { method: 'POST', body: JSON.stringify(data) }),
  updatePharmacy: (id, data) => apiClient(`/admin/pharmacies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePharmacy: (id) => apiClient(`/admin/pharmacies/${id}`, { method: 'DELETE' }),

  // Branch Management (Full lifecycle)
  getBranches: () => apiClient('/admin/branches'),
  getPendingBranches: () => apiClient('/admin/branches/pending'),
  getBranchById: (id) => apiClient(`/admin/branches/${id}`),
  approveBranch: (id) => apiClient(`/admin/branches/${id}/approve`, { method: 'PUT' }),
  rejectBranch: (id) => apiClient(`/admin/branches/${id}/reject`, { method: 'PUT' }),
  activateBranch: (id) => apiClient(`/admin/branches/${id}/activate`, { method: 'PUT' }),
  deactivateBranch: (id) => apiClient(`/admin/branches/${id}/deactivate`, { method: 'PUT' }),
  updateBranch: (id, data) => apiClient(`/admin/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBranch: (id) => apiClient(`/admin/branches/${id}`, { method: 'DELETE' }),

  // Manager Management (Full lifecycle)
  getAllManagers: () => apiClient('/admin/managers'),
  getPendingManagers: () => apiClient('/admin/managers/pending'),
  getActivatedManagers: () => apiClient('/admin/managers/activated'),
  getManagersByBranch: (branchId) => apiClient(`/admin/managers/branch/${branchId}`),
  activateManager: (userId) => apiClient(`/admin/managers/${userId}/activate`, { method: 'PUT' }),
  deactivateManager: (userId) => apiClient(`/admin/managers/${userId}/deactivate`, { method: 'PUT' }),
  updateManager: (id, data) => apiClient(`/admin/managers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteManager: (id) => apiClient(`/admin/managers/${id}`, { method: 'DELETE' }),
  resetManagerPassword: (id, data) => apiClient(`/admin/managers/${id}/reset-password`, { method: 'POST', body: JSON.stringify(data) }),

  // Audit Logs
  getAuditLogs: (options = {}) => apiClient('/admin/audit-logs', options),
};
