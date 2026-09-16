import { Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import HelpdeskSAPage from "@/features/helpdesk-super-admin/pages/HelpdeskSAPage";
import HelpdeskDetailPage from "./features/helpdesk-super-admin/pages/HelpdeskDetailPage";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/helpdesk/tik" replace />} />

        <Route path="/helpdesk/tik" element={<HelpdeskSAPage />} />

        <Route path="/helpdesk/tik/:ticketId" element={<HelpdeskDetailPage />} />

        <Route path="*" element={<Navigate to="/helpdesk/tik" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
