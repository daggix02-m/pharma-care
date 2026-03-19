import { create } from 'zustand';

const initialState = {
  currentStep: 1,
  // Step 1
  pharmacyDetails: {
    pharmacyName: '',
    licenseCode: '',
    staffCount: '',
    numberOfBranches: '',
    branchNames: '',
    locations: '',
  },
  // Step 2
  managerInfo: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  // Step 3
  subscriptionTier: 'basic', // 'basic', 'premium', 'enterprise'
  
  // Common state
  errors: {},
  isLoading: false,
  isSuccess: false,
  error: null,
};

export const useSignupStore = create((set, get) => ({
  ...initialState,

  // Navigation
  goToNextStep: () => {
    const { currentStep } = get();
    set({ currentStep: Math.min(currentStep + 1, 4) });
  },
  goToPreviousStep: () => {
    const { currentStep } = get();
    set({ currentStep: Math.max(currentStep - 1, 1) });
  },
  setCurrentStep: (step) => set({ currentStep: step }),

  // Setters
  setPharmacyDetails: (field, value) => {
    set((state) => ({
      pharmacyDetails: { ...state.pharmacyDetails, [field]: value },
      errors: { ...state.errors, [field]: '' },
    }));
  },
  setManagerInfo: (field, value) => {
    set((state) => ({
      managerInfo: { ...state.managerInfo, [field]: value },
      errors: { ...state.errors, [field]: '' },
    }));
  },
  setSubscriptionTier: (tier) => {
    set({ subscriptionTier: tier });
  },

  // Errors & Status
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
  resetSignup: () => set(initialState),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setIsSuccess: (isSuccess) => set({ isSuccess }),

  // Validation
  validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  validatePassword: (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  },

  validateCurrentStep: (step, shouldSetErrors = true) => {
    const { pharmacyDetails, managerInfo } = get();
    let errors = {};

    if (step === 1) {
      if (!pharmacyDetails.pharmacyName.trim()) errors.pharmacyName = 'Pharmacy Name is required';
      if (!pharmacyDetails.licenseCode.trim()) errors.licenseCode = 'License Code is required';
      if (!pharmacyDetails.staffCount.trim()) errors.staffCount = 'Staff Count is required';
      if (!pharmacyDetails.numberOfBranches.trim()) errors.numberOfBranches = 'Number of Branches is required';
      if (!pharmacyDetails.branchNames.trim()) errors.branchNames = 'Branch Names are required';
      if (!pharmacyDetails.locations.trim()) errors.locations = 'Locations are required';
    } else if (step === 2) {
      if (!managerInfo.fullName.trim()) errors.fullName = 'Full Name is required';
      if (!managerInfo.email.trim()) errors.email = 'Email is required';
      else if (!get().validateEmail(managerInfo.email)) errors.email = 'Invalid email format';
      if (!managerInfo.password) errors.password = 'Password is required';
      else if (!get().validatePassword(managerInfo.password)) errors.password = 'Password must be at least 8 chars with uppercase, lowercase, and number';
      if (!managerInfo.confirmPassword) errors.confirmPassword = 'Confirm Password is required';
      else if (managerInfo.password !== managerInfo.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    } 
    // Step 3 has a default radio selection so no strict validation needed.
    // Step 4 is Review & Submit, validation checked prior.

    if (Object.keys(errors).length > 0) {
      if (shouldSetErrors) get().setErrors(errors);
      return false;
    }
    return true;
  },
}));
