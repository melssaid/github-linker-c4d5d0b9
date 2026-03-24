import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "@/i18n";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { RoleRedirect } from "@/components/layout/RoleRedirect";
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

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function KgAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isKgAdmin, loading: roleLoading } = useRole();
  if (loading || roleLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isKgAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
      <Route path="/" element={<ProtectedRoute><RoleRedirect><Index /></RoleRedirect></ProtectedRoute>} />
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
      {/* Redirects for old routes */}
      <Route path="/survey" element={<Navigate to="/students" replace />} />
      <Route path="/history" element={<Navigate to="/reports" replace />} />
      <Route path="/attendance" element={<Navigate to="/students" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
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
);

export default App;
