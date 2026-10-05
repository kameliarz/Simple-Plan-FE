import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import LoginPage from "@/features/auth-login/pages/LoginPage";
import HelpdeskSAPage from "@/features/helpdesk-super-admin/pages/HelpdeskSAPage";
import HelpdeskDetailPage from "@/features/helpdesk-super-admin/pages/HelpdeskDetailPage";
import HelpdeskKoorPage from "@/features/helpdesk-koor/pages/HelpdeskKoorPage";
import HelpdeskKoorDetailPage from "@/features/helpdesk-koor/pages/HelpdeskKoorDetailPage";
import HelpdeskPetugasPage from "@/features/helpdesk-petugas/pages/HelpdeskListPage";
import HelpdeskPetugasDetailPage from "@/features/helpdesk-petugas/pages/HelpdeskPetugasDetailPage";
import CreateHelpdeskTicketPage from "@/features/create-helpdesk-ticket-all/pages/CreateHelpdeskTicketPage";
import UserDetailPage from "@/features/master-data/users/pages/UserDetailPage";
import UserListPage from "@/features/master-data/users/pages/UserListPage";
import { getUser } from "@/features/auth-login/services/authStorage";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/helpdesk/tik" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/helpdesk/tik" element={<HelpdeskSAPage />} />
        <Route path="/helpdesk/sarpras" element={<HelpdeskKoorPage />} />

        <Route path="/helpdesk/tik/:ticketId" element={<HelpdeskDetailPage />} />
        <Route path="/helpdesk/sarpras/:ticketId" element={<HelpdeskKoorDetailPage />} />

        <Route path="/petugas/sarpras/helpdesk" element={<HelpdeskPetugasPage />} />
        <Route path="/petugas/sarpras/helpdesk/:ticketId" element={<HelpdeskPetugasDetailPage />} />

        <Route path="/petugas/tik/helpdesk" element={<HelpdeskPetugasPage />} />
        <Route path="/petugas/tik/helpdesk/:ticketId" element={<HelpdeskPetugasDetailPage />} />

        <Route path="/helpdesk/create" element={<CreateHelpdeskTicketPage />} />

        {/* Master Data */}
        <Route path="/master-data" element={<Navigate to="/master-data/users" replace />} />
        <Route path="/master-data/users" element={<UserListPage />} />
        <Route path="/master-data/users/:userId" element={<UserDetailPage />} />

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </MainLayout>
  );
}

function HomeRedirect() {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role;
  if (userRole === "user") return <Navigate to="/helpdesk/create" replace />;
  if (userRole === "petugas-sarpras") return <Navigate to="/petugas/sarpras/helpdesk" replace />;
  if (userRole === "petugas-tik") return <Navigate to="/petugas/tik/helpdesk" replace />;
  if (userRole === "koordinator-sarpras") return <Navigate to="/helpdesk/sarpras" replace />;

  return <Navigate to="/helpdesk/tik" replace />;
}

export default App;
