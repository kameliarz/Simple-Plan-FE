import { useState, type FormEvent } from "react";

import { IconArrowLeft, IconDeviceDesktop } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/ui-template/Button";
import CategorySelector from "@/components/ui/ui-template/CategorySelector";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import Input from "@/components/ui/ui-template/Input";
import TextArea from "@/components/ui/ui-template/TextArea";

type InventoryStatus = "digunakan" | "tidak-digunakan" | "rusak" | "dipinjam";

type InventoryCondition = "baik" | "rusak-ringan" | "rusak-berat";

interface FormState {
  classification: string;
  roomLocation: string;
  itemName: string;
  model: string;
  serialNumber: string;
  purchaseYear: string;
  warrantyUntil: string;
  status: InventoryStatus;
  condition: InventoryCondition;
  description: string;
}

const classificationOptions = [
  {
    label: "Alat IT",
    value: "alat-it",
  },
  {
    label: "Furniture",
    value: "furniture",
  },
  {
    label: "Elektronik",
    value: "elektronik",
  },
];

const roomOptions = [
  {
    label: "Lantai 1",
    value: "lantai-1",
  },
  {
    label: "Lantai 2",
    value: "lantai-2",
  },
  {
    label: "Ruang Finance",
    value: "ruang-finance",
  },
  {
    label: "Ruang HR",
    value: "ruang-hr",
  },
  {
    label: "Ruang Meeting",
    value: "ruang-meeting",
  },
  {
    label: "Server Room",
    value: "server-room",
  },
];

const itemOptions = [
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

const statusOptions = [
  {
    label: "Digunakan",
    value: "digunakan",
  },
  {
    label: "Tidak Digunakan",
    value: "tidak-digunakan",
  },
  {
    label: "Rusak",
    value: "rusak",
  },
  {
    label: "Dipinjam",
    value: "dipinjam",
  },
] satisfies {
  label: string;
  value: InventoryStatus;
}[];

const conditionOptions = [
  {
    label: "Baik",
    value: "baik",
  },
  {
    label: "Rusak Ringan",
    value: "rusak-ringan",
  },
  {
    label: "Rusak Berat",
    value: "rusak-berat",
  },
] satisfies {
  label: string;
  value: InventoryCondition;
}[];

const initialForm: FormState = {
  classification: "alat-it",
  roomLocation: "",
  itemName: "",
  model: "",
  serialNumber: "",
  purchaseYear: "",
  warrantyUntil: "",
  status: "digunakan",
  condition: "baik",
  description: "",
};

export default function CreateInventoryPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(initialForm);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Create inventory:", form);

    // TODO:
    // panggil API create inventory di sini
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-4 dark:bg-slate-950 md:px-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition hover:text-primary-600"
      >
        <IconArrowLeft size={18} strokeWidth={1.8} />
        <span>Tambah Aset</span>
      </button>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6"
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
          {/* Klasifikasi */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-secondary">
              Klasifikasi
              <span className="ml-1 text-red-500">*</span>
            </label>

            <Dropdown
              value={form.classification}
              options={classificationOptions}
              onChange={(value) => handleChange("classification", value)}
              placeholder="Pilih klasifikasi"
              className="w-full"
              displayValue={form.classification === "alat-it" ? "Alat IT" : undefined}
            />

            {form.classification === "alat-it" ? (
              <div className="pointer-events-none absolute opacity-0">
                <IconDeviceDesktop size={16} />
              </div>
            ) : null}
          </div>

          {/* Lokasi Ruangan */}
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

          {/* Lokasi */}
          <Input label="Lokasi" name="location" placeholder="Contoh: Lantai 1" required />

          {/* Nama Barang */}
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

          {/* Model / Spesifikasi */}
          <Input
            label="Model/Spesifikasi"
            name="model"
            value={form.model}
            onChange={(event) => handleChange("model", event.target.value)}
            placeholder="Contoh: Core i7-12700, 16GB RAM, 512GB SSD"
            required
          />

          {/* Serial Number */}
          <Input
            label="Serial Number (S/N)"
            name="serialNumber"
            value={form.serialNumber}
            onChange={(event) => handleChange("serialNumber", event.target.value)}
            placeholder="Contoh: 4CE2460NSL"
            required
          />

          {/* Tahun Beli */}
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

          {/* Garansi */}
          <Input
            label="Garansi s/d"
            name="warrantyUntil"
            type="date"
            value={form.warrantyUntil}
            onChange={(event) => handleChange("warrantyUntil", event.target.value)}
          />
        </div>

        {/* Status */}
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

        {/* Kondisi */}
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

        {/* Keterangan */}
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

        {/* Action */}
        <div className="mt-8 flex justify-end">
          <Button type="submit" label="Simpan" variant="primary" className="min-w-30" />
        </div>
      </form>
    </div>
  );
}
