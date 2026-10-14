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

import InventarisTikListPage from "@/features/inventaris/pages/InventarisTikListPage";
import InventarisTikDetailPage from "@/features/inventaris/pages/InventarisTikDetailPage";
import InventarisSarprasListPage from "@/features/inventaris/pages/InventarisSarprasListPage";
import InventarisSarprasDetailPage from "@/features/inventaris/pages/InventarisSarprasDetailPage";

import CreateInventoryPage from "@/features/inventory-create-change/pages/CreateInventoryPage";
import EditInventoryPage from "@/features/inventory-create-change/pages/EditInventoryPage";

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
          <Route path="/helpdesk" element={<HelpdeskListPage />} />
          <Route path="/helpdesk/tik" element={<HelpdeskListPage />} />
          <Route path="/helpdesk/sarpras" element={<HelpdeskListPage />} />
          <Route path="/helpdesk/tik/:ticketId" element={<HelpdeskDetailPage />} />
          <Route path="/helpdesk/sarpras/:ticketId" element={<HelpdeskDetailPage />} />
          <Route path="/helpdesk/create" element={<HelpdeskCreateTicketPage />} />

          {/* Master Data */}
          <Route path="/master-data" element={<Navigate to="/master-data/users" replace />} />
          <Route path="/master-data/users" element={<UserListPage />} />
          <Route path="/master-data/users/:userId" element={<UserDetailPage />} />

          {/* Inventaris Aset */}
          <Route path="/inventaris/tik" element={<InventarisTikListPage />} />
          <Route path="/inventaris/tik/:id" element={<InventarisTikDetailPage />} />
          <Route path="/inventaris/sarpras" element={<InventarisSarprasListPage />} />
          <Route path="/inventaris/sarpras/:id" element={<InventarisSarprasDetailPage />} />

          {/* Inventory */}
          <Route
            path="/inventory/tik/create"
            element={<CreateInventoryPage inventoryType="tik" />}
          />
          <Route
            path="/inventory/sarpras/create"
            element={<CreateInventoryPage inventoryType="sarpras" />}
          />
          <Route
            path="/inventory/tik/:id/edit"
            element={<EditInventoryPage inventoryType="tik" />}
          />
          <Route
            path="/inventory/sarpras/:id/edit"
            element={<EditInventoryPage inventoryType="sarpras" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/helpdesk/tik" replace />} />
        </Routes>
      </MainLayout>
    </ProtectedRoute>
  );
}

export default App;
