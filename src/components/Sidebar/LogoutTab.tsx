import { LogOut } from "lucide-react";

import BaseTab from "./BaseTab";

interface LogoutTabProps {
  onLogout?: () => void;
}

export default function LogoutTab({ onLogout }: LogoutTabProps) {
  return <BaseTab icon={LogOut} label="Logout" onClick={onLogout} className="text-red-500" />;
}
