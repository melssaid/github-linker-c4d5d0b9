import { Navigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";

export function RoleRedirect({ children }: { children: React.ReactNode }) {
  const { isAdmin, isKgAdmin, loading } = useRole();

  if (loading) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isKgAdmin) return <Navigate to="/kg-admin" replace />;
  return <>{children}</>;
}
