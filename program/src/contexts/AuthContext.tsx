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
  isSyncing: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Query current user from Convex
  const dbUser = useQuery(api.users.queries.getCurrentUser);

  // Mutations
  const requestPasswordResetMutation = useMutation(api.auth.mutations.requestPasswordReset);
  const resetPasswordMutation = useMutation(api.auth.mutations.resetPassword);

  useEffect(() => {
    // Loading is complete once we have user data (or null if not logged in)
    if (dbUser !== undefined) {
      setLoading(false);
    }
  }, [dbUser]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // With Convex Auth, login is handled via OAuth or the auth API
      // For email/password, we'll redirect to the login page
      // This is a placeholder for the actual implementation
      console.log('[AuthContext] Login initiated for:', email);
      
      // TODO: Implement actual Convex Auth login
      // This will be implemented when we have the full Convex Auth setup
      
      toast.success('Login functionality coming soon with Convex Auth');
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    
    try {
      // TODO: Implement Convex Auth logout
      console.log('[AuthContext] Logout initiated');
      
      // For now, just navigate to login
      navigate('/auth/login');
      toast.success('Logged out successfully');
    } catch (err: any) {
      console.error('[AuthContext] Logout error:', err);
      toast.error('Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement Convex Auth signup
      console.log('[AuthContext] Signup initiated for:', userData.email);
      
      toast.success('Signup functionality coming soon with Convex Auth');
    } catch (err: any) {
      console.error('[AuthContext] Signup error:', err);
      setError(err.message || 'Signup failed');
      toast.error(err.message || 'Signup failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    
    try {
      const result = await requestPasswordResetMutation({ email });
      
      if (result.success) {
        toast.success(result.message);
      }
    } catch (err: any) {
      console.error('[AuthContext] Password reset request error:', err);
      toast.error(err.message || 'Failed to request password reset');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, email: string, newPassword: string) => {
    setLoading(true);
    
    try {
      const result = await resetPasswordMutation({ token, email, newPassword });
      
      if (result.success) {
        toast.success(result.message);
        navigate('/auth/login');
      }
    } catch (err: any) {
      console.error('[AuthContext] Password reset error:', err);
      toast.error(err.message || 'Failed to reset password');
      throw err;
    } finally {
      setLoading(false);
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
    isSyncing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};