import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconCloudUpload,
  IconFileText,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/ui-template/Button";
import { getUser } from "@/features/auth-login/services/authStorage";
import { cn } from "@/lib/utils";
import { designGraphicService } from "../services/designGraphicService";

interface FormErrors {
  judulRequest?: string;
  jenisDesain?: string;
  deskripsiKebutuhan?: string;
  tanggalDibutuhkan?: string;
  fileReferensi?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function getTodayIsoString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function BuatRequestDesainPage() {
  const navigate = useNavigate();
  const user = getUser();

  const namaPemohon =
    user?.nama && user.nama !== "Agung Sunaryo" ? user.nama : "Agung Sunaryo S.Kom";
  const unitPemohon = user?.unit_user || "IT";

  const [judulRequest, setJudulRequest] = useState("");
  const [jenisDesain, setJenisDesain] = useState("");
  const [deskripsiKebutuhan, setDeskripsiKebutuhan] = useState("");
  const [tanggalDibutuhkan, setTanggalDibutuhkan] = useState("");
  const [fileReferensi, setFileReferensi] = useState<File | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File | undefined) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isAllowedExt = ["pdf", "jpg", "jpeg", "png"].includes(ext);

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !isAllowedExt) {
      setErrors((prev) => ({
        ...prev,
        fileReferensi: "Format file harus PDF, JPG, atau PNG!",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        fileReferensi: "Ukuran file maksimal 5MB!",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, fileReferensi: undefined }));
    setFileReferensi(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileValidation(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    handleFileValidation(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    const todayIso = getTodayIsoString();

    if (!judulRequest.trim()) {
      newErrors.judulRequest = "Judul request wajib diisi!";
    }

    if (!jenisDesain.trim()) {
      newErrors.jenisDesain = "Jenis desain wajib diisi!";
    }

    if (!deskripsiKebutuhan.trim()) {
      newErrors.deskripsiKebutuhan = "Deskripsi kebutuhan wajib diisi!";
    }

    if (!tanggalDibutuhkan) {
      newErrors.tanggalDibutuhkan = "Tanggal wajib diisi!";
    } else if (tanggalDibutuhkan < todayIso) {
      newErrors.tanggalDibutuhkan = "Tanggal dibutuhkan tidak boleh lebih awal dari hari ini!";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await designGraphicService.createRequest({
        judulRequest,
        jenisDesain,
        deskripsiKebutuhan,
        tanggalDibutuhkan,
        fileReferensi,
        namaPemohon,
        unit: unitPemohon,
      });

      setShowSuccessAlert(true);
      setJudulRequest("");
      setJenisDesain("");
      setDeskripsiKebutuhan("");
      setTanggalDibutuhkan("");
      setFileReferensi(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Gagal mengirim request desain:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClass =
    "h-11 w-full rounded-lg border bg-table-card px-4 text-sm text-text placeholder:text-[#91A4C3] outline-none transition focus:border-primary-600 dark:border-slate-700";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
      {/* Header Row + Success Banner */}
      <div className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Circular Back Button */}
          <button
            type="button"
            onClick={() => navigate("/design-graphic/my-requests")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white transition active:scale-95 md:hidden"
            title="Kembali"
          >
            <IconArrowLeft size={18} strokeWidth={2.2} />
          </button>

          {/* Desktop Plain Back Button */}
          <button
            type="button"
            onClick={() => navigate("/design-graphic/my-requests")}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition hover:bg-gray-100 active:scale-95 dark:hover:bg-slate-800 md:flex"
            title="Kembali"
          >
            <IconArrowLeft size={20} strokeWidth={2} />
          </button>

          <h1 className="font-poppins text-base font-semibold text-text-title md:text-lg">
            Buat Request
          </h1>
        </div>

        {/* Success Toast Banner */}
        {showSuccessAlert && (
          <div className="fixed left-1/2 top-16 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-emerald-200 bg-success-50 px-4 py-2.5 text-xs font-medium text-success-700 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200/70 text-success-700 dark:bg-emerald-800 dark:text-emerald-200">
              <IconCheck size={13} strokeWidth={2.5} />
            </span>
            <span className="whitespace-nowrap">Request desain berhasil dikirim</span>
            <button
              type="button"
              onClick={() => setShowSuccessAlert(false)}
              className="ml-1 hidden text-success-700 hover:text-emerald-900 dark:text-emerald-300 md:inline-flex"
              aria-label="Tutup pesan"
            >
              <IconX size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-2xl border border-med-border bg-table-card p-6 shadow-sm transition-colors sm:p-8"
      >
        {/* 1. JUDUL REQUEST * */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            JUDUL REQUEST <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={judulRequest}
            onChange={(e) => {
              setJudulRequest(e.target.value);
              if (errors.judulRequest) {
                setErrors((prev) => ({ ...prev, judulRequest: undefined }));
              }
            }}
            placeholder="Contoh: Poster Kegiatan Vaksinasi"
            className={cn(
              inputBaseClass,
              errors.judulRequest
                ? "border-danger-500 focus:border-danger-500"
                : "border-med-border",
            )}
          />
          {errors.judulRequest && (
            <small className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.judulRequest}</span>
            </small>
          )}
        </div>

        {/* 2. JENIS DESAIN * */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            JENIS DESAIN <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={jenisDesain}
            onChange={(e) => {
              setJenisDesain(e.target.value);
              if (errors.jenisDesain) {
                setErrors((prev) => ({ ...prev, jenisDesain: undefined }));
              }
            }}
            placeholder="Contoh: Poster"
            className={cn(
              inputBaseClass,
              errors.jenisDesain
                ? "border-danger-500 focus:border-danger-500"
                : "border-med-border",
            )}
          />
          {errors.jenisDesain && (
            <small className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.jenisDesain}</span>
            </small>
          )}
        </div>

        {/* 3. DESKRIPSI KEBUTUHAN * */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            DESKRIPSI KEBUTUHAN <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={deskripsiKebutuhan}
            onChange={(e) => {
              setDeskripsiKebutuhan(e.target.value);
              if (errors.deskripsiKebutuhan) {
                setErrors((prev) => ({ ...prev, deskripsiKebutuhan: undefined }));
              }
            }}
            placeholder="Jelaskan detail kebutuhan desain, ukuran, dll"
            className={cn(
              inputBaseClass,
              errors.deskripsiKebutuhan
                ? "border-danger-500 focus:border-danger-500"
                : "border-med-border",
            )}
          />
          {errors.deskripsiKebutuhan && (
            <small className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.deskripsiKebutuhan}</span>
            </small>
          )}
        </div>

        {/* 4. TANGGAL DIBUTUHKAN * */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            TANGGAL DIBUTUHKAN <span className="text-danger-500">*</span>
          </label>
          <input
            type="date"
            value={tanggalDibutuhkan}
            onChange={(e) => {
              setTanggalDibutuhkan(e.target.value);
              if (errors.tanggalDibutuhkan) {
                setErrors((prev) => ({ ...prev, tanggalDibutuhkan: undefined }));
              }
            }}
            placeholder="mm/dd/yyyy"
            className={cn(
              inputBaseClass,
              !tanggalDibutuhkan && "text-[#91A4C3]",
              errors.tanggalDibutuhkan
                ? "border-danger-500 focus:border-danger-500"
                : "border-med-border",
            )}
          />
          {errors.tanggalDibutuhkan && (
            <small className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.tanggalDibutuhkan}</span>
            </small>
          )}
        </div>

        {/* 5. FILE REFERENSI */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            FILE REFERENSI
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Desktop Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="hidden min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary-200 px-6 py-6 text-center transition hover:border-primary-300 hover:bg-slate-300/10 md:flex"
          >
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-button text-primary-600">
              <IconFileText size={21} strokeWidth={1.7} />
            </div>
            {fileReferensi ? (
              <p className="text-sm font-medium text-primary-600">{fileReferensi.name}</p>
            ) : (
              <p className="text-sm text-text-secondary">
                Tarik & lepas file di sini, atau{" "}
                <span className="font-semibold text-primary-600">Pilih Dokumen</span>
              </p>
            )}
            <p className="mt-1 text-xs text-[#91A4C3]">Format: PDF, JPG, PNG (Maksimal 5MB)</p>
          </div>

          {/* Mobile Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-med-border bg-button/50 px-4 py-5 text-center md:hidden"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-selected text-primary-600">
              <IconCloudUpload size={20} strokeWidth={1.8} />
            </div>
            <p className="text-xs font-semibold text-text">
              {fileReferensi ? fileReferensi.name : "Pilih dokumen referensi"}
            </p>
            <p className="mt-0.5 text-xs text-[#91A4C3]">PDF, JPG, PNG (Maksimal 5MB)</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-2.5 rounded-lg bg-selected px-4 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
            >
              Pilih File
            </button>
          </div>

          {errors.fileReferensi && (
            <small className="mt-1.5 flex items-center gap-1.5 text-xs font-normal text-danger-500">
              <IconAlertCircle size={14} strokeWidth={2} />
              <span>{errors.fileReferensi}</span>
            </small>
          )}
        </div>

        {/* 6. NAMA PEMOHON */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            NAMA PEMOHON{" "}
            <span className="font-normal normal-case text-[#91A4C3] md:hidden">(Auto)</span>
          </label>
          <input
            type="text"
            readOnly
            disabled
            value={namaPemohon}
            className="h-11 w-full cursor-not-allowed rounded-lg border border-primary-100 bg-button px-4 text-sm text-text outline-none dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        {/* 7. UNIT */}
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wider text-text-title uppercase">
            UNIT <span className="font-normal normal-case text-[#91A4C3] md:hidden">(Auto)</span>
          </label>
          <input
            type="text"
            readOnly
            disabled
            value={unitPemohon}
            className="h-11 w-full cursor-not-allowed rounded-lg border border-primary-100 bg-button px-4 text-sm text-text outline-none dark:border-slate-700 dark:bg-slate-800"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            label={isSubmitting ? "Mengirim..." : "Kirim Request"}
            className="w-full"
          />
        </div>
      </form>
    </div>
  );
}
