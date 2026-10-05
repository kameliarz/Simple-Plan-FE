import { useState } from "react";
import { Tag } from "lucide-react";

import Modal from "@/components/ui/ui-template/Modal";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";
import TextArea from "@/components/ui/ui-template/TextArea";

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EscalationFormData) => void;
}

export interface EscalationFormData {
  destination: "Manajemen" | "Vendor" | "Tim Terkait";
  notes: string;
}

const destinationOptions = ["Manajemen", "Vendor", "Tim Terkait"];

const EscalationModal = ({ isOpen, onClose, onSave }: EscalationModalProps) => {
  const [destination, setDestination] = useState<"Manajemen" | "Vendor" | "Tim Terkait" | "">("");

  const [notes, setNotes] = useState("");

  const [destinationError, setDestinationError] = useState("");
  const [notesError, setNotesError] = useState("");

  const handleSave = () => {
    let hasError = false;

    if (!destination) {
      setDestinationError("Tujuan eskalasi wajib dipilih!");
      hasError = true;
    } else {
      setDestinationError("");
    }

    if (!notes.trim()) {
      setNotesError("Catatan eskalasi wajib diisi!");
      hasError = true;
    } else {
      setNotesError("");
    }

    if (hasError || !destination) return;

    onSave({
      destination,
      notes: notes.trim(),
    });
  };

  const handleClose = () => {
    setDestination("");
    setNotes("");
    setDestinationError("");
    setNotesError("");

    onClose();
  };

  return (
    <Modal
      show={isOpen}
      onClose={handleClose}
      closeable
      showHeader
      title="Eskalasi Tiket"
      icon={<Tag size={18} />}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Tujuan Eskalasi */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-primary">
            Tujuan Eskalasi
            <span className="text-red-500">*</span>
          </label>

          <Dropdown
            value={destination}
            options={destinationOptions}
            onChange={(value) => {
              setDestination(value.toLowerCase() as "Manajemen" | "Vendor" | "Tim Terkait");
              setDestinationError("");
            }}
            placeholder="Pilih tujuan eskalasi"
            error={destinationError}
            className="w-full"
          />
        </div>

        {/* Catatan Eskalasi */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-primary">
            Catatan Eskalasi
            <span className="text-red-500">*</span>
          </label>

          <TextArea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setNotesError("");
            }}
            placeholder=""
            rows={4}
            error={notesError}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
        <Button type="button" label="Batal" variant="secondary" size="sm" onClick={handleClose} />

        <Button
          type="button"
          label="Kirim Eskalasi"
          variant="primary"
          size="sm"
          onClick={handleSave}
        />
      </div>
    </Modal>
  );
};

export default EscalationModal;
