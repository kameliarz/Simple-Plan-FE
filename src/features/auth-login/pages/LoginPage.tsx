import { useState, type FormEvent } from "react";

import { useNavigate } from "react-router-dom";

import { IconLoader2, IconLock, IconUser } from "@tabler/icons-react";

import PasswordInput from "../components/PasswordInput";
import { login as loginApi } from "../services/authLoginApi";
import { useAuth } from "../context/AuthContext";

import type { LoginFormData, LoginFormErrors } from "../types/auth-login.types";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    nip: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [processing, setProcessing] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.nip.trim()) {
      newErrors.nip = "NIP wajib diisi.";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);
    setErrors({});

    try {
      const result = await loginApi(formData);

      setAuth(result.token, result.user);

      const userRole = result.user.role || "";

      if (userRole === "petugas-sarpras") {
        navigate("/petugas/sarpras/helpdesk", { replace: true });
      } else if (userRole === "petugas-tik") {
        navigate("/petugas/tik/helpdesk", { replace: true });
      } else if (userRole === "koordinator-sarpras") {
        navigate("/helpdesk/sarpras", { replace: true });
      } else {
        navigate("/helpdesk/tik", { replace: true });
      }
    } catch (error: unknown) {
      const loginError = error as {
        status?: number;
        data?: {
          message?: string;
          errors?: {
            nip?: string[];
            password?: string[];
          };
        };
      };

      const responseData = loginError.data;

      if (responseData?.errors) {
        setErrors({
          nip: responseData.errors.nip?.[0],
          password: responseData.errors.password?.[0],
          general:
            !responseData.errors.nip && !responseData.errors.password
              ? responseData.message
              : undefined,
        });
      } else {
        setErrors({
          general: responseData?.message ?? "NIP atau password tidak valid.",
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-2 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
              <IconLock size={24} className="text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">SIMPLE-PLAN</h1>
        </div>

        {/* Login Form */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {errors.general && (
            <div className="mb-5 rounded-md bg-danger-50 px-4 py-3 text-sm text-danger-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NIP */}
            <div>
              <label htmlFor="nip" className="mb-2 block text-sm font-medium text-slate-700">
                NIP
              </label>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <IconUser size={19} />
                </div>

                <input
                  id="nip"
                  name="nip"
                  type="text"
                  value={formData.nip}
                  onChange={(e) => handleChange("nip", e.target.value)}
                  placeholder="Masukkan NIP"
                  autoComplete="username"
                  disabled={processing}
                  className={`h-11 w-full rounded-md border bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 ${
                    errors.nip
                      ? "border-danger-500 focus:border-danger-500"
                      : "border-slate-300 focus:border-primary-500"
                  }`}
                />
              </div>

              {errors.nip && <p className="mt-1.5 text-xs text-danger-500">{errors.nip}</p>}
            </div>

            {/* Password */}
            <PasswordInput
              value={formData.password}
              onChange={(value) => handleChange("password", value)}
              error={errors.password}
              disabled={processing}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={processing}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary-600 text-sm font-medium text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          SIMPLE-PLAN · Sistem Manajemen Rumah Sakit
        </p>
      </div>
    </div>
  );
}
