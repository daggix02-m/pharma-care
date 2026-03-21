import { makeApiCall } from './apiClient';

/**
 * Pharmacy API Module
 */
export const pharmacyAPI = {
  getPharmacies: () => makeApiCall('/admin/pharmacies'),
  getPharmacy: (id) => makeApiCall(`/admin/pharmacies/${id}`),
  updateStatus: (id, status) => makeApiCall(`/admin/pharmacies/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  // Chapa Payment Endpoints
  initializeChapaPayment: (data) =>
    makeApiCall('/pharmacy/chapa/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyChapaPayment: (transactionId) => makeApiCall(`/pharmacy/chapa/verify/${transactionId}`),
  checkChapaPaymentStatus: (transactionId) => makeApiCall(`/pharmacy/chapa/status/${transactionId}`),
};
