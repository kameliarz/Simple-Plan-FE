import React from "react";
import { Building2 } from "lucide-react";
import type { ApiUser } from "../types/user";
import { cn } from "../../../../lib/utils";

interface UserCardMobileProps {
  user: ApiUser;
  onClick?: (user: ApiUser) => void;
  className?: string;
}

export const UserCardMobile: React.FC<UserCardMobileProps> = ({ user, onClick, className }) => {
  const initials = user.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isAktif = user.status_user === "Aktif";

  // Simple avatar color assignment based on initial character
  const firstLetter = initials.charAt(0);
  let avatarColorClass = "bg-blue-100 text-blue-900";
  if (["A", "B"].includes(firstLetter)) avatarColorClass = "bg-blue-100 text-blue-900";
  if (["C", "D", "E"].includes(firstLetter)) avatarColorClass = "bg-green-100 text-green-900";
  if (["F", "G", "H", "I"].includes(firstLetter))
    avatarColorClass = "bg-orange-100 text-orange-900";
  if (["J", "K", "L", "M"].includes(firstLetter))
    avatarColorClass = "bg-purple-100 text-purple-900";
  if (["N", "O", "P", "Q", "R"].includes(firstLetter))
    avatarColorClass = "bg-rose-100 text-rose-900";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(user)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(user);
      }}
      className={cn(
        "w-full text-left bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 space-y-3 transition-all hover:shadow-md active:scale-[0.99]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            avatarColorClass,
          )}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 truncate">
            {user.nama}
          </h3>
          <p className="text-xs text-blue-900 dark:text-blue-400 font-medium truncate mt-0.5">
            {user.jabatan}
          </p>
        </div>

        {/* Status */}
        <div
          className={cn(
            "shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
            isAktif
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-rose-200 bg-rose-50 text-rose-600",
          )}
        >
          {user.status_user}
        </div>
      </div>

      {/* Unit */}
      <div className="flex items-center gap-2 pt-3 mt-1 border-t border-slate-50 dark:border-slate-800/80">
        <Building2 className="h-4 w-4 text-slate-400" />
        <p className="text-[13px] text-slate-600 dark:text-slate-300">
          <span className="text-slate-400">Unit:</span> {user.unit_user}
        </p>
      </div>
    </div>
  );
};

export default UserCardMobile;
