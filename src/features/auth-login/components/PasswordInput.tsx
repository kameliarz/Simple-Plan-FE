import { useState } from "react";
import { IconEye, IconEyeOff, IconLock } from "@tabler/icons-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  error,
  placeholder = "Masukkan password Anda",
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
        Password
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <IconLock size={20} />
        </div>

        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="current-password"
          disabled={disabled}
          className={`h-12 w-full rounded-xl border-2 bg-white pl-12 pr-12 text-slate-900 placeholder-slate-400 transition-all focus:ring-4 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 ${
            error
              ? "border-danger-500 focus:border-danger-500"
              : "border-slate-200 focus:border-primary-500"
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={disabled}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        >
          {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
        </button>
      </div>

      {error && <p className="mt-1.5 text-sm text-danger-500">{error}</p>}
    </div>
  );
}
