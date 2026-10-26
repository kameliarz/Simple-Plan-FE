import type { InventoryType } from "../types/inventory.types";

export const classificationOptions: Record<InventoryType, { label: string; value: string }[]> = {
  tik: [{ label: "Alat IT", value: "alat-it" }],

  sarpras: [
    { label: "Tanah", value: "tanah" },
    { label: "Bangunan", value: "bangunan" },
    { label: "Alat Sarpras", value: "alat-sarpras" },
    { label: "Alat Medis", value: "alat-medis" },
    { label: "Alat Elektronik", value: "alat-elektronik" },
    { label: "Kendaraan", value: "kendaraan" },
  ],
};

import type { FormState, InventoryStatus, InventoryCondition } from "../types/inventory.types";

export const roomOptions = [
  { label: "Lantai 1", value: "lantai-1" },
  { label: "Lantai 2", value: "lantai-2" },
  { label: "Ruang Finance", value: "ruang-finance" },
  { label: "Ruang HR", value: "ruang-hr" },
  { label: "Ruang Meeting", value: "ruang-meeting" },
  { label: "Server Room", value: "server-room" },
];

export const itemOptions = [
  {
    label: "PC All-in-One Core i5 Poli Dalam",
    value: "pc-all-in-one-core-i5-poli-dalam",
  },
  {
    label: "Laptop Lenovo ThinkPad",
    value: "laptop-lenovo-thinkpad",
  },
  {
    label: "Monitor Dell 24 Inch",
    value: "monitor-dell-24",
  },
  {
    label: "Printer Epson L3250",
    value: "printer-epson-l3250",
  },
  {
    label: "Keyboard Logitech",
    value: "keyboard-logitech",
  },
];

export const statusOptions = [
  { label: "Digunakan", value: "digunakan" },
  { label: "Tidak Digunakan", value: "tidak-digunakan" },
  { label: "Rusak", value: "rusak" },
  { label: "Dipinjam", value: "dipinjam" },
] satisfies {
  label: string;
  value: InventoryStatus;
}[];

export const conditionOptions = [
  { label: "Baik", value: "baik" },
  { label: "Rusak Ringan", value: "rusak-ringan" },
  { label: "Rusak Berat", value: "rusak-berat" },
] satisfies {
  label: string;
  value: InventoryCondition;
}[];

export const initialForm: FormState = {
  classification: "alat-it",
  roomLocation: "",
  location: "",
  itemName: "",
  detailItem: "",
  model: "",
  serialNumber: "",
  purchaseYear: "",
  warrantyUntil: "",
  status: "digunakan",
  condition: "baik",
  description: "",
};
