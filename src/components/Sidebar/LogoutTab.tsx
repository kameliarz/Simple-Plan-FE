import { LogOut } from "lucide-react";

interface LogoutTabProps {
  onLogout?: () => void;
}

export default function LogoutTab({ onLogout }: LogoutTabProps) {
  return (
    <button
      onClick={onLogout}
      className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors border-l-2 border-transparent text-gray-600 hover:bg-gray-100"
    >
      <div className="flex items-center gap-3">
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </div>
    </button>
  );
}