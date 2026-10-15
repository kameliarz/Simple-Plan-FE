import { useState, type FormEvent } from "react";

import Dropdown from "@/components/ui/ui-template/Dropdown";
import Input from "@/components/ui/ui-template/Input";
import TextArea from "@/components/ui/ui-template/TextArea";
import CategorySelector from "@/components/ui/ui-template/CategorySelector";
import Button from "@/components/ui/ui-template/Button";

import {
  classificationOptions,
  roomOptions,
  itemOptions,
  statusOptions,
  conditionOptions,
} from "../constants/inventoryOptions";

import type {
  FormState,
  InventoryStatus,
  InventoryCondition,
  InventoryType,
} from "../types/inventory.types";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = mode === "edit";

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (
      !form.classification ||
      !form.roomLocation ||
      !form.location.trim() ||
      !form.itemName ||
      !form.model.trim() ||
      !form.serialNumber.trim() ||
      !form.purchaseYear
    ) {
      window.alert("Mohon lengkapi semua field wajib.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
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
            value={inventoryType === "tik" ? "alat-it" : form.classification}
            options={classificationOptions[inventoryType]}
            onChange={(value) => handleChange("classification", value)}
            disabled={inventoryType === "tik"}
            placeholder="Pilih klasifikasi"
            className="w-full"
          />
        </div>

        {/* LOKASI RUANGAN */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-secondary">
            Lokasi Ruangan
            <span className="ml-1 text-red-500">*</span>
          </label>

          <Dropdown
            value={form.roomLocation}
            options={roomOptions}
            onChange={(value) => handleChange("roomLocation", value)}
            placeholder="Masukkan lokasi ruangan"
            searchable
            searchPlaceholder="Cari lokasi ruangan..."
            sheetTitle="Pilih Lokasi Ruangan"
            mobileSheet
            className="w-full"
          />
        </div>

        {/* LOKASI */}
        <Input
          label="Lokasi"
          name="location"
          value={form.location}
          onChange={(event) => handleChange("location", event.target.value)}
          placeholder="Contoh: Lantai 1"
          required
        />

        {/* NAMA BARANG */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-secondary">
            Nama Barang
            <span className="ml-1 text-red-500">*</span>
          </label>

          <Dropdown
            value={form.itemName}
            options={itemOptions}
            onChange={(value) => handleChange("itemName", value)}
            placeholder="Contoh: PC All-in-One Core i5 Poli Dalam"
            searchable
            searchPlaceholder="Cari nama barang..."
            sheetTitle="Pilih Nama Barang"
            mobileSheet
            className="w-full"
          />
        </div>

        {/* MODEL */}
        <Input
          label="Model/Spesifikasi"
          name="model"
          value={form.model}
          onChange={(event) => handleChange("model", event.target.value)}
          placeholder="Contoh: Core i7-12700, 16GB RAM, 512GB SSD"
          required
        />

        {/* SERIAL NUMBER */}
        <Input
          label="Serial Number (S/N)"
          name="serialNumber"
          value={form.serialNumber}
          onChange={(event) => handleChange("serialNumber", event.target.value)}
          placeholder="Contoh: 4CE2460NSL"
          required
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
  );
}
