import React, { useState, useEffect } from "react";
import { X, AlertCircle, Eye, EyeOff, ChevronDown } from "lucide-react";
import {
  getUnits,
  getRoles,
  createUser,
  updateUser,
  ApiValidationError,
} from "../services/userApi";
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors({});
      setApiError(null);
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

    // 1. Nama
    if (!formData.nama || !formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi!";
    } else if (formData.nama.trim().length < 3) {
      newErrors.nama = "Nama lengkap minimal 3 karakter!";
    }

    // 2. NIP
    const rawNip = (formData.nip || "").trim();
    if (!rawNip) {
      newErrors.nip = "NIP wajib diisi!";
    } else if (!/^\d+$/.test(rawNip)) {
      newErrors.nip = "NIP harus berupa angka (tidak boleh mengandung huruf atau simbol)!";
    } else if (rawNip.length < 8 || rawNip.length > 18) {
      newErrors.nip = "NIP harus berjumlah antara 8 hingga 18 digit angka!";
    }

    // 3. Password
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = "Password wajib diisi!";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password minimal 6 karakter!";
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password baru minimal 6 karakter!";
    }

    // 4. Unit
    if (!formData.unit_id) {
      newErrors.unit_id = "Unit wajib dipilih!";
    }

    // 5. Jabatan
    if (!formData.jabatan || !formData.jabatan.trim()) {
      newErrors.jabatan = "Jabatan wajib diisi!";
    }

    // 6. Nomor HP (Validasi format nomor HP Indonesia)
    const rawPhone = (formData.no_hp || "").trim();
    const phoneRegex = /^08[0-9]{8,11}$/;
    if (!rawPhone) {
      newErrors.no_hp = "Nomor HP wajib dipilih!";
    } else if (!phoneRegex.test(rawPhone)) {
      newErrors.no_hp =
        "Format nomor HP tidak valid (harus diawali '08' dengan total 10-13 digit angka, contoh: 081234567890)!";
    }

    // 7. Role
    if (!formData.role) {
      newErrors.role = "Role wajib dipilih!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setApiError("Format data tidak sesuai. Silahkan periksa field yang ditandai merah");
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
      if (err instanceof ApiValidationError) {
        setErrors(err.errors);
        setApiError(
          err.message || "Format data tidak sesuai. Silahkan periksa kembali data yang dimasukkan",
        );
      } else {
        setApiError(err instanceof Error ? err.message : "Terjadi kesalahan pada server");
      }
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
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
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? "Ubah Data" : "Tambah User"}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {apiError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-3 text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span className="text-[13px] font-normal leading-tight">{apiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormInput
              label="Nama"
              placeholder="Contoh: dr. Budi Santoso, Sp.PD"
              value={formData.nama || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, nama: e.target.value });
                if (errors.nama) setErrors((prev) => ({ ...prev, nama: "" }));
              }}
              error={errors.nama}
              required
            />

            <FormInput
              label="NIP / Nomor Induk Pegawai"
              placeholder="Contoh: 198804122019031002"
              value={formData.nip || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value.replace(/\D/g, "");
                {
                  setFormData({ ...formData, nip: val });
                  if (errors.nip) setErrors((prev) => ({ ...prev, nip: "" }));
                  if (errors.nip) setErrors((prev) => ({ ...prev, nip: "" }));
                }
              }}
              error={errors.nip}
              required
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isEdit ? "Biarkan kosong jika tidak diubah" : "Masukkan kata sandi akun"
                  }
                  value={formData.password || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-10 ${
                    errors.password ? "border-red-500 bg-white" : "border-slate-300 bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Unit <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.unit_id || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFormData({ ...formData, unit_id: Number(e.target.value) });
                    if (errors.unit_id) setErrors((prev) => ({ ...prev, unit_id: "" }));
                  }}
                  className={`w-full appearance-none rounded-xl border px-3.5 py-3 pr-10 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
                    errors.unit_id ? "border-red-500 bg-white" : "border-slate-300 bg-white"
                  }`}
                >
                  <option value="" disabled>
                    Pilih unit
                  </option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {errors.unit_id && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{errors.unit_id}</span>
                </div>
              )}
            </div>

            <FormInput
              label="Jabatan"
              placeholder="Contoh: Dokter Spesialis Penyakit Dalam"
              value={formData.jabatan || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFormData({ ...formData, jabatan: e.target.value });
                if (errors.jabatan) setErrors((prev) => ({ ...prev, jabatan: "" }));
              }}
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
              <label className="mb-1.5 block text-sm font-semibold text-slate-800">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.role || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setFormData({ ...formData, role: e.target.value as CreateUserPayload["role"] });
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                  className={`w-full appearance-none rounded-xl border px-3.5 py-3 pr-10 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
                    errors.role ? "border-red-500 bg-white" : "border-slate-300 bg-white"
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
                <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
              </div>
              {errors.role && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
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
            className="w-full md:w-auto rounded-xl bg-[#003178] px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-[#00255c] disabled:opacity-70 cursor-pointer"
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
      <label className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${
          error ? "border-red-500 bg-white" : "border-slate-300 bg-white"
        }`}
      />
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
