import { useState, type FormEvent } from "react";

import Modal from "@/components/ui/ui-template/Modal";
import Input from "@/components/ui/ui-template/Input";
import Button from "@/components/ui/ui-template/Button";

interface AddRoomLocationModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (roomName: string) => void;
}

const MAX_LENGTH = 100;

function RoomLocationForm({ onClose, onSave }: Omit<AddRoomLocationModalProps, "show">) {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = roomName.trim();

    if (!trimmedName) {
      setError("Lokasi ruangan wajib diisi.");
      return;
    }

    onSave(trimmedName);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          error={error}
          required
          autoFocus
          className="pr-14"
        />

        <span className="absolute right-0 top-0 text-xs text-slate-500 dark:text-slate-400">
          {roomName.length}/{MAX_LENGTH}
        </span>
      </div>

      <div className="flex justify-end">
        <Button type="submit" label="Simpan" variant="primary" className="min-w-28" />
      </div>
    </form>
  );
}

export default function AddRoomLocationModal({ show, onClose, onSave }: AddRoomLocationModalProps) {
  return (
    <Modal show={show} onClose={onClose} title="Tambah Lokasi Ruangan Baru" maxWidth="md">
      {show && <RoomLocationForm onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}
