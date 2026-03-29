import * as React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Layouts
import { DashboardLayout } from "./layouts/DashboardLayout";

// Pages - Landing
import LandingPage from "./pages/landing/LandingPage";
import AboutPage from "./pages/landing/AboutPage";
import ContactSuccess from "./pages/landing/ContactSuccess";

// Pages - Auth
import { LoginPage } from "./pages/auth/login";
import { SignupPage } from "./pages/auth/signup";
import { SSOCallbackPage } from "./pages/auth/SSOCallbackPage";
import { ForgotPasswordPage } from "./pages/auth/forgot-password";
import { ResetPasswordPage } from "./pages/auth/reset-password";
import { ChangePasswordPage } from "./pages/auth/change-password";
import { VerifyEmailPage } from "./pages/auth/verify-email";
import { PendingApprovalPage } from "./pages/auth/pending-approval";
import { PharmacyRequestConfirmPage } from "./pages/auth/pharmacy-request-confirm";
import { PharmacySuspendedPage } from "./pages/auth/pharmacy-suspended";

// Pages - Dashboard - Lazy loaded for code splitting
const OwnerDashboard = React.lazy(() =>
  import("./pages/dashboard/owner/OwnerDashboard").then((module) => ({
    default: module.OwnerDashboard,
  })),
);
const OwnerAppealHistory = React.lazy(() =>
  import("./pages/dashboard/owner/appeals/OwnerAppealHistory").then(
    (module) => ({
      default: module.OwnerAppealHistory,
    }),
  ),
);
const TestimonialSubmission = React.lazy(() =>
  import("./pages/dashboard/owner/testimonials/TestimonialSubmission").then(
    (module) => ({
      default: module.TestimonialSubmission,
    }),
  ),
);

const AdminDashboard = React.lazy(() =>
  import("./pages/dashboard/admin/AdminDashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const AdminAppealReview = React.lazy(() =>
  import("./pages/dashboard/admin/appeals/AdminAppealReview").then(
    (module) => ({
      default: module.AdminAppealReview,
    }),
  ),
);
const PharmacyDetailPage = React.lazy(() =>
  import("./pages/dashboard/admin/pharmacy-detail/PharmacyDetailPage").then(
    (module) => ({
      default: module.PharmacyDetailPage,
    }),
  ),
);

const ManagerDashboard = React.lazy(() =>
  import("./pages/dashboard/manager/ManagerDashboard").then((module) => ({
    default: module.ManagerDashboard,
  })),
);

const PharmacistDashboard = React.lazy(() =>
  import("./pages/dashboard/pharmacist/PharmacistDashboard").then((module) => ({
    default: module.PharmacistDashboard,
  })),
);

const CashierOverview = React.lazy(() =>
  import("./pages/dashboard/cashier/CashierOverview").then((module) => ({
    default: module.CashierOverview,
  })),
);
const CashierSettings = React.lazy(() =>
  import("./pages/dashboard/cashier/Settings").then((module) => ({
    default: module.Settings,
  })),
);
const StockCheck = React.lazy(() =>
  import("./pages/dashboard/cashier/StockCheck").then((module) => ({
    default: module.StockCheck,
  })),
);
const Receipts = React.lazy(() =>
  import("./pages/dashboard/cashier/Receipts").then((module) => ({
    default: module.Receipts,
  })),
);
const PendingPayments = React.lazy(() =>
  import("./pages/dashboard/cashier/PendingPayments").then((module) => ({
    default: module.PendingPayments,
  })),
);
const Returns = React.lazy(() =>
  import("./pages/dashboard/cashier/Returns").then((module) => ({
    default: module.Returns,
  })),
);
const Transactions = React.lazy(() =>
  import("./pages/dashboard/cashier/Transactions").then((module) => ({
    default: module.Transactions,
  })),
);
const POSOperations = React.lazy(() =>
  import("./pages/dashboard/cashier/POSOperations").then((module) => ({
    default: module.POSOperations,
  })),
);
const FinancialOperations = React.lazy(() =>
  import("./pages/dashboard/cashier/FinancialOperations").then((module) => ({
    default: module.FinancialOperations,
  })),
);
const SessionManagement = React.lazy(() =>
  import("./pages/dashboard/cashier/SessionManagement").then((module) => ({
    default: module.SessionManagement,
  })),
);
const ShiftSummary = React.lazy(() =>
  import("./pages/dashboard/cashier/ShiftSummary").then((module) => ({
    default: module.ShiftSummary,
  })),
);

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <img
          src="/logo.png"
          alt="PharmaCare"
          width={96}
          height={96}
          className="w-24 h-24 mx-auto mb-6 animate-pulse"
        />
        <h2 className="text-3xl font-display font-bold tracking-tight mb-3 text-foreground">
          PharmaCare
        </h2>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          Initialising...
        </p>
        <div className="mt-6 flex justify-center gap-1">
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
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
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = user?.role;

  // Check pharmacy suspension status
  if (
    userRole !== "admin" &&
    user?.pharmacy_status &&
    (user.pharmacy_status === "inactive" || user.pharmacy_status === "deleted")
  ) {
    return <Navigate to="/auth/pharmacy-suspended" replace />;
  }

  if (
    userRole === "owner" &&
    (user?.status === "pending" ||
      user?.pharmacy?.status === "pending" ||
      user?.pharmacy_status === "pending")
  ) {
    if (user?.email) {
      localStorage.setItem("pendingEmail", user.email);
    }
    if (user?.pharmacy?.name) {
      localStorage.setItem("pendingPharmacyName", user.pharmacy.name);
    }
    localStorage.setItem("pendingRequestType", "head_manager");
    return <Navigate to="/auth/pending-approval" replace />;
  }

  // Check password change requirement
  if (
    (user?.must_change_password || user?.mustResetPassword) &&
    window.location.pathname !== "/auth/change-password"
  ) {
    return <Navigate to="/auth/change-password" replace />;
  }

  const isAdmin = userRole === "admin";
  const isAllowed =
    !allowedRoles ||
    allowedRoles.some((role) =>
      role === "admin" ? isAdmin : userRole === role,
    );

  if (!isAllowed) {
    const redirectMap: Record<string, string> = {
      admin: "/admin",
      owner: "/owner",
      manager: "/manager",
      pharmacist: "/pharmacist",
      cashier: "/cashier/overview",
    };
    return (
      <Navigate to={redirectMap[userRole as string] || "/auth/login"} replace />
    );
  }

  return <>{children}</>;
});

// Loading boundary with memo
const LoadingBoundary = React.memo(function LoadingBoundary() {
  const { loading } = useAuth();
  return (
    <div key={loading ? "loading" : "loaded"} className="contents">
      {loading ? <GlobalLoader /> : <Outlet />}
    </div>
  );
});

const SuspenseBoundary = React.memo(function SuspenseBoundary() {
  return (
    <React.Suspense fallback={<GlobalLoader />}>
      <Outlet />
    </React.Suspense>
  );
});

// App routes component - memoized
const AppRoutes = React.memo(function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact-success" element={<ContactSuccess />} />

      {/* Public Auth Routes - NO LoadingBoundary */}
      <Route path="/auth/login/*" element={<LoginPage />} />
      <Route path="/auth/signup/*" element={<SignupPage />} />
      <Route path="/auth/sso-callback" element={<SSOCallbackPage />} />
      <Route path="/auth/forgot-password/*" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/change-password" element={<ChangePasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/auth/pending-approval" element={<PendingApprovalPage />} />
      <Route
        path="/auth/pharmacy-request-confirm"
        element={<PharmacyRequestConfirmPage />}
      />
      <Route
        path="/auth/pharmacy-suspended"
        element={<PharmacySuspendedPage />}
      />

      {/* Protected Routes - WITH LoadingBoundary and Suspense for lazy loading */}
      <Route element={<LoadingBoundary />}>
        <Route element={<SuspenseBoundary />}>
          {/* Owner Dashboard */}
          <Route
            path="/owner"
            element={
              <RoleProtectedRoute allowedRoles={["owner"]}>
                <DashboardLayout>
                  <OwnerDashboard />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/owner/appeals"
            element={
              <RoleProtectedRoute allowedRoles={["owner"]}>
                <DashboardLayout>
                  <OwnerAppealHistory />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/owner/testimonials"
            element={
              <RoleProtectedRoute allowedRoles={["owner"]}>
                <DashboardLayout>
                  <TestimonialSubmission />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/pharmacies/:pharmacyId"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <PharmacyDetailPage />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/appeals"
            element={
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminAppealReview />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Manager Dashboard */}
          <Route
            path="/manager"
            element={
              <RoleProtectedRoute allowedRoles={["manager"]}>
                <DashboardLayout>
                  <ManagerDashboard />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Pharmacist Dashboard */}
          <Route
            path="/pharmacist"
            element={
              <RoleProtectedRoute allowedRoles={["pharmacist"]}>
                <DashboardLayout>
                  <PharmacistDashboard />
                </DashboardLayout>
              </RoleProtectedRoute>
            }
          />

          {/* Cashier Routes - Nested */}
          <Route
            path="/cashier"
            element={
              <RoleProtectedRoute allowedRoles={["cashier"]}>
                <DashboardLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CashierOverview />} />
            <Route path="stock" element={<StockCheck />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="settings" element={<CashierSettings />} />
            <Route path="payments/pending" element={<PendingPayments />} />
            <Route path="returns" element={<Returns />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="pos" element={<POSOperations />} />
            <Route path="sessions" element={<SessionManagement />} />
            <Route path="shift-summary" element={<ShiftSummary />} />
            <Route path="sales" element={<FinancialOperations />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
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
      <Toaster position="top-right" closeButton richColors />
    </QueryClientProvider>
  );
}

export default App;
