import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import LoginPage from "@/features/auth-login/pages/LoginPage";
import HelpdeskSAPage from "@/features/helpdesk-super-admin/pages/HelpdeskSAPage";
import HelpdeskDetailPage from "@/features/helpdesk-super-admin/pages/HelpdeskDetailPage";
import CreateHelpdeskTicketPage from "@/features/create-helpdesk-ticket-all/pages/CreateHelpdeskTicketPage";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/helpdesk/tik" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/helpdesk/tik" element={<HelpdeskSAPage />} />

        <Route path="/helpdesk/tik/:ticketId" element={<HelpdeskDetailPage />} />

        <Route path="/helpdesk/create" element={<CreateHelpdeskTicketPage />} />

        <Route path="*" element={<Navigate to="/helpdesk/tik" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
