import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  resetPassword: (token: string, email: string, newPassword: string) => Promise<void>;
  role: string | null;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  pharmacyStatus?: string;
  isLoading: boolean;
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query current user from Convex
  const dbUser = useQuery(api.users.queries.getCurrentUser);

  // Mutations
  const signInMutation = useMutation(api.auth.mutations.signInWithEmail);
  const signUpMutation = useMutation(api.auth.mutations.signUpWithEmail);
  const signOutMutation = useMutation(api.auth.mutations.signOut);
  const requestPasswordResetMutation = useMutation(api.auth.mutations.requestPasswordReset);
  const resetPasswordMutation = useMutation(api.auth.mutations.resetPassword);

  useEffect(() => {
    // Loading is complete once we have user data (or null if not logged in)
    if (dbUser !== undefined) {
      setLoading(false);
    }
  }, [dbUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInMutation({ email, password });
      
      if (result.success) {
        // Store session token
        localStorage.setItem('sessionToken', result.sessionToken);
        
        toast.success('Signed in successfully');
        
        // Navigate based on role
        const homePath = getHomePath(result.role);
        navigate(homePath);
      }
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      const errorMessage = err.message || 'Login failed';
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
      const sessionToken = localStorage.getItem('sessionToken');
      await signOutMutation({ sessionToken: sessionToken || undefined });
      
      // Clear session
      localStorage.removeItem('sessionToken');
      
      toast.success('Signed out successfully');
      navigate('/auth/login');
    } catch (err: any) {
      console.error('[AuthContext] Logout error:', err);
      toast.error('Logout failed');
      
      // Still clear local session
      localStorage.removeItem('sessionToken');
      navigate('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signUpMutation({
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        pharmacyDetails: userData.pharmacyDetails,
      });
      
      if (result.success) {
        toast.success(result.message);
        navigate('/auth/verify-email', { state: { email: userData.email } });
      }
    } catch (err: any) {
      console.error('[AuthContext] Signup error:', err);
      const errorMessage = err.message || 'Signup failed';
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
      const result = await requestPasswordResetMutation({ email });
      
      if (result.success) {
        toast.success(result.message);
      }
    } catch (err: any) {
      console.error('[AuthContext] Password reset request error:', err);
      const errorMessage = err.message || 'Failed to request password reset';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, email: string, newPassword: string) => {
    setIsLoading(true);
    
    try {
      const result = await resetPasswordMutation({ token, email, newPassword });
      
      if (result.success) {
        toast.success(result.message);
        navigate('/auth/login');
      }
    } catch (err: any) {
      console.error('[AuthContext] Password reset error:', err);
      const errorMessage = err.message || 'Failed to reset password';
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getHomePath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager';
      case 'pharmacist':
        return '/pharmacist';
      case 'cashier':
        return '/cashier/overview';
      case 'owner':
        return '/dashboard/owner';
      default:
        return '/auth/pending-approval';
    }
  };

  const isAuthenticated = !!dbUser;
  const userRole = dbUser?.role || 'pending';

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
    role: userRole,
    userId: dbUser?._id,
    userEmail: dbUser?.email,
    userRole: userRole,
    pharmacyId: dbUser?.pharmacyId,
    pharmacyName: dbUser?.pharmacy?.name,
    pharmacyStatus: dbUser?.pharmacy?.status,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};