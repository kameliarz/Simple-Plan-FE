import { Loader2 } from "lucide-react";

export interface LoadingStateOverlayProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingStateOverlay({
  fullScreen = false,
  message = "Memuat data...",
}: LoadingStateOverlayProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
    : "absolute inset-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px]";

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses}`}>
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      {message && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
      )}
    </div>
  );
}

export default LoadingStateOverlay;
