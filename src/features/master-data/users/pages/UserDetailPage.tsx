import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Pencil } from "lucide-react";
import { getUserDetail } from "../services/userApi";
import type { ApiUser } from "../types/user";
import UserStatusModal from "../components/UserStatusModal";
import UserDeactivateModal from "../components/UserDeactivateModal";
import UserFormModal from "../components/UserFormModal";
import UserSuccessModal from "../components/UserSuccessModal";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/ui-template/Button";

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
            className="rounded-full p-2 hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Detail User</h1>
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
    <div className="flex h-full flex-col bg-slate-50 relative pb-28 md:pb-8 overflow-y-auto">
      {/* Absolute Success Banner aligned below the header center */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-5 py-2.5 text-[13.5px] font-medium text-emerald-600 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200/50 text-emerald-600">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </div>
          {successMessage}
        </div>
      )}

      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        {/* Page Header: Back Button + Title */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/master-data/users")}
            className="p-1 -ml-1 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Kembali ke daftar user"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Detail User</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
          {/* Header Profile Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-[#003178] text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">{user.nama}</h2>
                  <Badge variant={isAktif ? "success" : "danger"} dot>
                    {user.status_user}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 font-normal mt-0.5">{user.jabatan}</p>
              </div>
            </div>

            {/* Desktop Actions (di samping kanan atas profil sesuai referensi desain) */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="primary"
                onClick={() =>
                  isAktif ? setShowDeactivateModal(true) : setShowActivateModal(true)
                }
                label={isAktif ? "Nonaktifkan User" : "Aktifkan User"}
                className="bg-[#003178] hover:bg-[#00255c] text-white text-sm font-medium px-5 py-2.5 rounded-xl border-none shadow-xs"
              />
              <Button
                variant="primary"
                onClick={() => setShowEditModal(true)}
                icon={<Pencil className="h-4 w-4" />}
                label="Edit"
                className="bg-[#003178] hover:bg-[#00255c] text-white text-sm font-medium px-6 py-2.5 rounded-xl border-none shadow-xs"
              />
            </div>
          </div>

          {/* Details Grid (6 Cards, 2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <span className="block text-xs font-medium text-slate-500">Nama</span>
              <span className="block text-sm font-bold text-slate-900 mt-1">{user.nama}</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <span className="block text-xs font-medium text-slate-500">
                NIP (Nomor Induk Pegawai)
              </span>
              <span className="block text-sm font-bold text-slate-900 mt-1">{user.nip}</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <span className="block text-xs font-medium text-slate-500">Unit</span>
              <span className="block text-sm font-bold text-slate-900 mt-1">{user.unit_user}</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <span className="block text-xs font-medium text-slate-500">Jabatan</span>
              <span className="block text-sm font-bold text-slate-900 mt-1">{user.jabatan}</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <span className="block text-xs font-medium text-slate-500">Nomor HP</span>
              <span className="block text-sm font-bold text-slate-900 mt-1">{user.no_hp}</span>
            </div>
            <div className="rounded-xl border border-slate-200/80 p-4 bg-white">
              <span className="block text-xs font-medium text-slate-500">Role</span>
              <span className="block text-sm font-bold text-slate-900 mt-1">{user.role}</span>
            </div>

            {!isAktif && user.alasan_nonaktif && (
              <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <span className="block text-xs font-medium text-rose-600">Alasan Nonaktif</span>
                <span className="block text-sm font-semibold text-rose-900 mt-1">
                  {user.alasan_nonaktif}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar (di bawah pada layar mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex gap-3 md:hidden z-20 shadow-lg">
        <button
          onClick={() => (isAktif ? setShowDeactivateModal(true) : setShowActivateModal(true))}
          className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
        >
          {isAktif ? "Nonaktifkan User" : "Aktifkan User"}
        </button>
        <button
          onClick={() => setShowEditModal(true)}
          className="flex-1 bg-[#003178] rounded-xl px-4 py-3 text-sm font-semibold text-white hover:bg-[#00255c] transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
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
