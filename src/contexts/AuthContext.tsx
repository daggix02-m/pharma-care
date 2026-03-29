import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AuthUser {
  _id: string;
  id: string;
  email?: string;
  full_name?: string;
  role: string;
  pharmacyId?: string;
  branchId?: string;
  pharmacy?: {
    name?: string;
    status?: string;
  };
  pharmacy_status?: string;
  must_change_password?: boolean;
  mustResetPassword?: boolean;
  emailVerified?: boolean;
  image?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (
    token: string,
    email: string,
    newPassword: string,
  ) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  role: string | null;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  pharmacyStatus?: string;
  isLoading: boolean;
  sessionToken: string | null;
}

interface SignupData {
  email: string;
  password: string;
  full_name: string;
  pharmacyDetails?: {
    name: string;
    licenseNumber: string;
    location: string;
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem("sessionToken"),
  );

  // Listen for session token changes
  useEffect(() => {
    const handleStorageChange = () => {
      setSessionToken(localStorage.getItem("sessionToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Query current user from Convex
  const dbUser = useQuery(
    api.users.queries.getCurrentUser,
    sessionToken ? { sessionToken } : "skip",
  );

  // Mutations
  const signInMutation = useMutation(api.auth.mutations.signInWithEmail);
  const signUpMutation = useMutation(api.auth.mutations.signUpWithEmail);
  const signOutMutation = useMutation(api.auth.mutations.signOut);
  const requestPasswordResetMutation = useMutation(
    api.auth.mutations.requestPasswordReset,
  );
  const resetPasswordMutation = useMutation(api.auth.mutations.resetPassword);
  const changePasswordMutation = useMutation(api.auth.mutations.changePassword);

  useEffect(() => {
    // Set maximum loading time of 3 seconds as safety net
    const timeout = setTimeout(() => {
      console.log(
        "[AuthContext] Loading timeout reached, forcing loading state to false",
      );
      setLoading(false);
    }, 3000);

    if (dbUser !== undefined) {
      clearTimeout(timeout);
      setLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [dbUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInMutation({
        email: normalizeEmail(email),
        password,
      });

      if (result.success) {
        // Store session token
        localStorage.setItem("sessionToken", result.sessionToken);
        setSessionToken(result.sessionToken);

        toast.success("Signed in successfully");

        // Navigate based on role - use window.location for full page reload
        // This ensures Convex queries re-fetch with the new session
        const homePath = getHomePath(result.role);
        window.location.href = homePath;
      }
    } catch (err: any) {
      console.error("[AuthContext] Login error:", err);
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      const sessionToken = localStorage.getItem("sessionToken");
      await signOutMutation({ sessionToken: sessionToken || undefined });

      // Clear session
      localStorage.removeItem("sessionToken");
      setSessionToken(null);

      toast.success("Signed out successfully");
      window.location.href = "/auth/login";
    } catch (err: any) {
      console.error("[AuthContext] Logout error:", err);
      toast.error("Logout failed");

      // Still clear local session
      localStorage.removeItem("sessionToken");
      setSessionToken(null);
      window.location.href = "/auth/login";
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUpMutation({
        email: normalizeEmail(userData.email),
        password: userData.password,
        full_name: userData.full_name,
        pharmacyDetails: userData.pharmacyDetails,
      });

      if (result.success) {
        toast.success(result.message);
        // Store email in sessionStorage since we can't pass state with window.location
        sessionStorage.setItem("pendingVerificationEmail", userData.email);
        window.location.href = "/auth/verify-email";
      }
    } catch (err: any) {
      console.error("[AuthContext] Signup error:", err);
      const errorMessage = err.message || "Signup failed";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);

    try {
      const result = await requestPasswordResetMutation({
        email: normalizeEmail(email),
      });

      if (result.success) {
        toast.success(result.message);
      }
    } catch (err: any) {
      console.error("[AuthContext] Password reset request error:", err);
      const errorMessage = err.message || "Failed to request password reset";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (
    token: string,
    email: string,
    newPassword: string,
  ) => {
    setIsLoading(true);

    try {
      const result = await resetPasswordMutation({
        token,
        email: normalizeEmail(email),
        newPassword,
      });

      if (result.success) {
        toast.success(result.message);
        window.location.href = "/auth/login";
      }
    } catch (err: any) {
      console.error("[AuthContext] Password reset error:", err);
      const errorMessage = err.message || "Failed to reset password";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    setIsLoading(true);

    try {
      const sessionToken = localStorage.getItem("sessionToken");
      const result = await changePasswordMutation({
        currentPassword,
        newPassword,
        sessionToken: sessionToken || undefined,
      });

      if (result.success) {
        toast.success(result.message);
      }
    } catch (err: any) {
      console.error("[AuthContext] Change password error:", err);
      const errorMessage = err.message || "Failed to change password";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getHomePath = (role: string): string => {
    switch (role) {
      case "admin":
        return "/admin";
      case "manager":
        return "/manager";
      case "pharmacist":
        return "/pharmacist";
      case "cashier":
        return "/cashier/overview";
      case "owner":
        return "/owner";
      default:
        return "/auth/pending-approval";
    }
  };

  const isAuthenticated = !!dbUser;
  const userRole = dbUser?.role || "pending";

  const value: AuthContextValue = {
    user: dbUser
      ? {
          ...dbUser,
          id: dbUser._id,
          role: userRole,
          pharmacy: dbUser.pharmacy
            ? {
                name: dbUser.pharmacy.name,
                status: dbUser.pharmacy.status,
              }
            : undefined,
        }
      : null,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    signup,
    requestPasswordReset,
    resetPassword,
    changePassword,
    role: userRole,
    userId: dbUser?._id,
    userEmail: dbUser?.email,
    userRole: userRole,
    pharmacyId: dbUser?.pharmacyId,
    pharmacyName: dbUser?.pharmacy?.name,
    pharmacyStatus: dbUser?.pharmacy?.status,
    isLoading,
    sessionToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
const normalizeEmail = (email: string) => email.trim().toLowerCase();
