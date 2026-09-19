export type HelpdeskCategory = "tik" | "sarpras";

export interface InventoryUnit {
  id: number;
  name: string;
}

export interface HelpdeskTicketForm {
  reporterName: string;

  category: HelpdeskCategory;

  inventoryNumber: string;
  inventoryName: string;
  brandSeries: string;
  unit: string | null;

  issueDescription: string;

  evidence: File | null;
}
