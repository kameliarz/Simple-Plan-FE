import React, { useState, useEffect } from "react";
import { X, AlertCircle, Eye, EyeOff } from "lucide-react";
import { getUnits, getRoles, createUser, updateUser } from "../services/userApi";
import type { ApiUser, CreateUserPayload } from "../types/user";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: ApiUser; // Jika ada user, berarti mode Edit ("Ubah Data")
}

export default function UserFormModal({ isOpen, onClose, onSuccess, user }: Props) {
  const isEdit = !!user;

  const [formData, setFormData] = useState<Partial<CreateUserPayload>>({
    nama: "",
    nip: "",
    password: "",
    unit_id: 0,
    jabatan: "",
    no_hp: "",
    role: "user",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      getUnits().then(setUnits).catch(console.error);
      getRoles().then(setRoles).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      // Set default unit_id if units are loaded
      const unit = units.find((u) => u.name === user.unit_user);

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        nama: user.nama,
        nip: user.nip,
        unit_id: unit ? unit.id : formData.unit_id || 0, // Use existing unit_id if unit isn't found yet
        jabatan: user.jabatan,
        no_hp: user.no_hp,
        role: user.role as CreateUserPayload["role"],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOpen, units]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nama) newErrors.nama = "Nama lengkap wajib diisi!";
    if (!formData.nip) newErrors.nip = "NIP wajib diisi!";
    if (!isEdit && !formData.password) newErrors.password = "Password wajib diisi!";
    if (!formData.unit_id) newErrors.unit_id = "Unit wajib dipilih!";
    if (!formData.jabatan) newErrors.jabatan = "Jabatan wajib diisi!";
    if (!formData.no_hp) newErrors.no_hp = "Nomor HP wajib diisi!";
    if (!formData.role) newErrors.role = "Role wajib dipilih!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setApiError("Format data tidak sesuai. Silahkan periksa kembali data yang dimasukkan");
      return;
    }
    setApiError(null);
    setIsLoading(true);

    try {
      if (isEdit) {
        // Edit
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // jangan kirim password kalau kosong saat edit

        await updateUser(user.id, payload as import("../types/user").UpdateUserPayload);
      } else {
        // Tambah
        await createUser(formData as CreateUserPayload);
      }
      onSuccess();
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Terjadi kesalahan pada server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-900">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? "Ubah Data" : "Tambah User"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {apiError && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{apiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormInput
              label="Nama"
              placeholder="Contoh: dr. Budi Santoso, Sp.PD"
              value={formData.nama || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              error={errors.nama}
              required
            />

            <FormInput
              label="NIP / Nomor Induk Pegawai"
              placeholder="Contoh: 198504122010121002"
              value={formData.nip || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, nip: e.target.value })
              }
              error={errors.nip}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-800">
                Password {isEdit ? "" : <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isEdit ? "Biarkan kosong jika tidak diubah" : "Masukkan kata sandi baru"
                  }
                  value={formData.password || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-10 ${
                    errors.password ? "border-red-500" : "border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-slate-800">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit_id || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, unit_id: Number(e.target.value) })
                }
                className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
                  errors.unit_id ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="" disabled>
                  Pilih Unit
                </option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              {errors.unit_id && (
                <div className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errors.unit_id}</span>
                </div>
              )}
            </div>

            <FormInput
              label="Jabatan"
              placeholder="Contoh: Dokter Spesialis Penyakit Dalam"
              value={formData.jabatan || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, jabatan: e.target.value })
              }
              error={errors.jabatan}
              required
            />

            <FormInput
              label="Nomor HP"
              placeholder="Contoh: 081234567890"
              value={formData.no_hp || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, no_hp: e.target.value })
              }
              error={errors.no_hp}
              required
            />

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-bold text-slate-800">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, role: e.target.value as CreateUserPayload["role"] })
                }
                className={`w-full md:w-1/2 rounded-xl border px-3.5 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
                  errors.role ? "border-red-500" : "border-slate-300"
                }`}
              >
                <option value="" disabled>
                  Pilih Role
                </option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {errors.role && (
                <div className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errors.role}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full md:w-auto rounded-xl bg-[#002f6c] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#002050] disabled:opacity-70"
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface FormInputProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function FormInput({ label, required, placeholder, value, onChange, error }: FormInputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
          error ? "border-red-500 bg-white" : "border-slate-300"
        }`}
      />
      {error && (
        <div className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
