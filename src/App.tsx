import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";

import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/features/auth-login/pages/LoginPage";
import { getUser } from "@/features/auth-login/services/authStorage";

import HelpdeskListPage from "@/features/helpdesk-list-detail/pages/HelpdeskListPage";
import HelpdeskDetailPage from "@/features/helpdesk-list-detail/pages/HelpdeskDetailPage";
import HelpdeskCreateTicketPage from "@/features/helpdesk-create/pages/HelpdeskCreateTicketPage";

import UserDetailPage from "@/features/master-data/users/pages/UserDetailPage";
import UserListPage from "@/features/master-data/users/pages/UserListPage";

import CreateInventoryPage from "@/features/inventory-create/pages/CreateInventoryPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/helpdesk/tik" replace />} />

          {/* Helpdesk */}
          <Route path="/helpdesk/tik" element={<HelpdeskListPage />} />
          <Route path="/helpdesk/sarpras" element={<HelpdeskListPage />} />
          <Route path="/helpdesk/tik/:ticketId" element={<HelpdeskDetailPage />} />
          <Route path="/helpdesk/sarpras/:ticketId" element={<HelpdeskDetailPage />} />
          <Route path="/helpdesk/create" element={<HelpdeskCreateTicketPage />} />

          {/* Master Data */}
          <Route path="/master-data" element={<Navigate to="/master-data/users" replace />} />
          <Route path="/master-data/users" element={<UserListPage />} />
          <Route path="/master-data/users/:userId" element={<UserDetailPage />} />

          {/* Inventory */}
          <Route path="/inventory/create" element={<CreateInventoryPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/helpdesk/tik" replace />} />
        </Routes>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default App;
