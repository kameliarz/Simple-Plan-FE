import { useEffect, useState } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";

import InventoryForm from "../components/InventoryForm";
import { inventoryService, mapAssetToForm, type AssetDetail } from "../services/inventoryService";

import type { FormState, InventoryType } from "../types/inventory.types";

interface EditInventoryPageProps {
  inventoryType: InventoryType;
}

export default function EditInventoryPage({ inventoryType }: EditInventoryPageProps) {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const isTik = inventoryType === "tik";

  const [inventory, setInventory] = useState<AssetDetail | null>(null);
  const [formValues, setFormValues] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchInventory = async () => {
      if (!id) {
        setError("ID inventaris tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setInventory(null);
        setFormValues(null);

        const asset = await inventoryService.getAssetById(id);
        const mappedForm = mapAssetToForm(asset);

        if (active) {
          setInventory(asset);
          setFormValues(mappedForm);
        }
      } catch (error) {
        console.error("Gagal mengambil detail inventory:", error);

        if (active) {
          setError("Gagal memuat data inventaris.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchInventory();

    return () => {
      active = false;
    };
  }, [id]);

  // Jika inventaris tidak ditemukan
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FC] dark:bg-slate-950">
        <p className="text-sm text-text-secondary">Memuat data inventaris...</p>
      </div>
    );
  }

  if (error || !inventory || !formValues) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F8FC] dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          {error ?? "Data inventaris tidak ditemukan."}
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

  const handleUpdate = (data: FormState) => {
    console.log("Update inventory:", {
      id: inventory.id,
      ...data,
    });

    window.alert("Simulasi: Perubahan data inventaris belum dikirim ke backend.");
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
        initialValues={formValues}
        inventoryId={String(inventory.id)}
        inventoryNumber={inventory.asset_code.full_code}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
