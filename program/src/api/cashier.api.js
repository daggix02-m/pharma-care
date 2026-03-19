import { apiClient } from './apiClient';

/**
 * Cashier API
 * Handles all cashier-related endpoints
 */
export const cashierAPI = {
  // Payment Management
  getPendingPayments: () => apiClient('/cashier/payments/pending'),
  getPaymentRequestDetails: (saleId) => apiClient(`/cashier/payments/${saleId}`),
  acceptPayment: (saleId, data) =>
    apiClient(`/cashier/payments/${saleId}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReceipt: (saleId) => apiClient(`/cashier/receipts/${saleId}`),
  importMedicinesExcel: (formData) =>
    apiClient('/cashier/medicines/import-excel', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for multipart/form-data
      body: formData,
    }),

  // Payment Reports
  getPaymentReports: () => apiClient('/cashier/reports/payments'),
  getSoldMedicinesReport: () => apiClient('/cashier/reports/sold-medicines'),

  // Notifications
  getNotifications: () => apiClient('/cashier/notifications'),

  // Return Management
  getSalesForReturn: () => apiClient('/cashier/returns/sales'),
  findSaleByReceiptNumber: (receiptNumber) => apiClient(`/cashier/returns/receipt/${receiptNumber}`),
  getSaleItemsForReturn: (saleId) => apiClient(`/cashier/returns/sales/${saleId}/items`),
  processReturn: (data) =>
    apiClient('/cashier/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReturnReports: () => apiClient('/cashier/reports/returns'),

  // Dashboard
  dashboard: () => apiClient('/cashier/dashboard'),

  // Products
  getProducts: () => apiClient('/cashier/products'),

  // Receipts
  getReceipts: () => apiClient('/cashier/receipt'),

  // Sales
  getDailySales: () => apiClient('/cashier/sales/daily'),
  getSalesSummary: () => apiClient('/cashier/sales/summary'),

  // Sessions
  getSessions: () => apiClient('/cashier/sessions'),
  closeSession: (sessionData) =>
    apiClient('/cashier/sessions/close', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  // Transactions
  getTransactions: () => apiClient('/cashier/transactions'),
  getTransactionDetails: (transactionId) => apiClient(`/cashier/transactions/${transactionId}`),
  completeTransaction: (transactionData) =>
    apiClient('/cashier/transactions/complete', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }),

  // POS Operations
  addPosItem: (itemData) =>
    apiClient('/cashier/pos/add-item', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),
  applyPosDiscount: (discountData) =>
    apiClient('/cashier/pos/apply-discount', {
      method: 'POST',
      body: JSON.stringify(discountData),
    }),
  posCheckout: (checkoutData) =>
    apiClient('/cashier/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    }),

  // Additional Features
  startSession: (data) =>
    apiClient('/cashier/sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  endSession: (data) =>
    apiClient('/cashier/sessions/end', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getShiftSummary: () => apiClient('/cashier/sessions/summary'),

  // Chapa Payment Endpoints
  initializeChapaPayment: (data) =>
    apiClient('/cashier/chapa/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  verifyChapaPayment: (transactionId) => apiClient(`/cashier/chapa/verify/${transactionId}`),
  checkChapaPaymentStatus: (transactionId) => apiClient(`/cashier/chapa/status/${transactionId}`),
};
