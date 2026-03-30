import { create } from "zustand";

interface PharmacyDetails {
  pharmacyName: string;
  pharmacyEmail: string;
  licenseCode: string;
  locations: string;
}

interface OperationsInfo {
  totalBranches: number;
  branchLocations: string[];
  totalStaff: number;
  pharmacistCount: number;
  managerCount: number;
  cashierCount: number;
}

interface SubscriptionInfo {
  selectedTier: string;
  recommendedTier: string;
}

interface OwnerInfo {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  [key: string]: string;
}

interface SignupState {
  currentStep: number;
  pharmacyDetails: PharmacyDetails;
  operationsInfo: OperationsInfo;
  subscriptionInfo: SubscriptionInfo;
  ownerInfo: OwnerInfo;
  termsAccepted: boolean;
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
  setOperationsInfo: (
    field: keyof OperationsInfo,
    value: number | string[],
  ) => void;
  setBranchLocation: (index: number, value: string) => void;
  addBranchLocation: () => void;
  removeBranchLocation: (index: number) => void;
  setSubscriptionInfo: (field: keyof SubscriptionInfo, value: string) => void;
  setOwnerInfo: (field: keyof OwnerInfo, value: string) => void;
  setTermsAccepted: (accepted: boolean) => void;

  // Errors & Status
  setErrors: (errors: Errors) => void;
  clearErrors: () => void;
  resetSignup: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setIsSuccess: (isSuccess: boolean) => void;

  // Validation
  validateEmail: (email: string) => boolean;
  validatePhone: (phone: string) => boolean;
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
    locations: "",
  },
  // Step 2
  operationsInfo: {
    totalBranches: 1,
    branchLocations: [""],
    totalStaff: 1,
    pharmacistCount: 1,
    managerCount: 0,
    cashierCount: 0,
  },
  // Step 3
  subscriptionInfo: {
    selectedTier: "",
    recommendedTier: "basic",
  },
  // Step 4
  ownerInfo: {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  },
  // Step 5
  termsAccepted: false,

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
    set({ currentStep: Math.min(currentStep + 1, 5) });
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
  setOperationsInfo: (field, value) => {
    set((state) => ({
      operationsInfo: { ...state.operationsInfo, [field]: value },
      errors: { ...state.errors, [field]: "" },
    }));
  },
  setBranchLocation: (index, value) => {
    set((state) => {
      const nextLocations = [...state.operationsInfo.branchLocations];
      nextLocations[index] = value;
      return {
        operationsInfo: {
          ...state.operationsInfo,
          branchLocations: nextLocations,
        },
        errors: { ...state.errors, branchLocations: "" },
      };
    });
  },
  addBranchLocation: () => {
    set((state) => ({
      operationsInfo: {
        ...state.operationsInfo,
        totalBranches: state.operationsInfo.totalBranches + 1,
        branchLocations: [...state.operationsInfo.branchLocations, ""],
      },
    }));
  },
  removeBranchLocation: (index) => {
    set((state) => {
      if (state.operationsInfo.branchLocations.length <= 1) {
        return state;
      }
      const nextLocations = state.operationsInfo.branchLocations.filter(
        (_, idx) => idx !== index,
      );
      return {
        operationsInfo: {
          ...state.operationsInfo,
          totalBranches: nextLocations.length,
          branchLocations: nextLocations,
        },
      };
    });
  },
  setSubscriptionInfo: (field, value) => {
    set((state) => ({
      subscriptionInfo: { ...state.subscriptionInfo, [field]: value },
      errors: { ...state.errors, [field]: "" },
    }));
  },
  setOwnerInfo: (field, value) => {
    set((state) => ({
      ownerInfo: { ...state.ownerInfo, [field]: value },
      errors: { ...state.errors, [field]: "" },
    }));
  },
  setTermsAccepted: (accepted) => {
    set((state) => ({
      termsAccepted: accepted,
      errors: { ...state.errors, termsAccepted: "" },
    }));
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
  validatePhone: (phone) =>
    /^(\+251|0)?[79]\d{8}$/.test(phone.replace(/\s+/g, "")),
  validatePassword: (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  },

  validateCurrentStep: (step, shouldSetErrors = true) => {
    const {
      pharmacyDetails,
      operationsInfo,
      subscriptionInfo,
      ownerInfo,
      termsAccepted,
    } = get();
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
      if (operationsInfo.totalBranches < 1)
        errors.totalBranches = "At least one branch is required";

      const validLocations = operationsInfo.branchLocations
        .map((location) => location.trim())
        .filter(Boolean);

      if (validLocations.length !== operationsInfo.totalBranches) {
        errors.branchLocations = "Please provide all branch locations";
      }

      if (operationsInfo.totalStaff < 1) {
        errors.totalStaff = "Total staff must be at least 1";
      }

      const roleTotal =
        operationsInfo.pharmacistCount +
        operationsInfo.managerCount +
        operationsInfo.cashierCount;

      if (roleTotal !== operationsInfo.totalStaff) {
        errors.staffBreakdown = "Staff breakdown must equal total staff count";
      }
    } else if (step === 3) {
      if (!subscriptionInfo.selectedTier.trim()) {
        errors.selectedTier = "Please select a subscription plan";
      }
    } else if (step === 4) {
      if (!ownerInfo.fullName.trim()) errors.fullName = "Full Name is required";
      if (!ownerInfo.email.trim()) errors.email = "Email is required";
      else if (!get().validateEmail(ownerInfo.email))
        errors.email = "Invalid email format";
      if (!ownerInfo.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!get().validatePhone(ownerInfo.phone)) {
        errors.phone = "Invalid phone format (use Ethiopian mobile format)";
      }
      if (!ownerInfo.password) errors.password = "Password is required";
      else if (!get().validatePassword(ownerInfo.password))
        errors.password =
          "Password must be at least 8 chars with uppercase, lowercase, and number";
      if (ownerInfo.password !== ownerInfo.confirmPassword)
        errors.confirmPassword = "Passwords do not match";
    } else if (step === 5) {
      if (!termsAccepted) {
        errors.termsAccepted = "You must accept terms before submission";
      }
    }

    if (Object.keys(errors).length > 0) {
      if (shouldSetErrors) get().setErrors(errors);
      return false;
    }
    return true;
  },
}));
