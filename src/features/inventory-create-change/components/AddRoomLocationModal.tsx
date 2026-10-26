import { useState, type FormEvent } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import Input from "@/components/ui/ui-template/Input";
import Button from "@/components/ui/ui-template/Button";

import { useToast } from "@/components/ui/ui-template/UseToast";

import { inventoryService, type AssetLocation } from "../services/inventoryService";

interface AddRoomLocationModalProps {
  show: boolean;
  onClose: () => void;
  onSaved: (location: AssetLocation) => void;
}

const MAX_LENGTH = 100;

function RoomLocationForm({ onClose, onSaved }: Omit<AddRoomLocationModalProps, "show">) {
  const { showToast } = useToast();

  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedName = roomName.trim();

    if (!trimmedName) {
      setError("Lokasi ruangan wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const newLocation = await inventoryService.createLocation(trimmedName);

      onSaved(newLocation);
      onClose();

      showToast("Lokasi Ruangan Berhasil Ditambahkan!", "success");
    } catch (error) {
      console.error("Gagal menambah lokasi ruangan:", error);

      setError(error instanceof Error ? error.message : "Gagal menambahkan lokasi ruangan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* NAMA LOKASI */}
      <div className="relative">
        <Input
          id="newRoomLocation"
          name="newRoomLocation"
          label="Lokasi Ruangan"
          placeholder="Masukkan lokasi ruangan baru..."
          value={roomName}
          onChange={(event) => {
            setRoomName(event.target.value);
            if (error) setError("");
          }}
          maxLength={MAX_LENGTH}
          required
          autoFocus
          disabled={isSubmitting}
          className="pr-14"
        />

        <span className="absolute right-0 top-0 text-xs text-slate-500 dark:text-slate-400">
          {roomName.length}/{MAX_LENGTH}
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

export default function AddRoomLocationModal({
  show,
  onClose,
  onSaved,
}: AddRoomLocationModalProps) {
  return (
    <Modal show={show} onClose={onClose} title="Tambah Lokasi Ruangan Baru" maxWidth="md">
      {show && <RoomLocationForm onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}
