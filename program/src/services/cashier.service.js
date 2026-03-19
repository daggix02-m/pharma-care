import { cashierAPI } from '../api';
import { makeApiCall } from '../api/apiClient';

/**
 * Cashier Service
 * Handles all cashier-related API calls for PharmaCare backend
 */

export const cashierService = {
  /**
   * Get cashier dashboard overview
   * @returns {Promise}
   */
  async getOverview() {
    const res = await cashierAPI.dashboard();
    return {
      success: true,
      data: res,
    };
  },

  /**
   * Get products for POS
   * @param {Object} params - Query parameters (search)
   * @returns {Promise}
   */
  async getProducts() {
    const res = await cashierAPI.getProducts();
    return {
      success: true,
      data: res?.data,
    };
  },

  /**
   * Get recent receipts
   * @returns {Promise}
   */
  async getReceipts() {
    return await makeApiCall('/cashier/receipts', { method: 'GET' });
  },

  /**
   * Get receipt details by sale ID
   * Matches backend: GET /api/cashier/receipts/:sale_id
   * @param {string} saleId - Sale ID
   * @returns {Promise}
   */
  async getReceipt(saleId) {
    return await makeApiCall(`/cashier/receipts/${saleId}`, { method: 'GET' });
  },

  /**
   * Get pending payments
   * Matches backend: GET /api/cashier/payments/pending
   * @returns {Promise}
   */
  async getPendingPayments() {
    return await makeApiCall('/cashier/payments/pending', { method: 'GET' });
  },

  /**
   * Get payment details for a sale
   * Matches backend: GET /api/cashier/payments/:sale_id
   * @param {string} saleId - Sale ID
   * @returns {Promise}
   */
  async getPayment(saleId) {
    return await makeApiCall(`/cashier/payments/${saleId}`, { method: 'GET' });
  },

  /**
   * Process payment for a sale
   * Matches backend: POST /api/cashier/payments/process
   * @param {Object} paymentData - Payment data { sale_id, payment_method, amount, reference_number }
   * @returns {Promise}
   */
  async processPayment(paymentData) {
    return await makeApiCall('/cashier/payments/process', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Accept payment for a sale
   * Matches backend: POST /api/cashier/payments/:sale_id/accept
   * @param {string} saleId - Sale ID
   * @param {Object} paymentData - Payment data (amount, payment_method)
   * @returns {Promise}
   */
  async acceptPayment(saleId, paymentData) {
    return await makeApiCall(`/cashier/payments/${saleId}/accept`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Get sales for return
   * Matches backend: GET /api/cashier/returns/sales
   * @returns {Promise}
   */
  async getReturnableSales() {
    return await makeApiCall('/cashier/returns/sales', { method: 'GET' });
  },

  /**
   * Get items for a sale that can be returned
   * Matches backend: GET /api/cashier/returns/sales/:sale_id/items
   * @param {string} saleId - Sale ID
   * @returns {Promise}
   */
  async getReturnableItems(saleId) {
    return await makeApiCall(`/cashier/returns/sales/${saleId}/items`, { method: 'GET' });
  },

  /**
   * Get transactions
   * Matches backend: GET /api/cashier/transactions
   * @returns {Promise}
   */
  async getTransactions() {
    return await makeApiCall('/cashier/transactions', { method: 'GET' });
  },

  /**
   * Get transaction details
   * Matches backend: GET /api/cashier/transactions/:id
   * @param {string} transactionId - Transaction ID
   * @returns {Promise}
   */
  async getTransactionById(transactionId) {
    return await makeApiCall(`/cashier/transactions/${transactionId}`, { method: 'GET' });
  },

  /**
   * Add item to POS cart
   * Matches backend: POST /api/cashier/pos/add-item
   * @param {Object} itemData - Item data { medicine_id, quantity }
   * @returns {Promise}
   */
  async addPosItem(itemData) {
    return await makeApiCall('/cashier/pos/add-item', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  /**
   * Apply discount to POS cart
   * Matches backend: POST /api/cashier/pos/apply-discount
   * @param {Object} discountData - Discount data { discount_type, discount_value }
   * @returns {Promise}
   */
  async applyPosDiscount(discountData) {
    return await makeApiCall('/cashier/pos/apply-discount', {
      method: 'POST',
      body: JSON.stringify(discountData),
    });
  },

  /**
   * Complete POS checkout
   * Matches backend: POST /api/cashier/pos/checkout
   * @param {Object} checkoutData - Checkout data { items, payment_method, total }
   * @returns {Promise}
   */
  async posCheckout(checkoutData) {
    return await makeApiCall('/cashier/pos/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  },

  /**
   * Get daily sales summary
   * Matches backend: GET /api/cashier/sales/daily
   * @returns {Promise}
   */
  async getDailySales() {
    return await makeApiCall('/cashier/sales/daily', { method: 'GET' });
  },

  /**
   * Get general sales summary
   * Matches backend: GET /api/cashier/sales/summary
   * @returns {Promise}
   */
  async getSalesSummary() {
    return await makeApiCall('/cashier/sales/summary', { method: 'GET' });
  },

  /**
   * Process refund
   * Matches backend: POST /api/cashier/payments/refund
   * @param {Object} refundData - Refund data { sale_id, items, reason, refund_amount }
   * @returns {Promise}
   */
  async processRefund(refundData) {
    return await makeApiCall('/cashier/payments/refund', {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  },

  /**
   * Process product return
   * @param {Object} returnData - Return data (saleId, items, reason)
   * @returns {Promise}
   */
  async processReturn(returnData) {
    return await makeApiCall('/cashier/returns', {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  },

  /**
   * Get payments report
   * Matches backend: GET /api/cashier/reports/payments
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise}
   */
  async getPaymentsReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/cashier/reports/payments?${queryString}`
      : '/cashier/reports/payments';
    return await makeApiCall(endpoint, { method: 'GET' });
  },

  /**
   * Get returns report
   * Matches backend: GET /api/cashier/reports/returns
   * @param {Object} params - Query parameters (startDate, endDate)
   * @returns {Promise}
   */
  async getReturnsReport(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/cashier/reports/returns?${queryString}`
      : '/cashier/reports/returns';
    return await makeApiCall(endpoint, { method: 'GET' });
  },

  /**
   * Close current cash session
   * @param {number} closingCash - Closing cash amount
   * @returns {Promise}
   */
  async closeSession(closingCash) {
    return await makeApiCall('/cashier/sessions/close', {
      method: 'POST',
      body: JSON.stringify({ closingCash }),
    });
  },

  // Chapa Payment Integration
  async initializeChapaPayment(paymentData) {
    return await makeApiCall('/cashier/chapa/initialize', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async verifyChapaPayment(transactionId) {
    return await makeApiCall(`/cashier/chapa/verify/${transactionId}`, { method: 'GET' });
  },

  async checkChapaPaymentStatus(transactionId) {
    return await makeApiCall(`/cashier/chapa/status/${transactionId}`, { method: 'GET' });
  },

  // REMOVED ENDPOINTS (not supported by backend):
  // - /cashier/sales (cashiers don't create sales)
  // - /cashier/products
  // - /cashier/sessions
  // - /cashier/stock-check
  // - /cashier/transactions/hold
  // - /cashier/receipts/:id/email
};

export default cashierService;
