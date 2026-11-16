import { useNavigate } from "react-router-dom";

import BarcodeScanner from "../components/BarcodeScanner";

export default function ScanBarcodePage() {
  const navigate = useNavigate();

  const handleScanSuccess = (uid: string) => {
    const scannedUid = uid.trim();

    if (!scannedUid) return;

    navigate(`/helpdesk/inventory-detail?uid=${encodeURIComponent(scannedUid)}`, { replace: true });
  };

  return <BarcodeScanner onBack={() => navigate(-1)} onScanSuccess={handleScanSuccess} />;
}
