import { useState } from "react";
import { Bell } from "lucide-react";

import BaseTab from "./BaseTab";

import NotificationDrawer from "@/features/notification/components/NotificationDrawer";

export default function NotifikasiTab() {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <>
      <BaseTab
        icon={Bell}
        label="Notifikasi"
        badge={3}
        active={showNotification}
        onClick={() => setShowNotification(true)}
      />

      <NotificationDrawer show={showNotification} onClose={() => setShowNotification(false)} />
    </>
  );
}
