import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../../types/auth";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  userRole: Role | null;
}

function ProtectedRoute({ allowedRoles, userRole }: ProtectedRouteProps) {
  if (!userRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
