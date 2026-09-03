import { Wrench } from "lucide-react";
import BaseTab from "./BaseTab";

export default function MaintenanceTab() {
  return <BaseTab to="/maintenance" icon={Wrench} label="Maintenance" />;
}