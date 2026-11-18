import { Database } from "lucide-react";
import { useAuth } from "@/features/auth-login/context/AuthContext";
import { MASTER_DATA_ROLES } from "@/types/auth";
import BaseTab from "./BaseTab";

export default function MasterDataTab() {
  const { user } = useAuth();

  if (!MASTER_DATA_ROLES.some((role) => role === user?.role)) {
    return null;
  }

  return <BaseTab to="/master-data" icon={Database} label="Master Data" />;
}
