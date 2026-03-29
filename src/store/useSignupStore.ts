import { create } from "zustand";

interface PharmacyDetails {
  pharmacyName: string;
  pharmacyEmail: string;
  licenseCode: string;
  staffCount: string;
  numberOfBranches: string;
  branchNames: string;
  locations: string;
}

interface ManagerInfo {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  [key: string]: string;
}

interface SignupState {
  currentStep: number;
  pharmacyDetails: PharmacyDetails;
  managerInfo: ManagerInfo;
  subscriptionTier: string;
  errors: Errors;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;

  // Navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setCurrentStep: (step: number) => void;

  // Setters
  setPharmacyDetails: (field: keyof PharmacyDetails, value: string) => void;
  setManagerInfo: (field: keyof ManagerInfo, value: string) => void;
  setSubscriptionTier: (tier: string) => void;

  // Errors & Status
  setErrors: (errors: Errors) => void;
  clearErrors: () => void;
  resetSignup: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setIsSuccess: (isSuccess: boolean) => void;

  // Validation
  validateEmail: (email: string) => boolean;
  validatePassword: (password: string) => boolean;
  validateCurrentStep: (step: number, shouldSetErrors?: boolean) => boolean;
}

const initialState = {
  currentStep: 1,
  // Step 1
  pharmacyDetails: {
    pharmacyName: "",
    pharmacyEmail: "",
    licenseCode: "",
    staffCount: "",
    numberOfBranches: "",
    branchNames: "",
    locations: "",
  },
  // Step 2
  managerInfo: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  },
  // Step 3
  subscriptionTier: "basic", // 'basic', 'premium', 'enterprise'

  // Common state
  errors: {},
  isLoading: false,
  isSuccess: false,
  error: null,
};

export const useSignupStore = create<SignupState>((set, get) => ({
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
      errors: { ...state.errors, [field]: "" },
    }));
  },
  setManagerInfo: (field, value) => {
    set((state) => ({
      managerInfo: { ...state.managerInfo, [field]: value },
      errors: { ...state.errors, [field]: "" },
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
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  },

  validateCurrentStep: (step, shouldSetErrors = true) => {
    const { pharmacyDetails, managerInfo } = get();
    const errors: Errors = {};

    if (step === 1) {
      if (!pharmacyDetails.pharmacyName.trim())
        errors.pharmacyName = "Pharmacy Name is required";
      if (
        pharmacyDetails.pharmacyEmail.trim() &&
        !get().validateEmail(pharmacyDetails.pharmacyEmail)
      )
        errors.pharmacyEmail = "Invalid pharmacy email format";
      if (!pharmacyDetails.licenseCode.trim())
        errors.licenseCode = "License Code is required";
      if (!pharmacyDetails.locations.trim())
        errors.locations = "Locations are required";
    } else if (step === 2) {
      if (!managerInfo.fullName.trim())
        errors.fullName = "Full Name is required";
      if (!managerInfo.email.trim()) errors.email = "Email is required";
      else if (!get().validateEmail(managerInfo.email))
        errors.email = "Invalid email format";
      if (!managerInfo.password) errors.password = "Password is required";
      else if (!get().validatePassword(managerInfo.password))
        errors.password =
          "Password must be at least 8 chars with uppercase, lowercase, and number";
      if (!managerInfo.confirmPassword)
        errors.confirmPassword = "Confirm Password is required";
      else if (managerInfo.password !== managerInfo.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
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
