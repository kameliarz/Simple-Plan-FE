import { useAuth } from "@/features/auth-login/context/AuthContext";
import SuperAdminDashboard from "../components/super-admin/SuperAdminDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "super-admin";

  switch (role) {
    case "super-admin":
    default:
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <SuperAdminDashboard />
        </div>
      );
  }
}
