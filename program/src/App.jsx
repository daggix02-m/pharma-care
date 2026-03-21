import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PharmacySuspendedPage } from './pages/auth/pharmacy-suspended';
import { PendingApprovalPage } from './pages/auth/pending-approval';
import { PharmacyRequestConfirmPage } from './pages/auth/pharmacy-request-confirm';
import LandingPage from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/login';
import { SignupPage } from './pages/auth/signup';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { ResetPasswordPage } from './pages/auth/reset-password';
import { ChangePasswordPage } from './pages/auth/change-password';
import { VerifyEmailPage } from './pages/auth/verify-email';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Overview } from './pages/dashboard/manager/Overview';
import { StaffManagement } from './pages/dashboard/manager/StaffManagement';
import { ImportData } from './pages/dashboard/manager/ImportData';
import { InventoryManagement } from './pages/dashboard/manager/InventoryManagement';
import { Settings } from './pages/dashboard/manager/Settings';
import { Settings as PharmacistSettings } from './pages/dashboard/pharmacist/Settings';
import { Settings as CashierSettings } from './pages/dashboard/cashier/Settings';
import { AdminOverview } from './pages/dashboard/admin/AdminOverview';
import { AdminSettings } from './pages/dashboard/admin/AdminSettings';
import { AdminApprovals } from './pages/dashboard/admin/AdminApprovals';
import { AdminPharmacies } from './pages/dashboard/admin/AdminPharmacies';
import { AdminBranches } from './pages/dashboard/admin/AdminBranches';
import { AdminManagers } from './pages/dashboard/admin/AdminManagers';
import AdminAuditLogs from './pages/dashboard/admin/AdminAuditLogs';
import { PharmacistOverview } from './pages/dashboard/pharmacist/PharmacistOverview';
import { CashierOverview } from './pages/dashboard/cashier/CashierOverview';
import { StockCheck } from './pages/dashboard/cashier/StockCheck';
import { ManagerPOSSales } from './pages/dashboard/manager/POSSales';
import { InventoryManagement as PharmacistInventory } from './pages/dashboard/pharmacist/InventoryManagement';
import { PharmacyReports } from './pages/dashboard/pharmacist/PharmacyReports';
import { Receipts } from './pages/dashboard/cashier/Receipts';
import { Notifications } from './pages/dashboard/manager/Notifications';
import { AuditTrail } from './pages/dashboard/manager/AuditTrail';
import { Pharmacies } from './pages/dashboard/manager/Pharmacies';

import { Medicines } from './pages/dashboard/pharmacist/Medicines';
import { SaleCreation } from './pages/dashboard/pharmacist/SaleCreation';
import { Reports } from './pages/dashboard/pharmacist/Reports';
import { PendingPayments } from './pages/dashboard/cashier/PendingPayments';
import { Returns } from './pages/dashboard/cashier/Returns';
import { Transactions } from './pages/dashboard/cashier/Transactions';
import { POSOperations } from './pages/dashboard/cashier/POSOperations';
import { FinancialOperations } from './pages/dashboard/cashier/FinancialOperations';
import { SessionManagement } from './pages/dashboard/cashier/SessionManagement';
import { ShiftSummary } from './pages/dashboard/cashier/ShiftSummary';

import { StockRequests } from './pages/dashboard/pharmacist/StockRequests';
import { ExpiryAlerts } from './pages/dashboard/pharmacist/ExpiryAlerts';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />;
  }

  const userRole = user?.role;

  // Check if pharmacy is suspended/deleted (for non-admin users)
  if (userRole !== 'admin' && user?.pharmacy_status && 
      (user.pharmacy_status === 'inactive' || user.pharmacy_status === 'deleted')) {
    return <Navigate to='/auth/pharmacy-suspended' replace />;
  }

  if (user?.must_change_password && window.location.pathname !== '/auth/change-password') {
    return <Navigate to='/auth/change-password' replace />;
  }

  const isAdmin = userRole === 'admin';

  const isAllowed =
    !allowedRoles ||
    allowedRoles.some((role) => {
      if (role === 'admin') {
        return isAdmin;
      }
      return userRole === role;
    });

  if (!isAllowed) {
    if (isAdmin) return <Navigate to='/admin/overview' replace />;
    if (userRole === 'manager') return <Navigate to='/manager/overview' replace />;
    if (userRole === 'pharmacist') return <Navigate to='/pharmacist/overview' replace />;
    if (userRole === 'cashier') return <Navigate to='/cashier/overview' replace />;
    return <Navigate to='/auth/login' replace />;
  }

  return children;
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public / Unauthenticated Routes */}
      <Route path='/' element={<LandingPage />} />
      <Route path='/auth/login' element={<LoginPage />} />
      <Route path='/auth/signup' element={<SignupPage />} />
      
      <Route path='/auth/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/auth/reset-password' element={<ResetPasswordPage />} />
      <Route path='/auth/change-password' element={<ChangePasswordPage />} />
      <Route path='/auth/verify-email' element={<VerifyEmailPage />} />
      <Route path='/auth/pending-approval' element={<PendingApprovalPage />} />
      <Route path='/auth/pharmacy-request-confirm' element={<PharmacyRequestConfirmPage />} />
      <Route path='/auth/pharmacy-suspended' element={<PharmacySuspendedPage />} />

      {/* Protected Routes */}
      <Route
        path='/admin/*'
        element={
          <SignedIn>
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Navigate to='overview' replace />} />
                  <Route path='overview' element={<AdminOverview />} />
                  <Route path='approvals' element={<AdminApprovals />} />
                  <Route path='pharmacies' element={<AdminPharmacies />} />
                  <Route path='branches' element={<AdminBranches />} />
                  <Route path='managers' element={<AdminManagers />} />
                  <Route path='audit-logs' element={<AdminAuditLogs />} />
                  <Route path='settings' element={<AdminSettings />} />
                </Route>
              </Routes>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />

      <Route
        path='/manager/*'
        element={
          <SignedIn>
            <RoleProtectedRoute allowedRoles={['manager']}>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Navigate to='overview' replace />} />
                  <Route path='overview' element={<Overview />} />
                  <Route path='staff' element={<StaffManagement />} />
                  <Route path='inventory' element={<InventoryManagement />} />
                  <Route path='settings' element={<Settings />} />
                  <Route path='import' element={<ImportData />} />
                  <Route path='notifications' element={<Notifications />} />
                  <Route path='pos-sales' element={<ManagerPOSSales />} />
                  <Route path='audit-trail' element={<AuditTrail />} />
                  <Route path='pharmacies' element={<Pharmacies />} />
                </Route>
              </Routes>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />

      <Route
        path='/pharmacist/*'
        element={
          <SignedIn>
            <RoleProtectedRoute allowedRoles={['pharmacist']}>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Navigate to='overview' replace />} />
                  <Route path='overview' element={<PharmacistOverview />} />
                  <Route path='inventory' element={<PharmacistInventory />} />
                  <Route path='reports' element={<PharmacyReports />} />
                  <Route path='settings' element={<PharmacistSettings />} />
                  <Route path='medicines' element={<Medicines />} />
                  <Route path='sale' element={<SaleCreation />} />
                  <Route path='stock-requests' element={<StockRequests />} />
                  <Route path='expiry-alerts' element={<ExpiryAlerts />} />
                  <Route path='medicines-reports' element={<Reports />} />
                </Route>
              </Routes>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />

      <Route
        path='/cashier/*'
        element={
          <SignedIn>
            <RoleProtectedRoute allowedRoles={['cashier']}>
              <Routes>
                 <Route element={<DashboardLayout />}>
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
              </Routes>
            </RoleProtectedRoute>
          </SignedIn>
        }
      />

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
