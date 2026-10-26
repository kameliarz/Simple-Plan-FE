import { useState, type FormEvent } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import Input from "@/components/ui/ui-template/Input";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";

import { useToast } from "@/components/ui/ui-template/UseToast";

import { inventoryService, type AssetItem } from "../services/inventoryService";

import type { InventoryType } from "../types/inventory.types";

interface DropdownOption {
  value: string;
  label: string;
}

interface AddItemNameModalProps {
  show: boolean;
  onClose: () => void;
  onSaved: (item: AssetItem) => void;
  inventoryType: InventoryType;
  classificationOptions: DropdownOption[];
  defaultClassification: string;
}

const MAX_LENGTH = 100;

function ItemNameForm({
  onClose,
  onSaved,
  inventoryType,
  classificationOptions,
  defaultClassification,
}: Omit<AddItemNameModalProps, "show">) {
  const { showToast } = useToast();

  const isTik = inventoryType === "tik";

  const [classification, setClassification] = useState(defaultClassification);

  const [itemName, setItemName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedName = itemName.trim();
    const classificationId = Number(classification);

    if (!classification || !Number.isInteger(classificationId) || classificationId <= 0) {
      setError("Klasifikasi wajib dipilih.");
      return;
    }

    if (!trimmedName) {
      setError("Nama barang wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const newItem = await inventoryService.createItem(classificationId, trimmedName);

      onSaved(newItem);
      onClose();

      showToast("Nama Barang Berhasil Ditambahkan!", "success");
    } catch (error) {
      console.error("Gagal menambah nama barang:", error);

      setError(error instanceof Error ? error.message : "Gagal menambahkan nama barang.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* KLASIFIKASI */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-text-secondary">
          Klasifikasi
          <span className="ml-1 text-red-500">*</span>
        </label>

        <Dropdown
          value={classification}
          options={classificationOptions}
          onChange={(value) => {
            setClassification(value);
            setError("");
          }}
          disabled={isTik || isSubmitting}
          searchable={false}
          placeholder="Pilih klasifikasi"
          className="w-full"
        />
      </div>

      {/* NAMA BARANG */}
      <div className="relative">
        <Input
          id="newItemName"
          name="newItemName"
          label="Nama Barang"
          placeholder="Masukkan nama barang baru..."
          value={itemName}
          onChange={(event) => {
            setItemName(event.target.value);
            if (error) setError("");
          }}
          maxLength={MAX_LENGTH}
          required
          autoFocus
          disabled={isSubmitting}
          className="pr-14"
        />

        <span className="absolute right-0 top-0 text-xs text-slate-500 dark:text-slate-400">
          {itemName.length}/{MAX_LENGTH}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}

      {/* TOMBOL SIMPAN */}
      <div className="flex justify-end">
        <Button
          type="submit"
          label={isSubmitting ? "Menyimpan..." : "Simpan"}
          variant="primary"
          className="min-w-28"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

export default function AddItemNameModal({
  show,
  onClose,
  onSaved,
  inventoryType,
  classificationOptions,
  defaultClassification,
}: AddItemNameModalProps) {
  return (
    <Modal
      show={show}
      onClose={() => {
        onClose();
      }}
      title="Tambah Nama Barang Baru"
      maxWidth="md"
    >
      {show && (
        <ItemNameForm
          onClose={onClose}
          onSaved={onSaved}
          inventoryType={inventoryType}
          classificationOptions={classificationOptions}
          defaultClassification={defaultClassification}
        />
      )}
    </Modal>
  );
}
