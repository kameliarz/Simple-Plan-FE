import React, { useState } from "react";
import { ArrowLeft, Flashlight, Image as ImageIcon, X } from "lucide-react";
import Button from "../../../components/ui/Button";

interface HelpdeskScanBarcodePageProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const HelpdeskScanBarcodePage: React.FC<HelpdeskScanBarcodePageProps> = ({
  onBack,
  onSuccess,
}) => {
  const [isScanned, setIsScanned] = useState(false);

  // Simulate scanning when clicking on the scanner area
  const handleSimulateScan = () => {
    setIsScanned(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 absolute inset-0 z-50">
      {/* Header */}
      <header className="h-[60px] px-4 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">Pindai Barcode</h1>
        <div className="w-9" /> {/* Placeholder for center alignment */}
      </header>

      {/* Scanner Viewport Simulation */}
      <main className="flex-1 relative flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <div 
          className="relative w-64 h-64 border-2 border-transparent cursor-pointer"
          onClick={handleSimulateScan}
        >
          {/* Brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-800 dark:border-blue-500 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-800 dark:border-blue-500 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-800 dark:border-blue-500 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-800 dark:border-blue-500 rounded-br-xl" />

          {/* Barcode/QR Mock Content */}
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 relative overflow-hidden rounded">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.5)] animate-pulse" />
              {/* Fake QR pattern */}
              <div className="grid grid-cols-5 grid-rows-5 gap-1 p-2 w-full h-full opacity-50">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className={`bg-slate-800 dark:bg-slate-200 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} />
                ))}
              </div>
            </div>
            <div className="mt-4 px-4 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 font-mono text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800">
              INV-TIK-2023-089
            </div>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Arahkan ke barcode atau QR Code inventaris
        </p>
      </main>

      {/* Footer Controls */}
      <footer className="h-24 flex items-center justify-center gap-10 pb-4 bg-white dark:bg-slate-900 shrink-0">
        <button className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-yellow-500">
          <Flashlight className="w-5 h-5" />
        </button>
        <button className="p-1 rounded-full border-4 border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-800 shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#0a2360] dark:bg-blue-600" />
        </button>
        <button className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400">
          <ImageIcon className="w-5 h-5" />
        </button>
      </footer>

      {/* Scan Result Overlay / Bottom Sheet */}
      {isScanned && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/50 z-[60] transition-opacity"
            onClick={() => setIsScanned(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[70] bg-white dark:bg-slate-900 rounded-t-3xl p-6 transform transition-transform duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">DETAIL INVENTARIS</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Aktif
                </span>
              </div>
              <button 
                onClick={() => setIsScanned(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1">NOMOR INVENTARIS</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">TIK-2023-089</p>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              
              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1">NAMA INVENTARIS</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">PC All-in-One Core i5 Poli Dalam</p>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              
              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1">MERK INVENTARIS</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Lenovo ThinkCentre M70a / RAM 16GB</p>
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              
              <div>
                <p className="text-[10px] text-slate-400 font-bold mb-1">UNIT INVENTARIS</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Meja Dokter Konsul 1 Lantai 2 (Poli Rawat Jalan)</p>
              </div>
            </div>

            <Button 
              onClick={onSuccess} 
              className="w-full py-3.5 bg-[#0a2360] hover:bg-blue-900 text-white rounded-xl text-sm"
            >
              Buat Tiket
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
