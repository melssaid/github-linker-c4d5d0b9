import { Component, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/i18n";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { RoleRedirect } from "@/components/layout/RoleRedirect";
import LandingPage from "./pages/LandingPage";
import DailyOperationsPage from "./pages/DailyOperationsPage";
import Index from "./pages/Index";
import StudentsPage from "./pages/StudentsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import ReportsPage from "./pages/ReportsPage";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKindergartens from "./pages/admin/AdminKindergartens";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminKindergartenDetail from "./pages/admin/AdminKindergartenDetail";
import KgAdminDashboard from "./pages/kg-admin/KgAdminDashboard";
import KgAdminTeachers from "./pages/kg-admin/KgAdminTeachers";
import NotFound from "./pages/NotFound";

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/** Top-level error boundary that prevents an unhandled JS error from crashing the entire UI. */
class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive">
            حدث خطأ غير متوقع
          </h1>
          <p className="text-muted-foreground max-w-md">
            {this.state.error?.message ?? "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى."}
          </p>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = "/";
            }}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Route guards
// ---------------------------------------------------------------------------

const queryClient = new QueryClient();

/** Spinner shown while auth/role state is loading. */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  if (loading || roleLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function KgAdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { isKgAdmin, loading: roleLoading } = useRole();
  if (loading || roleLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isKgAdmin) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
      <Route path="/app" element={<ProtectedRoute><RoleRedirect><Index /></RoleRedirect></ProtectedRoute>} />
      <Route path="/daily-ops" element={<ProtectedRoute><DailyOperationsPage /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
      <Route path="/students/:studentId" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
      <Route path="/students/:studentId/assess" element={<ProtectedRoute><StudentProfilePage initialTab="assess" /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/kindergartens" element={<AdminRoute><AdminKindergartens /></AdminRoute>} />
      <Route path="/admin/kindergartens/:kgId" element={<AdminRoute><AdminKindergartenDetail /></AdminRoute>} />
      <Route path="/admin/teachers" element={<AdminRoute><AdminTeachers /></AdminRoute>} />
      <Route path="/kg-admin" element={<KgAdminRoute><KgAdminDashboard /></KgAdminRoute>} />
      <Route path="/kg-admin/teachers" element={<KgAdminRoute><KgAdminTeachers /></KgAdminRoute>} />
      <Route path="/survey" element={<Navigate to="/students" replace />} />
      <Route path="/history" element={<Navigate to="/reports" replace />} />
      <Route path="/attendance" element={<Navigate to="/students" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

// ---------------------------------------------------------------------------
// App root
// ---------------------------------------------------------------------------

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
