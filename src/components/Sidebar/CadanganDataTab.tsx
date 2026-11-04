import { CloudSync } from "lucide-react";
import { useAuth } from "@/features/auth-login/context/AuthContext";
import { BACKUP_ROLES } from "@/types/auth";
import BaseTab from "./BaseTab";

export default function CadanganDataTab() {
  const { user } = useAuth();
  if (!BACKUP_ROLES.some((role) => role === user?.role)) return null;
  return <BaseTab to="/back-up-data" icon={CloudSync} label="Back Up Data" />;
}
