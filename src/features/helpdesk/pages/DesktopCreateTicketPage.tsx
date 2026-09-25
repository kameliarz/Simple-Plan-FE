import React, { useState } from "react";
import { ArrowLeft, Search, Upload, Check, AlertCircle, X } from "lucide-react";
import Button from "../../../components/ui/Button";

interface DesktopCreateTicketPageProps {
  onBack?: () => void;
  onSubmitSuccess?: (ticketId: string) => void;
}

export const DesktopCreateTicketPage: React.FC<DesktopCreateTicketPageProps> = ({
  onBack,
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

  const unitOptions = [
    { label: "Poli Rawat Jalan / Poli Dalam", value: "Poli Rawat Jalan / Poli Dalam" },
    { label: "Unit Gawat Darurat (UGD)", value: "Unit Gawat Darurat (UGD)" },
    { label: "Ruang Rawat Inap Melati Lt. 3", value: "Ruang Rawat Inap Melati Lt. 3" },
    { label: "Instalasi Farmasi Sentral", value: "Instalasi Farmasi Sentral" },
    { label: "Laboratorium & Radiologi", value: "Laboratorium & Radiologi" },
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
      {/* Header */}
      <header className="h-[60px] px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Buat Tiket
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          <form id="createTicketForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Informasi Pelapor */}
            <section className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Informasi Pelapor</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Nama Pelapor <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: dr. Budi Santoso, Sp.PD"
                    value={formData.reporterName}
                    onChange={(e) => handleInputChange("reporterName", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 ${
                      errors.reporterName 
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-500" 
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />
                  {errors.reporterName && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Nama pelapor wajib diisi!
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Unit Pelapor <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={formData.reporterUnit}
                    onChange={(e) => handleInputChange("reporterUnit", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition bg-transparent dark:bg-slate-800 dark:text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1em] ${
                      errors.reporterUnit 
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-500" 
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-500"
                    }`}
                  >
                    <option value="">Pilih unit</option>
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.reporterUnit && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unit pelapor wajib diisi!
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Kategori Helpdesk <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                    formData.serviceType === "TIK"
                      ? "border-slate-400 bg-slate-50 dark:bg-slate-800/50"
                      : errors.serviceType
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Kategori helpdesk wajib dipilih!
                  </p>
                )}
              </div>
            </section>

            {/* Data Inventaris */}
            <section className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Data Inventaris</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    No. Inventaris <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Contoh: INV-TIK-2023-089"
                      value={formData.inventoryNumber}
                      onChange={(e) => handleInputChange("inventoryNumber", e.target.value)}
                      className={`w-full pl-4 pr-10 py-2.5 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 ${
                        errors.inventoryNumber 
                          ? "border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-500" 
                          : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      }`}
                    />
                    <Search className={`w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 ${errors.inventoryNumber ? "text-rose-500" : "text-slate-400"}`} />
                  </div>
                  {errors.inventoryNumber && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Nomer inventaris wajib diisi!
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Nama Inventaris <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: PC All-in-One Core i5 Poli Dalam"
                    value={formData.inventoryName}
                    onChange={(e) => handleInputChange("inventoryName", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 ${
                      errors.inventoryName 
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-500" 
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  />
                  {errors.inventoryName && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Nama inventaris wajib diisi!
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Merk / Seri Inventaris
                  </label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Lenovo ThinkCentre M70a / RAM 16GB"
                    value={formData.inventoryBrand}
                    onChange={(e) => handleInputChange("inventoryBrand", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-transparent dark:text-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Unit Inventaris <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={formData.inventoryUnit}
                    onChange={(e) => handleInputChange("inventoryUnit", e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition bg-transparent dark:bg-slate-800 dark:text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1em] ${
                      errors.inventoryUnit 
                        ? "border-rose-500 focus:ring-1 focus:ring-rose-500 text-rose-500" 
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-500"
                    }`}
                  >
                    <option value="">Pilih unit</option>
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.inventoryUnit && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Unit inventaris wajib diisi!
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 mt-5">
                <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Lokasi Inventaris
                </label>
                <input 
                  type="text" 
                  placeholder="Masukkan lokasi inventaris"
                  value={formData.inventoryLocation}
                  onChange={(e) => handleInputChange("inventoryLocation", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-transparent dark:text-slate-200"
                />
              </div>
            </section>

            {/* Detail Kendala */}
            <section className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Detail Kendala</h2>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Deskripsi Kendala <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows={4}
                  placeholder="Jelaskan secara runtut kronologi atau kendala yang ditemukan pada alat/sistem..."
                  value={formData.problemDescription}
                  onChange={(e) => handleInputChange("problemDescription", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition bg-transparent dark:text-slate-200 resize-none ${
                    errors.problemDescription 
                      ? "border-rose-500 focus:ring-1 focus:ring-rose-500" 
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  }`}
                />
                {errors.problemDescription && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Deskripsi kendala wajib diisi!
                  </p>
                )}
              </div>
            </section>

            {/* Foto Bukti Awal */}
            <section className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Foto Bukti Awal</h2>
              
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tarik & lepas file bukti kerusakan di sini, atau <span className="text-[#0a2360] dark:text-blue-400 font-bold">Pilih Dokumen</span>
                </p>
                <p className="text-xs text-slate-400 mt-2">Format: JPG, PNG, atau PDF (Maks. 5MB)</p>
              </div>
            </section>

          </form>
        </div>
      </main>

      {/* Bottom Fixed Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-end z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button 
          type="submit" 
          form="createTicketForm"
          className="px-8 py-2.5 bg-[#0a2360] hover:bg-blue-900 text-white rounded-lg font-medium"
        >
          Kirim Tiket
        </Button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center text-center p-8 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 mb-6">
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

export default DesktopCreateTicketPage;
