import React, { useState } from "react";
import { X, Link2, AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button";

interface EskalasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { tujuan: string; catatan: string }) => void;
}

export const EskalasiModal: React.FC<EskalasiModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [tujuan, setTujuan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [errors, setErrors] = useState<{ tujuan?: string; catatan?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { tujuan?: string; catatan?: string } = {};
    if (!tujuan) newErrors.tujuan = "Tujuan eskalasi wajib dipilih!";
    if (!catatan) newErrors.catatan = "Catatan eskalasi wajib diisi!";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit({ tujuan, catatan });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl shadow-xl flex flex-col sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 pt-8 sm:pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
              <Link2 className="w-5 h-5 -rotate-45" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Eskalasi Tiket</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <form id="eskalasiForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Tujuan Eskalasi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tujuan Eskalasi <span className="text-rose-500">*</span>
              </label>
              <select 
                value={tujuan}
                onChange={(e) => {
                  setTujuan(e.target.value);
                  if (errors.tujuan) setErrors({ ...errors, tujuan: undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm dark:bg-slate-800 dark:text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1em] ${
                  errors.tujuan ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <option value="">Pilih tujuan eskalasi</option>
                <option value="IT Infrastruktur">IT Infrastruktur</option>
                <option value="Vendor Pihak Ketiga">Vendor Pihak Ketiga</option>
              </select>
              {errors.tujuan && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.tujuan}
                </p>
              )}
            </div>

            {/* Catatan Eskalasi */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Catatan Eskalasi <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={4}
                value={catatan}
                onChange={(e) => {
                  setCatatan(e.target.value);
                  if (errors.catatan) setErrors({ ...errors, catatan: undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm dark:bg-slate-800 dark:text-slate-200 resize-none ${
                  errors.catatan 
                    ? 'border-rose-500 focus:ring-rose-100 focus:ring-2 dark:border-rose-500' 
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700'
                }`}
              />
              {errors.catatan && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.catatan}
                </p>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-8 py-2.5 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl text-sm">
            Batal
          </Button>
          <Button type="submit" form="eskalasiForm" className="px-8 py-2.5 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white font-semibold rounded-xl text-sm shadow-sm transition">
            Kirim Eskalasi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EskalasiModal;
