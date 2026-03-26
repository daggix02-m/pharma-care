import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages - Landing
import LandingPage from './pages/landing/LandingPage';
import AboutPage from './pages/landing/AboutPage';
import ContactSuccess from './pages/landing/ContactSuccess';

// Pages - Auth
import { LoginPage } from './pages/auth/login';
import { SignupPage } from './pages/auth/signup';
import { SSOCallbackPage } from './pages/auth/SSOCallbackPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { ResetPasswordPage } from './pages/auth/reset-password';
import { ChangePasswordPage } from './pages/auth/change-password';
import { VerifyEmailPage } from './pages/auth/verify-email';
import { PendingApprovalPage } from './pages/auth/pending-approval';
import { PharmacyRequestConfirmPage } from './pages/auth/pharmacy-request-confirm';
import { PharmacySuspendedPage } from './pages/auth/pharmacy-suspended';

// Pages - Dashboard - Owner
import { OwnerDashboard } from './pages/dashboard/owner/OwnerDashboard';
import { OwnerAppealHistory } from './pages/dashboard/owner/appeals/OwnerAppealHistory';
import { TestimonialSubmission } from './pages/dashboard/owner/testimonials/TestimonialSubmission';

// Pages - Dashboard - Admin
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard';
import { AdminAppealReview } from './pages/dashboard/admin/appeals/AdminAppealReview';
import { PharmacyDetailPage } from './pages/dashboard/admin/pharmacy-detail/PharmacyDetailPage';

// Pages - Dashboard - Manager
import { ManagerDashboard } from './pages/dashboard/manager/ManagerDashboard';

// Pages - Dashboard - Pharmacist
import { PharmacistDashboard } from './pages/dashboard/pharmacist/PharmacistDashboard';

// Pages - Dashboard - Cashier
import { CashierOverview } from './pages/dashboard/cashier/CashierOverview';
import { Settings as CashierSettings } from './pages/dashboard/cashier/Settings';
import { StockCheck } from './pages/dashboard/cashier/StockCheck';
import { Receipts } from './pages/dashboard/cashier/Receipts';
import { PendingPayments } from './pages/dashboard/cashier/PendingPayments';
import { Returns } from './pages/dashboard/cashier/Returns';
import { Transactions } from './pages/dashboard/cashier/Transactions';
import { POSOperations } from './pages/dashboard/cashier/POSOperations';
import { FinancialOperations } from './pages/dashboard/cashier/FinancialOperations';
import { SessionManagement } from './pages/dashboard/cashier/SessionManagement';
import { ShiftSummary } from './pages/dashboard/cashier/ShiftSummary';

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

// Brutalist loader component - memoized
const GlobalLoader = React.memo(function GlobalLoader() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center p-8'>
        <img src='/logo.png' alt='PharmaCare' className='w-24 h-24 mx-auto mb-6 animate-pulse' />
        <h2 className='text-3xl font-display font-bold tracking-tight mb-3 text-foreground'>
          PharmaCare
        </h2>
        <p className='text-muted-foreground font-mono text-sm uppercase tracking-widest'>
          Initialising...
        </p>
        <div className='mt-6 flex justify-center gap-1'>
          <div
            className='w-2 h-2 bg-primary rounded-full animate-bounce'
            style={{ animationDelay: '0ms' }}
          />
          <div
            className='w-2 h-2 bg-primary rounded-full animate-bounce'
            style={{ animationDelay: '150ms' }}
          />
          <div
            className='w-2 h-2 bg-primary rounded-full animate-bounce'
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
});

// Role protected route - memoized for performance
const RoleProtectedRoute = React.memo(function RoleProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />;
  }

  const userRole = user?.role;

  // Check pharmacy suspension status
  if (
    userRole !== 'admin' &&
    user?.pharmacy_status &&
    (user.pharmacy_status === 'inactive' || user.pharmacy_status === 'deleted')
  ) {
    return <Navigate to='/auth/pharmacy-suspended' replace />;
  }

  // Check password change requirement
  if (user?.must_change_password && window.location.pathname !== '/auth/change-password') {
    return <Navigate to='/auth/change-password' replace />;
  }

  const isAdmin = userRole === 'admin';
  const isAllowed =
    !allowedRoles || allowedRoles.some((role) => (role === 'admin' ? isAdmin : userRole === role));

  if (!isAllowed) {
    const redirectMap: Record<string, string> = {
      admin: '/admin',
      owner: '/owner',
      manager: '/manager',
      pharmacist: '/pharmacist',
      cashier: '/cashier/overview',
    };
    return <Navigate to={redirectMap[userRole as string] || '/auth/login'} replace />;
  }

  return <>{children}</>;
});

// Loading boundary with memo
const LoadingBoundary = React.memo(function LoadingBoundary() {
  const { loading } = useAuth();
  return (
    <div key={loading ? 'loading' : 'loaded'} className='contents'>
      {loading ? <GlobalLoader /> : <Outlet />}
    </div>
  );
});

// App routes component - memoized
const AppRoutes = React.memo(function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path='/' element={<LandingPage />} />
      <Route path='/about' element={<AboutPage />} />
      <Route path='/contact-success' element={<ContactSuccess />} />

      {/* Public Auth Routes - NO LoadingBoundary */}
      <Route path='/auth/login/*' element={<LoginPage />} />
      <Route path='/auth/signup/*' element={<SignupPage />} />
      <Route path='/auth/sso-callback' element={<SSOCallbackPage />} />
      <Route path='/auth/forgot-password/*' element={<ForgotPasswordPage />} />
      <Route path='/auth/reset-password' element={<ResetPasswordPage />} />
      <Route path='/auth/change-password' element={<ChangePasswordPage />} />
      <Route path='/auth/verify-email' element={<VerifyEmailPage />} />
      <Route path='/auth/pending-approval' element={<PendingApprovalPage />} />
      <Route path='/auth/pharmacy-request-confirm' element={<PharmacyRequestConfirmPage />} />
      <Route path='/auth/pharmacy-suspended' element={<PharmacySuspendedPage />} />

      {/* Protected Routes - WITH LoadingBoundary */}
      <Route element={<LoadingBoundary />}>
        {/* Owner Dashboard */}
        <Route
          path='/owner'
          element={
            <RoleProtectedRoute allowedRoles={['owner']}>
              <DashboardLayout>
                <OwnerDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path='/owner/appeals'
          element={
            <RoleProtectedRoute allowedRoles={['owner']}>
              <DashboardLayout>
                <OwnerAppealHistory />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path='/owner/testimonials'
          element={
            <RoleProtectedRoute allowedRoles={['owner']}>
              <DashboardLayout>
                <TestimonialSubmission />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path='/admin'
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path='/admin/pharmacies/:pharmacyId'
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <PharmacyDetailPage />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path='/admin/appeals'
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminAppealReview />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />

        {/* Manager Dashboard */}
        <Route
          path='/manager'
          element={
            <RoleProtectedRoute allowedRoles={['manager']}>
              <DashboardLayout>
                <ManagerDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />

        {/* Pharmacist Dashboard */}
        <Route
          path='/pharmacist'
          element={
            <RoleProtectedRoute allowedRoles={['pharmacist']}>
              <DashboardLayout>
                <PharmacistDashboard />
              </DashboardLayout>
            </RoleProtectedRoute>
          }
        />

        {/* Cashier Routes - Nested */}
        <Route
          path='/cashier'
          element={
            <RoleProtectedRoute allowedRoles={['cashier']}>
              <DashboardLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Navigate to='overview' replace />} />
          <Route path='overview' element={<CashierOverview />} />
          <Route path='stock' element={<StockCheck />} />
          <Route path='receipts' element={<Receipts />} />
          <Route path='settings' element={<CashierSettings />} />
          <Route path='payments/pending' element={<PendingPayments />} />
          <Route path='returns' element={<Returns />} />
          <Route path='transactions' element={<Transactions />} />
          <Route path='pos' element={<POSOperations />} />
          <Route path='sessions' element={<SessionManagement />} />
          <Route path='shift-summary' element={<ShiftSummary />} />
          <Route path='sales' element={<FinancialOperations />} />
        </Route>

        {/* Catch-all */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
});

// Main App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
      <Toaster position='top-right' closeButton richColors />
    </QueryClientProvider>
  );
}

export default App;
