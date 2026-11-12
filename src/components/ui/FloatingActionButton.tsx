import React from "react";
import { Plus } from "lucide-react";
import { cn } from "../../lib/utils";

export interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = <Plus className="w-6 h-6" />,
  onClick,
  title = "Tambah",
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 z-30 w-13 h-13 rounded-2xl bg-[#003178] hover:bg-[#00255a] active:scale-95 text-white shadow-xl flex items-center justify-center transition cursor-pointer",
        className,
      )}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
