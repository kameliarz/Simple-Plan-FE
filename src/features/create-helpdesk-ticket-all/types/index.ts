export type HelpdeskCategory = "tik" | "sarpras";

export interface InventoryUnit {
  id: number;
  name: string;
}

export interface HelpdeskTicketForm {
  reporterName: string;
  selectedReporterId: string;
  category: HelpdeskCategory;
  reporterUnit: string | null;
  inventoryUnit: string | null;
  inventoryNumber: string;
  inventoryName: string;
  brandSeries: string;
  location: string;
  issueDescription: string;
  evidence: File | null;
}
