import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  CreditCard,
  Building2,
  Briefcase,
  Phone,
  ClipboardList,
  RefreshCcw,
  Check,
} from "lucide-react";
import { getUserDetail } from "../services/userApi";
import type { ApiUser } from "../types/user";
import UserStatusModal from "../components/UserStatusModal";
import UserDeactivateModal from "../components/UserDeactivateModal";
import UserFormModal from "../components/UserFormModal";
import UserSuccessModal from "../components/UserSuccessModal";

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Success modal state for edit
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Banner message state for status changes
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserDetail(userId);
      setUser(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengambil detail user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleStatusChanged = (status: "Aktif" | "Nonaktif") => {
    setSuccessMessage(
      status === "Aktif" ? "User berhasil diaktifkan kembali!" : "User berhasil dinonaktifkan!",
    );
    fetchUser();
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-slate-500">Memuat data user...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/master-data/users")}
            className="rounded-full p-2 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Detail Pengguna</h1>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error || "User tidak ditemukan"}
        </div>
      </div>
    );
  }

  const initials = user.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isAktif = user.status_user === "Aktif";

  return (
    <div className="flex h-full flex-col bg-slate-50 relative pb-28 md:pb-6 overflow-y-auto">
      {/* Header Info */}
      <div className="px-4 py-4 md:px-8 md:py-6 flex items-center gap-3">
        <button
          onClick={() => navigate("/master-data/users")}
          className="p-1 -ml-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <h1 className="text-lg font-semibold text-slate-700">Detail Pengguna</h1>
      </div>

      {/* Absolute Success Banner aligned below the header center */}
      {successMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-5 py-2.5 text-[13.5px] font-medium text-emerald-600 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200/50 text-emerald-600">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </div>
          {successMessage}
        </div>
      )}

      <div className="px-4 md:px-8 max-w-3xl mx-auto w-full">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center mt-2 mb-8">
          <div className="h-[90px] w-[90px] rounded-full bg-[#0047b3] flex items-center justify-center text-[32px] font-semibold text-white mb-4 shadow-sm">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-slate-800">{user.nama}</h2>
          <p className="text-[15px] text-slate-500 mt-0.5 font-medium">{user.jabatan}</p>
        </div>

        {/* Section Title & Badge */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-bold text-slate-600 uppercase tracking-wide">
            INFORMASI PEGAWAI
          </h3>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
              isAktif
                ? "border-emerald-200 bg-emerald-50/80 text-emerald-600"
                : "border-rose-200 bg-rose-50/80 text-rose-600"
            }`}
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${isAktif ? "bg-emerald-500" : "bg-rose-500"}`}
            />
            {user.status_user}
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          <DetailRow icon={<User />} label="Nama" value={user.nama} />
          <DetailRow icon={<CreditCard />} label="NIP (Nomor Induk Pegawai)" value={user.nip} />
          <DetailRow icon={<Building2 />} label="Unit" value={user.unit_user} />
          <DetailRow icon={<Briefcase />} label="Jabatan" value={user.jabatan} />
          <DetailRow icon={<Phone />} label="Nomor HP" value={user.no_hp} />
          <DetailRow icon={<ClipboardList />} label="Role" value={user.role} />
          {!isAktif && user.alasan_nonaktif && (
            <DetailRow icon={<RefreshCcw />} label="Alasan Nonaktif" value={user.alasan_nonaktif} />
          )}
        </div>
      </div>

      {/* Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 p-4 flex gap-3 md:absolute md:border-none md:bg-transparent md:justify-end md:px-8 z-10">
        <button
          onClick={() => (isAktif ? setShowDeactivateModal(true) : setShowActivateModal(true))}
          className="flex-1 md:flex-none border border-slate-300 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          {isAktif ? "Nonaktifkan User" : "Aktifkan User"}
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex-1 md:flex-none bg-[#113a77] rounded-xl px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#0b2957] transition"
        >
          Edit
        </button>
      </div>

      {showActivateModal && (
        <UserStatusModal
          isOpen={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          userId={user.id}
          onSuccess={() => {
            setShowActivateModal(false);
            handleStatusChanged("Aktif");
          }}
        />
      )}

      {showDeactivateModal && (
        <UserDeactivateModal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          userId={user.id}
          onSuccess={() => {
            setShowDeactivateModal(false);
            handleStatusChanged("Nonaktif");
          }}
        />
      )}

      {showEditModal && (
        <UserFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onSuccess={() => {
            setShowEditModal(false);
            setShowSuccessModal(true);
            fetchUser();
          }}
        />
      )}

      {showSuccessModal && (
        <UserSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Berhasil Diperbarui!"
          message="Data user berhasil diperbarui"
        />
      )}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 p-4 items-start">
      <div className="text-slate-600 mt-1">
        {/* @ts-expect-error React.cloneElement typings issue */}
        {React.cloneElement(icon, { className: "w-5 h-5 stroke-[1.5]" })}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-0.5">{label}</p>
        <p className="text-[15px] font-semibold text-slate-800 leading-tight">{value}</p>
      </div>
    </div>
  );
}
