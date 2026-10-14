import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

import InventoryForm from "../components/InventoryForm";
import { dummyInventories } from "../data/dummyInventory";

import type { FormState, InventoryType } from "../types/inventory.types";

interface EditInventoryPageProps {
  inventoryType: InventoryType;
}

export default function EditInventoryPage({ inventoryType }: EditInventoryPageProps) {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const isTik = inventoryType === "tik";

  // Cari data inventaris sesuai ID dan jenis inventaris
  const inventory = dummyInventories.find(
    (item) => item.id === id && item.inventoryType === inventoryType,
  );

  // Jika inventaris tidak ditemukan
  if (!inventory) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F8FC] dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Data inventaris tidak ditemukan
        </h2>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          Kembali
        </button>
      </div>
    );
  }

  // Simulasi update inventaris
  const handleUpdate = (data: FormState) => {
    console.log("Update inventory:", {
      id: inventory.id,
      inventoryNumber: inventory.inventoryNumber,
      inventoryType,
      ...data,
    });

    window.alert(`Simulasi: Data inventaris ${isTik ? "TIK" : "Sarpras"} berhasil diperbarui!`);

    // TODO: Integrasi API update inventory
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-4 dark:bg-slate-950 md:px-6">
      {/* BACK BUTTON */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary-600"
      >
        <IconArrowLeft size={18} strokeWidth={1.8} />

        <span>Ubah Data Inventaris {isTik ? "TIK" : "Sarpras"}</span>
      </button>

      {/* FORM EDIT */}
      <InventoryForm
        key={inventory.id}
        mode="edit"
        inventoryType={inventoryType}
        initialValues={inventory}
        inventoryId={inventory.id}
        inventoryNumber={inventory.inventoryNumber}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
