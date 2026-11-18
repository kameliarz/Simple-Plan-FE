import { FileBarChart } from "lucide-react";
import BaseTab from "./BaseTab";

export default function LaporanTab() {
  return <BaseTab to="/report" icon={FileBarChart} label="Laporan" />;
}
