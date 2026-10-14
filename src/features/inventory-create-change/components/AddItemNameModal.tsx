import { useState, type FormEvent } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import Input from "@/components/ui/ui-template/Input";
import Button from "@/components/ui/ui-template/Button";

interface AddItemNameModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (itemName: string) => void;
}

const MAX_LENGTH = 100;

function ItemNameForm({ onClose, onSave }: Omit<AddItemNameModalProps, "show">) {
  const [itemName, setItemName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = itemName.trim();

    if (!trimmedName) {
      setError("Nama barang wajib diisi.");
      return;
    }

    onSave(trimmedName);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          error={error}
          required
          autoFocus
          className="pr-14"
        />

        <span className="absolute right-0 top-0 text-xs text-slate-500 dark:text-slate-400">
          {itemName.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="flex justify-end">
        <Button type="submit" label="Simpan" variant="primary" className="min-w-28" />
      </div>
    </form>
  );
}

export default function AddItemNameModal({ show, onClose, onSave }: AddItemNameModalProps) {
  return (
    <Modal show={show} onClose={onClose} title="Tambah Nama Barang Baru" maxWidth="md">
      {show && <ItemNameForm onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}
