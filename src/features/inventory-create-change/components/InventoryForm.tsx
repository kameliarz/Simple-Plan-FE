import { useEffect, useState, type FormEvent } from "react";

import Dropdown from "@/components/ui/ui-template/Dropdown";
import Input from "@/components/ui/ui-template/Input";
import TextArea from "@/components/ui/ui-template/TextArea";
import CategorySelector from "@/components/ui/ui-template/CategorySelector";
import Button from "@/components/ui/ui-template/Button";
import { IconAlertCircle } from "@tabler/icons-react";

import AddItemNameModal from "./AddItemNameModal";
import AddRoomLocationModal from "./AddRoomLocationModal";

import { statusOptions, conditionOptions } from "../constants/inventoryOptions";

import type {
  FormState,
  InventoryStatus,
  InventoryCondition,
  InventoryType,
} from "../types/inventory.types";

import {
  inventoryService,
  type AssetClassification,
  type AssetLocation,
  type AssetItem,
} from "../services/inventoryService";

interface InventoryFormProps {
  mode: "create" | "edit";
  inventoryType: InventoryType;
  initialValues: FormState;
  onSubmit: (data: FormState) => void | Promise<void>;
  inventoryId?: string;
  inventoryNumber?: string;
}

export default function InventoryForm({
  mode,
  inventoryType,
  initialValues,
  onSubmit,
  inventoryId,
  inventoryNumber,
}: InventoryFormProps) {
  const [form, setForm] = useState<FormState>(() => ({ ...initialValues }));

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);

  const [classifications, setClassifications] = useState<AssetClassification[]>([]);

  const [isLoadingClassifications, setIsLoadingClassifications] = useState(true);

  const [locations, setLocations] = useState<AssetLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [items, setItems] = useState<AssetItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemError, setItemError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchClassifications = async () => {
      try {
        setIsLoadingClassifications(true);

        const data = await inventoryService.getClassifications();

        if (active) {
          setClassifications(data);
        }
      } catch (error) {
        console.error("Gagal mengambil klasifikasi:", error);
      } finally {
        if (active) {
          setIsLoadingClassifications(false);
        }
      }
    };

    fetchClassifications();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        setLocationError(null);

        const data = await inventoryService.getLocations();

        if (active) {
          setLocations(data);
        }
      } catch (error) {
        console.error("Gagal mengambil lokasi ruangan:", error);

        if (active) {
          setLocationError("Gagal memuat lokasi ruangan.");
        }
      } finally {
        if (active) {
          setIsLoadingLocations(false);
        }
      }
    };

    fetchLocations();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchItems = async () => {
      try {
        setIsLoadingItems(true);
        setItemError(null);

        const data = await inventoryService.getItems();

        if (active) {
          setItems(data);
        }
      } catch (error) {
        console.error("Gagal mengambil nama barang:", error);

        if (active) {
          setItemError("Gagal memuat nama barang.");
        }
      } finally {
        if (active) {
          setIsLoadingItems(false);
        }
      }
    };

    fetchItems();

    return () => {
      active = false;
    };
  }, []);

  const classificationDropdownOptions = classifications
    .filter((item) => inventoryType === "tik" || item.name !== "Alat IT")
    .map((item) => ({
      value: String(item.id),
      label: item.name,
    }));

  const tikClassification = classifications.find((item) => item.name === "Alat IT");

  const tikClassificationId = tikClassification ? String(tikClassification.id) : "";

  const effectiveClassification =
    inventoryType === "tik" ? tikClassificationId : form.classification;

  const isEdit = mode === "edit";

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    // Hapus error setelah field diisi
    setErrors((previous) => ({
      ...previous,
      [key]: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const submissionData: FormState = {
      ...form,
      classification: effectiveClassification,
    };

    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!submissionData.classification) {
      newErrors.classification = "Klasifikasi wajib diisi!";
    }

    if (!submissionData.roomLocation) {
      newErrors.roomLocation = "Lokasi Ruangan wajib diisi!";
    }

    if (!submissionData.location.trim()) {
      newErrors.location = "Lokasi wajib diisi!";
    }

    if (!submissionData.itemName) {
      newErrors.itemName = "Nama Barang wajib diisi!";
    }

    if (!submissionData.model.trim()) {
      newErrors.model = "Model/Spesifikasi wajib diisi!";
    }

    if (!submissionData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial Number wajib diisi!";
    }

    if (!submissionData.purchaseYear) {
      newErrors.purchaseYear = "Tahun Beli wajib diisi!";
    }
    if (!submissionData.status) {
      newErrors.status = "Status wajib dipilih!";
    }

    if (!submissionData.condition) {
      newErrors.condition = "Kondisi wajib dipilih!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const locationDropdownOptions = locations.map((item) => ({
    value: String(item.id),
    label: `${item.name}`,
  }));

  const itemDropdownOptions = items.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const handleNewItemSaved = (newItem: AssetItem) => {
    setItems((previous) => {
      const exists = previous.some((item) => item.id === newItem.id);

      return exists ? previous : [...previous, newItem];
    });

    // Otomatis pilih barang yang baru dibuat
    handleChange("itemName", String(newItem.id));
  };

  // Setelah berhasil menambahkan lokasi ruangan
  const handleNewRoomSaved = (newLocation: AssetLocation) => {
    setLocations((previous) => {
      const exists = previous.some((location) => location.id === newLocation.id);

      return exists ? previous : [...previous, newLocation];
    });

    // Otomatis pilih ruangan yang baru dibuat
    handleChange("roomLocation", String(newLocation.id));
  };

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="
        rounded-xl border border-slate-200
        bg-white p-5 shadow-sm
        dark:border-slate-700 dark:bg-slate-900
        md:p-6
      "
      >
        {/* IDENTITAS ASET - HANYA MODE EDIT */}
        {isEdit && (
          <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary">ID Barang</label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-text-secondary">ID Barang</p>
                <p className="text-sm font-semibold text-primary-600">{inventoryId ?? "-"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-secondary">No. Inventaris</label>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs text-text-secondary">No. Inventaris</p>
                <p className="text-sm font-semibold text-primary-600">{inventoryNumber ?? "-"}</p>
              </div>
            </div>
          </div>
        )}

        {/* FORM FIELDS */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
          {/* KLASIFIKASI */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-secondary">
              Klasifikasi
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Dropdown
              value={isLoadingClassifications ? "" : effectiveClassification}
              options={classificationDropdownOptions}
              onChange={(value) => handleChange("classification", value)}
              disabled={inventoryType === "tik" || isLoadingClassifications}
              searchable={false}
              placeholder={isLoadingClassifications ? "Memuat klasifikasi..." : "Pilih klasifikasi"}
              className="w-full"
            />
            {errors.classification && (
              <small className="flex items-center gap-1 text-xs font-normal text-danger-500">
                <IconAlertCircle size={14} strokeWidth={2} />
                <span>{errors.classification}</span>
              </small>
            )}
          </div>

          {/* LOKASI RUANGAN */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-secondary">
              Lokasi Ruangan
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Dropdown
              value={isLoadingLocations || locationError ? "" : form.roomLocation}
              options={locationDropdownOptions}
              onChange={(value) => handleChange("roomLocation", value)}
              disabled={isLoadingLocations || !!locationError}
              placeholder={
                isLoadingLocations
                  ? "Memuat lokasi ruangan..."
                  : locationError
                    ? "Gagal memuat lokasi ruangan"
                    : "Pilih lokasi ruangan"
              }
              searchable
              searchPlaceholder="Cari lokasi ruangan..."
              sheetTitle="Pilih Lokasi Ruangan"
              mobileSheet
              className="w-full"
              emptyMessage="Lokasi ruangan yang Anda cari belum terdaftar."
              emptyActionLabel="Klik di sini untuk menambahkan sebagai data baru."
              onEmptyActionClick={() => {
                setShowAddRoomModal(true);
              }}
            />
            {errors.roomLocation && (
              <small className="flex items-center gap-1 text-xs font-normal text-danger-500">
                <IconAlertCircle size={14} strokeWidth={2} />
                <span>{errors.roomLocation}</span>
              </small>
            )}
          </div>

          {/* LOKASI */}
          <Input
            label="Lokasi"
            name="location"
            value={form.location}
            onChange={(event) => handleChange("location", event.target.value)}
            placeholder="Contoh: Lantai 1"
            required
            error={errors.location}
          />

          {/* NAMA BARANG */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-secondary">
              Nama Barang
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Dropdown
              value={isLoadingItems || itemError ? "" : form.itemName}
              options={itemDropdownOptions}
              onChange={(value) => handleChange("itemName", value)}
              disabled={isLoadingItems || !!itemError}
              placeholder={
                isLoadingItems
                  ? "Memuat nama barang..."
                  : itemError
                    ? "Gagal memuat nama barang"
                    : "Pilih nama barang"
              }
              searchable
              searchPlaceholder="Cari nama barang..."
              sheetTitle="Pilih Nama Barang"
              mobileSheet
              className="w-full"
              emptyMessage="Nama barang yang Anda cari belum terdaftar."
              emptyActionLabel="Klik di sini untuk menambahkan sebagai data baru."
              onEmptyActionClick={() => {
                setShowAddItemModal(true);
              }}
            />
            {errors.itemName && (
              <small className="flex items-center gap-1 text-xs font-normal text-danger-500">
                <IconAlertCircle size={14} strokeWidth={2} />
                <span>{errors.itemName}</span>
              </small>
            )}
          </div>

          {/* MODEL */}
          <Input
            label="Model/Spesifikasi"
            name="model"
            value={form.model}
            onChange={(event) => handleChange("model", event.target.value)}
            placeholder="Contoh: Core i7-12700, 16GB RAM, 512GB SSD"
            required
            error={errors.model}
          />

          {/* SERIAL NUMBER */}
          <Input
            label="Serial Number (S/N)"
            name="serialNumber"
            value={form.serialNumber}
            onChange={(event) => handleChange("serialNumber", event.target.value)}
            placeholder="Contoh: 4CE2460NSL"
            required
            error={errors.serialNumber}
          />

          {/* TAHUN BELI */}
          <Input
            label="Tahun Beli"
            name="purchaseYear"
            type="number"
            min={1900}
            max={2100}
            value={form.purchaseYear}
            onChange={(event) => handleChange("purchaseYear", event.target.value)}
            placeholder="2024"
            required
            error={errors.purchaseYear}
          />

          {/* GARANSI */}
          <Input
            label="Garansi s/d"
            name="warrantyUntil"
            type="date"
            value={form.warrantyUntil}
            onChange={(event) => handleChange("warrantyUntil", event.target.value)}
          />
        </div>

        {/* STATUS */}
        <div className="mt-5">
          <CategorySelector<InventoryStatus>
            name="status"
            label="Status"
            required
            value={form.status}
            options={statusOptions}
            onChange={(value) => handleChange("status", value)}
            className="
            [&>div]:grid-cols-1
            sm:[&>div]:grid-cols-2
            lg:[&>div]:grid-cols-4
            [&_label]:items-center
            [&_label]:py-2.5
          "
          />
          {errors.status && (
            <small className="mt-2 flex items-center gap-1 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.status}</span>
            </small>
          )}
        </div>

        {/* KONDISI */}
        <div className="mt-5">
          <CategorySelector<InventoryCondition>
            name="condition"
            label="Kondisi"
            required
            value={form.condition}
            options={conditionOptions}
            onChange={(value) => handleChange("condition", value)}
            className="
            [&>div]:grid-cols-1
            sm:[&>div]:grid-cols-2
            lg:[&>div]:grid-cols-3
            lg:[&>div]:max-w-[75%]
            [&_label]:items-center
            [&_label]:py-2.5
          "
          />
          {errors.condition && (
            <small className="mt-2 flex items-center gap-1 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.condition}</span>
            </small>
          )}
        </div>

        {/* KETERANGAN */}
        <div className="mt-5">
          <TextArea
            label="Keterangan"
            name="description"
            value={form.description}
            onChange={(event) => handleChange("description", event.target.value)}
            placeholder="Catatan tambahan..."
            rows={4}
            className="min-h-30"
          />
        </div>

        {/* TOMBOL SIMPAN */}
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            label={isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan"}
            variant="primary"
            className="min-w-30"
            disabled={isSubmitting}
          />
        </div>
      </form>

      {/* MODAL TAMBAH NAMA BARANG */}
      <AddItemNameModal
        show={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onSaved={handleNewItemSaved}
        inventoryType={inventoryType}
        classificationOptions={classificationDropdownOptions}
        defaultClassification={effectiveClassification}
      />

      {/* MODAL TAMBAH LOKASI RUANGAN */}
      <AddRoomLocationModal
        show={showAddRoomModal}
        onClose={() => setShowAddRoomModal(false)}
        onSaved={handleNewRoomSaved}
      />
    </>
  );
}
