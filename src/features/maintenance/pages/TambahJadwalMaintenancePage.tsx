import { IconArrowLeft } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import TambahJadwalForm from "../components/TambahJadwalForm";

export default function TambahJadwalMaintenancePage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8">
      {/* Header with back navigation */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Kembali"
        >
          <IconArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">Tambah Jadwal</h1>
      </div>

      {/* Form Container */}
      <TambahJadwalForm />
    </div>
  );
}
