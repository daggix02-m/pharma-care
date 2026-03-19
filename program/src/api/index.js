// Core API Client Utilities
export { apiClient, makeApiCall, getAccessToken, isAuthenticated, setToken, getToken, removeToken, ENV_CONFIG } from './apiClient';

// Active API modules
export { authAPI } from './auth.api';      // Used by Auth Pages
export { adminAPI } from './admin.api';      // Used by DashboardLayout & usePharmacies
export { managerAPI } from './manager.api';  // Used by usePharmacies & StockTransferModal
export { cashierAPI } from './cashier.api';  // Used by Cashier Dashboard
export { pharmacyAPI } from './pharmacy.api'; // Used by legacy components

// Legacy service transitions
export { cashierService } from '../services/cashier.service';

