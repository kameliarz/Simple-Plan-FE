import { Database } from "lucide-react";
import BaseTab from "./BaseTab";

export default function MasterDataTab() {
  return <BaseTab to="/master-data" icon={Database} label="Master Data" />;
}
