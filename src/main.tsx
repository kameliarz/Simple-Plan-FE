import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

import { AuthProvider } from "./features/auth-login/context/AuthContext";
import { ToastProvider } from "./components/ui/ui-template/Toast.tsx";
import NavigationToast from "./components/ui/ui-template/NavigationToast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NavigationToast />
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
