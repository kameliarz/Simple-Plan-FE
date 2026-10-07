import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import LoginPage from "@/features/auth-login/pages/LoginPage";
import HelpdeskSAPage from "@/features/helpdesk-super-admin/pages/HelpdeskSAPage";
import HelpdeskDetailPagee from "@/features/helpdesk-super-admin/pages/HelpdeskDetailPagee";
import HelpdeskKoorPage from "@/features/helpdesk-koor/pages/HelpdeskKoorPage";
import HelpdeskPetugasPage from "@/features/helpdesk-petugas/pages/HelpdeskListPage";
import HelpdeskManajemenPage from "@/features/helpdesk-manajemen/pages/HelpdeskManajemenPage";
import HelpdeskManajemenDetailPage from "@/features/helpdesk-manajemen/pages/HelpdeskManajemenDetailPage";
import CreateHelpdeskTicketPage from "@/features/create-helpdesk-ticket-all/pages/CreateHelpdeskTicketPage";
import UserDetailPage from "@/features/master-data/users/pages/UserDetailPage";
import UserListPage from "@/features/master-data/users/pages/UserListPage";
import { getUser } from "@/features/auth-login/services/authStorage";

const TikHelpdeskRouter = () => {
  const user = getUser();
  const role = user?.role;
  if (role === "super-admin") return <HelpdeskSAPage />;
  return <HelpdeskPetugasPage />;
};

const TikHelpdeskDetailRouter = () => {
  return <HelpdeskDetailPagee />;
};

const SarprasHelpdeskRouter = () => {
  const user = getUser();
  const role = user?.role;
  if (role === "koordinator-sarpras" || role === "super-admin") return <HelpdeskKoorPage />;
  return <HelpdeskPetugasPage />;
};

const SarprasHelpdeskDetailRouter = () => {
  return <HelpdeskDetailPagee />;
};

function App() {
  const location = useLocation();

  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  // SEMUA HALAMAN SELAIN LOGIN WAJIB LOGIN
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/helpdesk/tik" element={<TikHelpdeskRouter />} />
        <Route path="/helpdesk/sarpras" element={<SarprasHelpdeskRouter />} />

        <Route path="/helpdesk/tik/:ticketId" element={<TikHelpdeskDetailRouter />} />
        <Route path="/helpdesk/sarpras/:ticketId" element={<SarprasHelpdeskDetailRouter />} />

        {/* Manajemen */}
        <Route path="/manajemen/helpdesk/tik" element={<HelpdeskManajemenPage />} />
        <Route path="/manajemen/helpdesk/sarpras" element={<HelpdeskManajemenPage />} />
        <Route path="/manajemen/helpdesk/tik/:ticketId" element={<HelpdeskManajemenDetailPage />} />
        <Route
          path="/manajemen/helpdesk/sarpras/:ticketId"
          element={<HelpdeskManajemenDetailPage />}
        />

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
  if (userRole === "petugas-sarpras") return <Navigate to="/helpdesk/sarpras" replace />;
  if (userRole === "petugas-tik") return <Navigate to="/helpdesk/tik" replace />;
  if (userRole === "koordinator-sarpras") return <Navigate to="/helpdesk/sarpras" replace />;

  return <Navigate to="/helpdesk/tik" replace />;
}

export default App;
