import { useState, type FormEvent } from "react";

import { IconArrowLeft, IconArrowRight, IconCircleCheck, IconX } from "@tabler/icons-react";

import Input from "@/components/ui/ui-template/Input";
import TextArea from "@/components/ui/ui-template/TextArea";
import Button from "@/components/ui/ui-template/Button";
import Modal from "@/components/ui/ui-template/Modal";

import TicketSection from "../components/TicketSection";
import CategorySelector from "../components/CategorySelector";
import InventorySection from "../components/InventorySection";
import EvidenceUpload from "../components/EvidenceUpload";

import type { HelpdeskCategory, HelpdeskTicketForm } from "../types";

const initialForm: HelpdeskTicketForm = {
  reporterName: "",
  category: "sarpras",
  inventoryNumber: "",
  inventoryName: "",
  brandSeries: "",
  unit: null,
  issueDescription: "",
  evidence: null,
};

export default function CreateHelpdeskTicketPage() {
  const [form, setForm] = useState<HelpdeskTicketForm>(initialForm);

  // Menyimpan pesan error untuk setiap field
  const [errors, setErrors] = useState<Partial<Record<keyof HelpdeskTicketForm, string>>>({});

  // Mengatur tampilan modal berhasil
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Mengubah nilai field pada form
  const updateField = <K extends keyof HelpdeskTicketForm>(
    field: K,
    value: HelpdeskTicketForm[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    // Menghapus error ketika field mulai diisi
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  // Validasi form sebelum dikirim
  const validateForm = () => {
    const newErrors: Partial<Record<keyof HelpdeskTicketForm, string>> = {};

    if (!form.reporterName.trim()) {
      newErrors.reporterName = "Nama pelapor wajib diisi!";
    }

    if (!form.inventoryNumber.trim()) {
      newErrors.inventoryNumber = "No. inventaris wajib diisi!";
    }

    if (!form.inventoryName.trim()) {
      newErrors.inventoryName = "Nama inventaris wajib diisi!";
    }

    if (!form.unit) {
      newErrors.unit = "Unit wajib diisi!";
    }

    if (!form.issueDescription.trim()) {
      newErrors.issueDescription = "Deskripsi kendala wajib diisi!";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Menangani submit form
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Hentikan proses jika validasi gagal
    if (!validateForm()) {
      return;
    }

    console.log("Form tiket:", form);

    // Tampilkan modal setelah form berhasil divalidasi
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-250 py-5">
        {/* Page heading */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-slate-500 transition hover:text-bluersch"
          >
            <IconArrowLeft size={20} strokeWidth={1.7} />
          </button>

          <h1 className="text-base font-semibold text-text">Buat Tiket</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Informasi Pelapor */}
          <TicketSection title="Informasi Pelapor">
            <Input
              label="Nama Pelapor"
              required
              value={form.reporterName}
              onChange={(event) => updateField("reporterName", event.target.value)}
              placeholder="Contoh: dr. Budi Santoso, Sp.PD"
              error={errors.reporterName}
            />

            <CategorySelector
              value={form.category}
              onChange={(value: HelpdeskCategory) => updateField("category", value)}
            />
          </TicketSection>

          {/* Data Inventaris */}
          <TicketSection title="Data Inventaris">
            <InventorySection
              inventoryNumber={form.inventoryNumber}
              inventoryName={form.inventoryName}
              brandSeries={form.brandSeries}
              unit={form.unit}
              inventoryNumberError={errors.inventoryNumber}
              inventoryNameError={errors.inventoryName}
              unitError={errors.unit}
              onInventoryNumberChange={(value) => updateField("inventoryNumber", value)}
              onInventoryNameChange={(value) => updateField("inventoryName", value)}
              onBrandSeriesChange={(value) => updateField("brandSeries", value)}
              onUnitChange={(value) => updateField("unit", value)}
            />
          </TicketSection>

          {/* Detail Kendala */}
          <TicketSection title="Detail Kendala">
            <TextArea
              label="Deskripsi Kendala"
              required
              value={form.issueDescription}
              onChange={(event) => updateField("issueDescription", event.target.value)}
              placeholder="Jelaskan secara runtut kronologi atau kendala yang ditemukan pada alat/sistem..."
              rows={4}
              error={errors.issueDescription}
            />
          </TicketSection>

          {/* Foto Bukti */}
          <TicketSection title="Foto Bukti Awal">
            <EvidenceUpload
              value={form.evidence}
              onChange={(file) => updateField("evidence", file)}
            />
          </TicketSection>

          {/* Submit */}
          <div className="flex justify-end pb-6">
            <Button type="submit" icon={<IconArrowRight size={17} />} label="Kirim Tiket" />
          </div>
        </form>

        {/* Success Modal */}
        <Modal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          closeable
          showHeader={false}
          maxWidth="sm"
        >
          <div className="relative px-8 py-8 text-center">
            {/* Tombol close */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="
                absolute
                right-4
                top-4
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                text-slate-400
                transition
                hover:bg-slate-100
                hover:text-slate-600
            "
              aria-label="Tutup"
            >
              <IconX size={18} strokeWidth={1.7} />
            </button>

            {/* Icon berhasil */}
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50">
              <IconCircleCheck size={28} strokeWidth={2} className="text-emerald-500" />
            </div>

            {/* Judul */}
            <h2 className="text-lg font-semibold text-slate-800">Berhasil!</h2>

            {/* Deskripsi */}
            <p className="mt-2 text-sm leading-5 text-slate-500">
              Tiket berhasil dibuat beserta nomor tiket!
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
