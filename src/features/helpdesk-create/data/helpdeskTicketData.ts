import type { InventoryUnit } from "../types";

export const inventoryUnits: InventoryUnit[] = [
  {
    id: 1,
    name: "Poli Rawat Jalan / Poli Dalam",
  },
  {
    id: 2,
    name: "Unit Gawat Darurat (UGD)",
  },
  {
    id: 3,
    name: "Ruang Rawat Inap Melati Lt. 3",
  },
  {
    id: 4,
    name: "Instalasi Farmasi Sentral",
  },
  {
    id: 5,
    name: "Laboratorium & Radiologi",
  },
];

export const unitOptions = inventoryUnits.map((unit) => unit.name);

export const helpdeskCategories = [
  {
    value: "tik",
    label: "Teknologi Informasi & Komunikasi (TIK)",
  },
  {
    value: "sarpras",
    label: "Sarana & Prasarana (Sarpras)",
  },
] as const;
