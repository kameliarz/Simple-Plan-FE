import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import InventoryForm from "../components/InventoryForm";
import { initialForm } from "../constants/inventoryOptions";

import { inventoryService } from "../services/inventoryService";
import { useToast } from "@/components/ui/ui-template/UseToast";

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
  const { showToast } = useToast();

  const isTik = inventoryType === "tik";

  // ==============================
  // INITIAL FORM VALUES
  // ==============================
  const formInitialValues: FormState = {
    ...initialForm,
    classification: "",
  };

  // ==============================
  // CREATE INVENTORY
  // ==============================
  const handleCreate = async (data: FormState) => {
    try {
      // Konversi data form ke FormData
      const formData = new FormData();

      // Relasi aset
      formData.append("asset_classification_id", data.classification);
      formData.append("asset_location_id", data.roomLocation);
      formData.append("asset_item_id", data.itemName);

      // Detail aset
      formData.append("location_detail", data.location.trim());
      formData.append("model_specification", data.model.trim());
      formData.append("serial_number", data.serialNumber.trim());
      formData.append("purchase_year", data.purchaseYear);
      if (data.detailItem?.trim()) {
        formData.append("detail_item", data.detailItem.trim());
      }

      // Status dan kondisi
      formData.append("status", statusMapping[data.status]);
      formData.append("condition", conditionMapping[data.condition]);

      // Garansi (opsional)
      if (data.warrantyUntil) {
        formData.append("warranty_until", data.warrantyUntil);
      }

      // Keterangan (opsional)
      if (data.description.trim()) {
        formData.append("notes", data.description.trim());
      }

      // Brand
      formData.append("brand", "");

      // Kirim data ke backend
      await inventoryService.createAsset(formData);

      // Tentukan halaman tujuan
      const destination = isTik ? "/inventaris/tik" : "/inventaris/sarpras";

      // Redirect dan kirim toast sukses
      navigate(destination, {
        state: {
          toast: {
            message: "Data Aset Berhasil Ditambahkan!",
            type: "success",
          },
        },
      });
    } catch (error) {
      console.error("Gagal menyimpan inventory:", error);

      const message =
        error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan inventory.";

      // Error tetap muncul di halaman create
      showToast(message, "error");
    }
  };

  // ==============================
  // RENDER CREATE INVENTORY
  // ==============================
  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-4 dark:bg-slate-950 md:px-6">
      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary-600"
      >
        <IconArrowLeft size={18} strokeWidth={1.8} />

        <span>Tambah Asset</span>
      </button>

      {/* FORM CREATE */}
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
