import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import InventoryForm from "../components/InventoryForm";
import { initialForm } from "../constants/inventoryOptions";

import type { FormState, InventoryType } from "../types/inventory.types";

interface CreateInventoryPageProps {
  inventoryType: InventoryType;
}

export default function CreateInventoryPage({ inventoryType }: CreateInventoryPageProps) {
  const navigate = useNavigate();

  const isTik = inventoryType === "tik";

  const formInitialValues: FormState = {
    ...initialForm,
    classification: isTik ? "alat-it" : "",
  };

  const handleCreate = (data: FormState) => {
    console.log("Create inventory:", {
      inventoryType,
      ...data,
    });

    window.alert(`Simulasi: Inventaris ${isTik ? "TIK" : "Sarpras"} berhasil dibuat!`);
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
