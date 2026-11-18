import { Wrench } from "lucide-react";
import { useAuth } from "@/features/auth-login/context/AuthContext";
import { MAINTENANCE_ROLES } from "@/types/auth";
import BaseTab from "./BaseTab";

export default function MaintenanceTab() {
  const { user } = useAuth();

  if (!MAINTENANCE_ROLES.some((role) => role === user?.role)) {
    return null;
  }

  return <BaseTab to="/maintenance" icon={Wrench} label="Maintenance" />;
}
