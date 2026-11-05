import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import type { Role } from "@/types/auth";
import { useAuth } from "@/features/auth-login/context/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children?: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, token, isLoading } = useAuth();

  if (isLoading) return <div>Memuat sesi...</div>;
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.some((role) => role === user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
