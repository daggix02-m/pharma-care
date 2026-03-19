import { makeApiCall } from './apiClient';

/**
 * Auth API Module
 * Provides legacy authentication services
 */
export const authAPI = {
  /**
   * Login user
   */
  login: (email, password) => 
    makeApiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  /**
   * Register new user/pharmacy
   */
  register: (data) => 
    makeApiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  /**
   * Verify email address
   */
  verifyEmail: (email, code) => 
    makeApiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    }),

  /**
   * Resend verification code
   */
  resendVerification: (email) => 
    makeApiCall('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  /**
   * Initiative password reset
   */
  forgotPassword: (email) => 
    makeApiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  /**
   * Reset password with code
   */
  resetPassword: (data) => 
    makeApiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  /**
   * Get user profile
   */
  getProfile: () => 
    makeApiCall('/profile/me', {
      method: 'GET'
    }),

  /**
   * Update user profile
   */
  updateProfile: (data) => 
    makeApiCall('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  /**
   * Change password (authenticated)
   */
  changePassword: (currentPassword, newPassword) => 
    makeApiCall('/profile/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  /**
   * Upload profile picture
   */
  uploadProfilePicture: (formData) => 
    makeApiCall('/profile/upload-picture', {
      method: 'POST',
      body: formData, // FormData handles its own boundaries
      headers: {} // Let browser set content-type for FormData
    }),

  /**
   * Delete profile picture
   */
  deleteProfilePicture: () => 
    makeApiCall('/profile/delete-picture', {
      method: 'DELETE'
    }),

  /**
   * Check account status (polling)
   */
  checkAccountStatus: (email) => 
    makeApiCall(`/auth/check-status?email=${encodeURIComponent(email)}`, {
      method: 'GET'
    })
};

// Also export individual functions for legacy direct imports
export const { 
  login, 
  register, 
  verifyEmail, 
  resendVerification, 
  forgotPassword, 
  resetPassword, 
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  deleteProfilePicture,
  checkAccountStatus 
} = authAPI;
