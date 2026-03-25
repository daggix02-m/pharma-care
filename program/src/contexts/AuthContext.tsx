import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';
import logger from '@/utils/logger';
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
  must_change_password?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (userData: any) => void;
  logout: () => Promise<void>;
  role: string | null;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  pharmacyStatus?: string;
  isSyncing: boolean;
  hasAttemptedSync: boolean;
  handleManualSync: () => Promise<void>;
}

const AuthContext =
  ((globalThis as any).__AuthContext__ as React.Context<AuthContextValue | null>) ||
  createContext<AuthContextValue | null>(null);
if (import.meta.env.DEV) {
  (globalThis as any).__AuthContext__ = AuthContext;
}

const ADMIN_EMAIL = 'daggi.x02@gmail.com';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isLoaded: isClerkLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  const dbUser = useQuery(api.users.queries.getCurrentUser, isSignedIn ? undefined : 'skip');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const storeUserMutation = useMutation(api.users.mutations.storeUser);

  const login = async (_userData: any) => {
    logger.log('Login called directly, Auth State is now managed by Clerk & Convex.');
  };

  const logout = async () => {
    logger.log('Logout initialized via Clerk');
    await signOut();
    navigate('/auth/login');
  };

  const handleManualSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setError(null);

    try {
      await storeUserMutation();
      toast.success('Account synced successfully!');
      setError(null);
      setHasAttemptedSync(false);
    } catch (err: any) {
      console.error('[AuthContext] Manual sync failed:', err);
      setError(err.message || 'Failed to sync account');
      toast.error('Failed to sync account. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isClerkLoaded) {
      if (isSignedIn) {
        if (dbUser !== undefined) {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [isClerkLoaded, isSignedIn, dbUser]);

  useEffect(() => {
    const needsSync =
      isClerkLoaded && isSignedIn && dbUser === null && clerkUser && !hasAttemptedSync;

    if (needsSync) {
      console.log('[AuthContext] User signed into Clerk but missing from Convex - auto-syncing...');
      setHasAttemptedSync(true);

      const syncUser = async () => {
        try {
          await storeUserMutation();
          console.log('[AuthContext] Auto-sync successful');
          setError(null);
          toast.success('Account synced successfully!');
          setTimeout(() => setHasAttemptedSync(false), 30000);
        } catch (err: any) {
          console.error('[AuthContext] Auto-sync failed:', err);
          setError(err.message || 'Failed to sync account');
          setTimeout(() => setHasAttemptedSync(false), 30000);
        }
      };

      syncUser();
    } else if (dbUser !== undefined && !needsSync) {
      setHasAttemptedSync(false);
    }
  }, [isClerkLoaded, isSignedIn, dbUser, clerkUser, hasAttemptedSync, storeUserMutation]);

  const isAuthenticated = !!isSignedIn && dbUser !== undefined && dbUser !== null;

  const userRole: string =
    dbUser?.role ||
    (clerkUser?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL ? 'admin' : null) ||
    (clerkUser?.unsafeMetadata?.role as string) ||
    'user';

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
    role: userRole,
    userId: dbUser?._id,
    userEmail: dbUser?.email,
    userRole: userRole,
    pharmacyId: dbUser?.pharmacyId,
    pharmacyName: dbUser?.pharmacy?.name,
    pharmacyStatus: dbUser?.pharmacy?.status,
    isSyncing,
    hasAttemptedSync,
    handleManualSync,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
