import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/features/auth-login/pages/LoginPage";
import HelpdeskSAPage from "@/features/helpdesk-super-admin/pages/HelpdeskSAPage";
import HelpdeskDetailPagee from "@/features/helpdesk-super-admin/pages/HelpdeskDetailPagee";
import CreateHelpdeskTicketPage from "@/features/create-helpdesk-ticket-all/pages/CreateHelpdeskTicketPage";
import UserDetailPage from "@/features/master-data/users/pages/UserDetailPage";
import UserListPage from "@/features/master-data/users/pages/UserListPage";

import { useAuth } from "@/features/auth-login/context/AuthContext";

interface RequireAuthProps {
  children: React.ReactNode;
}

function RequireAuth({ children }: RequireAuthProps) {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-6">Memuat sesi...</div>;
  }

  if (!user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function LoginRoute() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-6">Memuat sesi...</div>;
  }

  if (user && token) {
    return <Navigate to="/helpdesk/tik" replace />;
  }

  return <LoginPage />;
}

function App() {
  const location = useLocation();

  // LOGIN TIDAK MEMAKAI MAIN LAYOUT
  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
      </Routes>
    );
  }

  // SEMUA HALAMAN SELAIN LOGIN WAJIB LOGIN
  return (
    <RequireAuth>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/helpdesk/tik" replace />} />

          <Route path="/helpdesk/tik" element={<HelpdeskSAPage />} />

          <Route path="/helpdesk/sarpras" element={<HelpdeskSAPage />} />

          <Route path="/helpdesk/tik/:ticketId" element={<HelpdeskDetailPagee />} />

          <Route path="/helpdesk/sarpras/:ticketId" element={<HelpdeskDetailPagee />} />

          <Route path="/helpdesk/create" element={<CreateHelpdeskTicketPage />} />

          {/* Master Data */}
          <Route path="/master-data" element={<Navigate to="/master-data/users" replace />} />
          <Route path="/master-data/users" element={<UserListPage />} />
          <Route path="/master-data/users/:userId" element={<UserDetailPage />} />

          <Route path="*" element={<Navigate to="/helpdesk/tik" replace />} />
        </Routes>
      </MainLayout>
    </RequireAuth>
  );
}

export default App;
