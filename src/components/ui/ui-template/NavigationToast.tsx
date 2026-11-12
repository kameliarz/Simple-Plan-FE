import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useToast } from "./UseToast";

type ToastType = "success" | "error" | "warning" | "info";

interface NavigationToastState {
  toast?: {
    message: string;
    type: ToastType;
  };
}

export default function NavigationToast() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const state = location.state as NavigationToastState | null;

    if (!state?.toast) return;

    const { message, type } = state.toast;

    showToast(message, type);

    // Bersihkan toast dari navigation state agar
    // tidak muncul lagi ketika halaman di-refresh.
    const { toast: _toast, ...remainingState } = state;
    void _toast;

    navigate(`${location.pathname}${location.search}${location.hash}`, {
      replace: true,
      state: remainingState,
    });
  }, [location.pathname, location.search, location.hash, location.state, navigate, showToast]);

  return null;
}
