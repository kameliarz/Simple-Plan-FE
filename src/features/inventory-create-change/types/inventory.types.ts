export type InventoryType = "tik" | "sarpras";

export type InventoryStatus = "digunakan" | "tidak-digunakan" | "rusak" | "dipinjam";

export type InventoryCondition = "baik" | "rusak-ringan" | "rusak-berat";

export interface FormState {
  classification: string;
  roomLocation: string;
  location: string;
  itemName: string;
  detailItem: string;
  model: string;
  serialNumber: string;
  purchaseYear: string;
  warrantyUntil: string;
  status: InventoryStatus;
  condition: InventoryCondition;
  description: string;
}

export interface Inventory extends FormState {
  id: string;
  inventoryNumber: string;
  inventoryType: InventoryType;
}
