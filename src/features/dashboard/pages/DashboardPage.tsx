import { useAuth } from "@/features/auth-login/context/AuthContext";
import SuperAdminDashboard from "../components/super-admin/SuperAdminDashboard";
import KoordinatorSarprasDashboard from "../components/koordinator-sarpras/KoordinatorSarprasDashboard";
import ManajemenDashboard from "../components/manajemen/ManajemenDashboard";
import PetugasTikDashboard from "../components/petugas-tik/PetugasTikDashboard";
import PetugasSarprasDashboard from "../components/petugas-sarpras/PetugasSarprasDashboard";
import UserDashboard from "../components/user/UserDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "super-admin";

  switch (role) {
    case "user":
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <UserDashboard />
        </div>
      );
    case "petugas-tik":
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <PetugasTikDashboard />
        </div>
      );
    case "petugas-sarpras":
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <PetugasSarprasDashboard />
        </div>
      );
    case "koordinator-sarpras":
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <KoordinatorSarprasDashboard />
        </div>
      );
    case "manajemen":
    case "management":
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <ManajemenDashboard />
        </div>
      );
    case "super-admin":
    default:
      return (
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          <SuperAdminDashboard />
        </div>
      );
  }
}
