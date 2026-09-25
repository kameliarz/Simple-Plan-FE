import React, { useState } from "react";
import { ArrowLeft, Check, Image as ImageIcon, ScanLine, X } from "lucide-react";
import Button from "../../../components/ui/Button";
import { BottomSheetSelector } from "../../../components/ui/BottomSheetSelector";

interface MobileCreateTicketPageProps {
  onBack?: () => void;
  onScan?: () => void;
  onSubmitSuccess?: (ticketId: string) => void;
}

export const MobileCreateTicketPage: React.FC<MobileCreateTicketPageProps> = ({
  onBack,
  onScan,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    reporterName: "",
    reporterUnit: "",
    serviceType: "", // 'TIK' or 'Sarpras'
    inventoryNumber: "",
    inventoryName: "",
    inventoryBrand: "",
    inventoryUnit: "",
    inventoryLocation: "",
    problemDescription: "",
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Bottom sheet states
  const [isReporterUnitOpen, setIsReporterUnitOpen] = useState(false);
  const [isInventoryUnitOpen, setIsInventoryUnitOpen] = useState(false);

  const unitOptions = [
    { label: "Poli Rawat Jalan / Poli Dalam", value: "Poli Rawat Jalan / Poli Dalam" },
    { label: "Unit Gawat darurat (UGD)", value: "Unit Gawat darurat (UGD)" },
    { label: "Ruang Inap Tulip 3", value: "Ruang Inap Tulip 3" },
    { label: "Ruang Radiologi", value: "Ruang Radiologi" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, boolean> = {};
    if (!formData.reporterName.trim()) newErrors.reporterName = true;
    if (!formData.reporterUnit.trim()) newErrors.reporterUnit = true;
    if (!formData.serviceType) newErrors.serviceType = true;
    
    if (!formData.inventoryNumber.trim()) newErrors.inventoryNumber = true;
    if (!formData.inventoryName.trim()) newErrors.inventoryName = true;
    if (!formData.inventoryUnit.trim()) newErrors.inventoryUnit = true;
    
    if (!formData.problemDescription.trim()) newErrors.problemDescription = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      onSubmitSuccess?.("TIK-2023-090");
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative">
      {/* Header */}
      <header className="h-[60px] px-4 border-b border-slate-100 dark:border-slate-800 flex items-center shrink-0 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 mr-2 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-slate-800 dark:text-slate-100 text-[15px]">Buat Tiket</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informasi Pelapor & Layanan */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Informasi Pelapor & Layanan</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                NAMA PELAPOR <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Contoh: dr. Budi Santoso, Sp.PD"
                value={formData.reporterName}
                onChange={(e) => handleInputChange("reporterName", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 ${
                  errors.reporterName 
                    ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {errors.reporterName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Nama pelapor wajib diisi!
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                UNIT PELAPOR <span className="text-rose-500">*</span>
              </label>
              <div 
                className={`w-full px-4 py-3 rounded-xl border text-sm transition bg-transparent dark:text-slate-200 flex justify-between items-center cursor-pointer ${
                  errors.reporterUnit 
                    ? "border-rose-500" 
                    : "border-slate-200 dark:border-slate-700"
                }`}
                onClick={() => setIsReporterUnitOpen(true)}
              >
                <span className={formData.reporterUnit ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>
                  {formData.reporterUnit || "Pilih unit"}
                </span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {errors.reporterUnit && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Unit pelapor wajib diisi!
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                KATEGORI HELPDESK <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  formData.serviceType === "TIK"
                    ? "border-slate-400 bg-slate-50 dark:bg-slate-800/50"
                    : errors.serviceType
                      ? "border-rose-500"
                      : "border-slate-200 dark:border-slate-700"
                }`}>
                  <input 
                    type="radio" 
                    name="serviceType" 
                    value="TIK"
                    checked={formData.serviceType === "TIK"}
                    onChange={(e) => handleInputChange("serviceType", e.target.value)}
                    className="w-4 h-4 text-[#0a2360] border-slate-300 focus:ring-[#0a2360]" 
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Teknologi Informasi & Komunikasi (TIK)</span>
                </label>
                
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                  formData.serviceType === "Sarpras"
                    ? "border-slate-400 bg-slate-50 dark:bg-slate-800/50"
                    : errors.serviceType
                      ? "border-rose-500"
                      : "border-slate-200 dark:border-slate-700"
                }`}>
                  <input 
                    type="radio" 
                    name="serviceType" 
                    value="Sarpras"
                    checked={formData.serviceType === "Sarpras"}
                    onChange={(e) => handleInputChange("serviceType", e.target.value)}
                    className="w-4 h-4 text-[#0a2360] border-slate-300 focus:ring-[#0a2360]" 
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">Sarana & Prasarana (Sarpras)</span>
                </label>
              </div>
              {errors.serviceType && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Kategori helpdesk wajib dipilih!
                </p>
              )}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Data Inventaris */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Data Inventaris</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                NO. INVENTARIS <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Contoh: INV-TIK-2023-089"
                  value={formData.inventoryNumber}
                  onChange={(e) => handleInputChange("inventoryNumber", e.target.value)}
                  className={`w-full pl-4 pr-12 py-3 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 ${
                    errors.inventoryNumber 
                      ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
                <button 
                  type="button"
                  onClick={onScan}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <ScanLine className="w-5 h-5" />
                </button>
              </div>
              {errors.inventoryNumber && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Nomer inventaris wajib diisi!
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                NAMA INVENTARIS <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Contoh: PC All-in-One Core i5 Poli Dalam"
                value={formData.inventoryName}
                onChange={(e) => handleInputChange("inventoryName", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 ${
                  errors.inventoryName 
                    ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {errors.inventoryName && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Nama inventaris wajib diisi!
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                MERK / SERI INVENTARIS
              </label>
              <input 
                type="text" 
                placeholder="Contoh: Lenovo ThinkCentre M70a / RAM 16GB"
                value={formData.inventoryBrand}
                onChange={(e) => handleInputChange("inventoryBrand", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none transition bg-transparent dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                UNIT INVENTARIS <span className="text-rose-500">*</span>
              </label>
              <div 
                className={`w-full px-4 py-3 rounded-xl border text-sm transition bg-transparent dark:text-slate-200 flex justify-between items-center cursor-pointer ${
                  errors.inventoryUnit 
                    ? "border-rose-500" 
                    : "border-slate-200 dark:border-slate-700"
                }`}
                onClick={() => setIsInventoryUnitOpen(true)}
              >
                <span className={formData.inventoryUnit ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}>
                  {formData.inventoryUnit || "Pilih unit"}
                </span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {errors.inventoryUnit && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Unit inventaris wajib diisi!
                </p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                LOKASI INVENTARIS
              </label>
              <input 
                type="text" 
                placeholder="Masukkan lokasi inventaris"
                value={formData.inventoryLocation}
                onChange={(e) => handleInputChange("inventoryLocation", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none transition bg-transparent dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Detail Kendala */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Detail Kendala</h2>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                DESKRIPSI KENDALA <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={4}
                placeholder="Jelaskan secara runtut kronologi atau kendala yang ditemukan pada alat/sistem."
                value={formData.problemDescription}
                onChange={(e) => handleInputChange("problemDescription", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 resize-none ${
                  errors.problemDescription 
                    ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                    : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {errors.problemDescription && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-rose-500 flex items-center justify-center text-[8px]">!</span>
                  Deskripsi kendala wajib diisi!
                </p>
              )}
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

          {/* Foto Bukti Awal */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Foto Bukti Awal</h2>
            
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-500 mb-3">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="text-[#0a2360] dark:text-blue-400 font-bold">Pilih Foto</span> atau ambil kamera
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, atau PDF (Maks. 5MB)</p>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-2">
            <Button type="submit" className="w-full py-3 bg-[#0a2360] hover:bg-blue-900 text-white rounded-xl">
              Kirim Tiket
            </Button>
          </div>
        </form>
      </main>

      {/* Selectors */}
      <BottomSheetSelector 
        isOpen={isReporterUnitOpen}
        onClose={() => setIsReporterUnitOpen(false)}
        title="Pilih Unit Pelapor"
        options={unitOptions}
        value={formData.reporterUnit}
        onChange={(val) => handleInputChange("reporterUnit", val)}
        searchPlaceholder="Cari kategori kendala"
      />

      <BottomSheetSelector 
        isOpen={isInventoryUnitOpen}
        onClose={() => setIsInventoryUnitOpen(false)}
        title="Pilih Unit Inventaris"
        options={unitOptions}
        value={formData.inventoryUnit}
        onChange={(val) => handleInputChange("inventoryUnit", val)}
        searchPlaceholder="Cari kategori kendala"
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-[280px] flex flex-col items-center text-center p-6 pt-10 pb-8 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-emerald-500 mb-4 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20">
              <Check className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Berhasil !</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tiket berhasil dibuat beserta nomor tiket!</p>
          </div>
        </div>
      )}
    </div>
  );
};
