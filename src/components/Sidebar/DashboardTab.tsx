import { LayoutDashboard } from "lucide-react";
import BaseTab from "./BaseTab";

export default function DashboardTab() {
  return <BaseTab to="/" icon={LayoutDashboard} label="Dashboard" />;
}