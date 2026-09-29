import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  userRole: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export default function ProtectedRoute({
  allowedRoles,
  userRole,
  isAuthenticated,
  isLoading,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (isLoading) {
    return <div>Memuat sesi...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
