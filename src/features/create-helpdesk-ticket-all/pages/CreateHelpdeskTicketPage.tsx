import { useEffect, useCallback, useState, type FormEvent } from "react";

import { IconArrowLeft, IconArrowRight, IconCircleCheck, IconX } from "@tabler/icons-react";

import TextArea from "@/components/ui/ui-template/TextArea";
import Button from "@/components/ui/ui-template/Button";
import Modal from "@/components/ui/ui-template/Modal";

import TicketSection from "../components/TicketSection";
import ReporterSection from "../components/ReporterSection";
import InventorySection from "../components/InventorySection";
import EvidenceSection from "../components/EvidenceSection";

import { searchUsersByName, type SearchedUser, createTicket } from "../services/searchApi";
import { useAuth } from "@/features/auth-login/context/AuthContext";

import type { HelpdeskCategory, HelpdeskTicketForm } from "../types";

export default function CreateHelpdeskTicketPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super-admin";

  const [searchedUsers, setSearchedUsers] = useState<SearchedUser[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [searchUsersError, setSearchUsersError] = useState("");
  const [showUserResults, setShowUserResults] = useState(false);

  // State untuk penanganan submit API
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdTicketNumber, setCreatedTicketNumber] = useState("");

  const [form, setForm] = useState<HelpdeskTicketForm>(() => ({
    reporterName: user?.nama ?? "",
    selectedReporterId: user?.id ? String(user.id) : "",
    category: "sarpras",
    assetId: null,
    inventoryNumber: "",
    inventoryName: "",
    brandSeries: "",
    reporterUnit: user?.unit_user ?? null,
    inventoryUnit: null,
    location: "",
    issueDescription: "",
    evidence: null,
  }));

  // Menyimpan pesan error untuk setiap field
  const [errors, setErrors] = useState<Partial<Record<keyof HelpdeskTicketForm, string>>>({});

  // Mengatur tampilan modal berhasil
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleReporterSearchChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      reporterName: value,
      reporterUnit: null,
    }));

    setShowUserResults(true);
    setSearchUsersError("");
  };

  useEffect(() => {
    if (!isSuperAdmin) return;

    const searchName = form.reporterName.trim();

    if (searchName.length < 2) return;

    let cancelled = false;

    const timeoutId = window.setTimeout(async () => {
      if (cancelled) return;

      setIsSearchingUsers(true);

      try {
        const users = await searchUsersByName(searchName);

        if (!cancelled) {
          setSearchedUsers(users);
          setSearchUsersError("");
        }
      } catch {
        if (!cancelled) {
          setSearchUsersError("Pencarian user gagal. Coba lagi.");
          setSearchedUsers([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearchingUsers(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [form.reporterName, isSuperAdmin]);

  const handleCategoryChange = (value: HelpdeskCategory) => {
    setForm((prev) => ({
      ...prev,
      category: value,
    }));
  };

  // Mengubah nilai field pada form (Dideklarasikan sebelum useEffect)
  const updateField = useCallback(
    <K extends keyof HelpdeskTicketForm>(field: K, value: HelpdeskTicketForm[K]) => {
      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));

      // Menghapus error ketika field mulai diisi
      setErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }));
    },
    [],
  );

  // Validasi form sebelum dikirim
  const validateForm = () => {
    const newErrors: Partial<Record<keyof HelpdeskTicketForm, string>> = {};

    if (!form.reporterName.trim()) {
      newErrors.reporterName = "Nama pelapor wajib diisi!";
    }

    if (!form.reporterUnit) {
      newErrors.reporterUnit = "Unit pelapor wajib diisi!";
    }

    if (!form.inventoryUnit) {
      newErrors.inventoryUnit = "Unit inventaris wajib diisi!";
    }

    if (!form.issueDescription.trim()) {
      newErrors.issueDescription = "Deskripsi kendala wajib diisi!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Menangani submit form ke API
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await createTicket({
        service: form.category, // "sarpras" | "tik"
        asset_id: form.assetId,
        description: form.issueDescription,
        initial_evidence: form.evidence,
      });

      if (response?.data?.ticket_number) {
        setCreatedTicketNumber(response.data.ticket_number);
      }

      setShowSuccessModal(true);
    } catch (err: unknown) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : "Gagal membuat tiket. Silakan coba lagi.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectReporter = (selectedUser: SearchedUser) => {
    setForm((prev) => ({
      ...prev,
      reporterName: selectedUser.name,
      reporterUnit: selectedUser.unit?.unit_name ?? null,
    }));

    setShowUserResults(false);
    setSearchedUsers([]);
    setSearchUsersError("");
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-250 px-6 py-5 sm:px-6 lg:px-0">
        {/* Page heading */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-slate-500 transition hover:text-bluersch"
          >
            <IconArrowLeft size={20} strokeWidth={1.7} />
          </button>

          <h1 className="text-sm font-semibold text-text">Buat Tiket</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Informasi Pelapor */}
          <TicketSection title="Informasi Pelapor">
            <ReporterSection
              reporterName={form.reporterName}
              selectedReporterId={form.selectedReporterId}
              unit={form.reporterUnit}
              category={form.category}
              isSuperAdmin={isSuperAdmin}
              searchedUsers={searchedUsers}
              isSearchingUsers={isSearchingUsers}
              searchUsersError={searchUsersError}
              showUserResults={showUserResults}
              reporterNameError={errors.reporterName}
              unitError={errors.reporterUnit}
              onReporterSearchChange={handleReporterSearchChange}
              onSelectReporter={handleSelectReporter}
              onCategoryChange={handleCategoryChange}
            />
          </TicketSection>

          {/* Data Inventaris */}
          <TicketSection title="Data Inventaris">
            <InventorySection
              unit={form.inventoryUnit}
              inventoryNumber={form.inventoryNumber}
              inventoryName={form.inventoryName}
              location={form.location}
              unitError={errors.inventoryUnit}
              onUnitChange={(value) => updateField("inventoryUnit", value)}
              onInventoryNumberChange={(value) => updateField("inventoryNumber", value)}
              onInventoryNameChange={(value) => updateField("inventoryName", value)}
              onLocationChange={(value) => updateField("location", value)}
              onAssetIdChange={(assetId) => updateField("assetId", assetId)}
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
            <EvidenceSection
              value={form.evidence}
              onChange={(file) => updateField("evidence", file)}
            />
          </TicketSection>

          {submitError && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pb-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              icon={<IconArrowRight size={17} />}
              label="Kirim Tiket"
              className="w-full sm:w-auto"
            />
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
              {createdTicketNumber ? ` dengan nomor tiket: ${createdTicketNumber}` : "!"}
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
}
