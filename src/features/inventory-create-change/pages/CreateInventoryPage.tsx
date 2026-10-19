import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import InventoryForm from "../components/InventoryForm";
import { initialForm } from "../constants/inventoryOptions";

import { inventoryService } from "../services/inventoryService";

import type { FormState, InventoryType } from "../types/inventory.types";

interface CreateInventoryPageProps {
  inventoryType: InventoryType;
}

const statusMapping = {
  digunakan: "Digunakan",
  "tidak-digunakan": "Tidak Digunakan",
  rusak: "Rusak",
  dipinjam: "Dipinjam",
} as const;

const conditionMapping = {
  baik: "Baik",
  "rusak-ringan": "Rusak Ringan",
  "rusak-berat": "Rusak Berat",
} as const;

export default function CreateInventoryPage({ inventoryType }: CreateInventoryPageProps) {
  const navigate = useNavigate();

  const isTik = inventoryType === "tik";

  const formInitialValues: FormState = {
    ...initialForm,
    classification: "",
  };

  const handleCreate = async (data: FormState) => {
    try {
      const formData = new FormData();

      formData.append("asset_classification_id", data.classification);
      formData.append("asset_location_id", data.roomLocation);
      formData.append("asset_item_id", data.itemName);

      formData.append("location_detail", data.location.trim());
      formData.append("model_specification", data.model.trim());
      formData.append("serial_number", data.serialNumber.trim());
      formData.append("purchase_year", data.purchaseYear);

      formData.append("status", statusMapping[data.status]);
      formData.append("condition", conditionMapping[data.condition]);

      if (data.warrantyUntil) {
        formData.append("warranty_until", data.warrantyUntil);
      }

      if (data.description.trim()) {
        formData.append("notes", data.description.trim());
      }

      formData.append("brand", "");

      await inventoryService.createAsset(formData);

      window.alert(`Inventaris ${isTik ? "TIK" : "Sarpras"} berhasil disimpan!`);

      navigate(-1);
    } catch (error) {
      console.error("Gagal menyimpan inventory:", error);

      window.alert(
        error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan inventory.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-4 dark:bg-slate-950 md:px-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary-600"
      >
        <IconArrowLeft size={18} strokeWidth={1.8} />
        <span>Tambah Inventaris {isTik ? "TIK" : "Sarpras"}</span>
      </button>

      <InventoryForm
        key={inventoryType}
        mode="create"
        inventoryType={inventoryType}
        initialValues={formInitialValues}
        onSubmit={handleCreate}
      />
    </div>
  );
}
