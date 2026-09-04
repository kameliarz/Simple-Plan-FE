import React from "react";
import { cn } from "../../lib/utils";

interface AvatarProps {
  initials?: string;
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorVariants: Record<string, string> = {
  AS: "bg-blue-800 text-white",
  DW: "bg-amber-800 text-white",
  CD: "bg-amber-700 text-white",
  NR: "bg-rose-900 text-white",
  DEFAULT: "bg-slate-700 text-white",
};

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  src,
  alt = "Avatar",
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-xs font-semibold",
    lg: "w-11 h-11 text-sm font-semibold",
  };

  const bgClass = initials
    ? colorVariants[initials] || colorVariants.DEFAULT
    : colorVariants.DEFAULT;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 select-none",
        sizeClasses[size],
        bgClass,
        className,
      )}
    >
      {initials || "U"}
    </div>
  );
};

export default Avatar;
