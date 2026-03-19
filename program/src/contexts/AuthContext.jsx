import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';
import logger from '@/utils/logger';

const AuthContext = globalThis.__AuthContext__ || createContext();
if (import.meta.env.DEV) {
  globalThis.__AuthContext__ = AuthContext;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { isLoaded: isClerkLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const navigate = useNavigate();

  // Load the synced user from our Convex database automatically if logged into Clerk
  const dbUser = useQuery(api.users.queries.getCurrentUser, isSignedIn ? undefined : "skip");

  const [loading, setLoading] = useState(true);

  // We are "loading" until Clerk is loaded and, if signed in, until Convex returns the user doc.
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

  const login = async (userData) => {
    // Legacy mapping support for compatibility
    logger.log('Login called directly, Auth State is now managed by Clerk & Convex.');
  };

  const logout = async () => {
    logger.log('Logout initialized via Clerk');
    await signOut();
    navigate('/auth/login');
  };

  const isAuthenticated = isSignedIn && dbUser !== undefined && dbUser !== null;
  
  // Safe default role if dbUser hasn't populated or clerk hasn't synced
  const userRole = dbUser?.role || clerkUser?.unsafeMetadata?.role || 'user';

  const value = {
    user: dbUser ? {
      ...dbUser,
      id: dbUser._id,
      role: userRole,
    } : null,
    isAuthenticated,
    loading,
    login,
    logout,
    role: userRole,
    userId: dbUser?._id,
    userEmail: dbUser?.email,
    userRole: userRole,
    pharmacyId: dbUser?.pharmacyId,
    pharmacyName: dbUser?.pharmacy?.name,
    pharmacyStatus: dbUser?.pharmacy?.status,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};