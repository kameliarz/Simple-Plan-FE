import React, { useState } from "react";
import { X, ClipboardCheck, Upload, Trash2, Check } from "lucide-react";
import Button from "../../../components/ui/Button";

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    status: string;
    startTime: string;
    endTime: string;
    notes: string;
    photo?: { name: string; size: string; url: string };
  }) => void;
}

export const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [status, setStatus] = useState("Terselesaikan");
  const [startTime, setStartTime] = useState("2023-10-10T09:40");
  const [endTime, setEndTime] = useState("2023-10-10T10:30");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<{ name: string; size: string; url: string } | null>({
    name: "sesudah_perbaikan_wifi_lt3.jpg",
    size: "1.4 MB",
    url: "#"
  }); // Using dummy photo by default to match mockup
  
  const [topError, setTopError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ status?: string; startTime?: string; endTime?: string; notes?: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { status?: string; startTime?: string; endTime?: string; notes?: string } = {};
    if (!status) newErrors.status = "Status tiket wajib dipilih!";
    if (!startTime) newErrors.startTime = "Waktu mulai perbaikan wajib diisi!";
    if (!endTime) newErrors.endTime = "Waktu selesai perbaikan wajib diisi!";
    if (!notes) newErrors.notes = "Catatan penanganan wajib diisi!";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTopError("Kolom catatan penanganan wajib diisi");
      return;
    }
    
    if (new Date(endTime) < new Date(startTime)) {
      setErrors({ startTime: " ", endTime: " " });
      setTopError("Waktu selesai perbaikan tidak boleh lebih awal dari waktu mulai");
      return;
    }
    
    setErrors({});
    setTopError(null);
    onSubmit({ status, startTime, endTime, notes, photo: photo || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl shadow-xl flex flex-col sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200">
        
        {/* Drag handle for mobile */}
        <div className="w-full flex justify-center py-2 sm:hidden absolute top-0 left-0 right-0 z-20">
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 pt-8 sm:pt-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Catatan Penanganan</h2>
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
          {topError && (
            <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400">
              <span className="w-5 h-5 rounded-full border border-rose-500 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold">!</span>
              </span>
              <p className="text-sm font-medium">{topError}</p>
            </div>
          )}

          <form id="updateStatusForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Status Tiket */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Status Tiket <span className="text-rose-500">*</span>
              </label>
              <select 
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (errors.status) setErrors({ ...errors, status: undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm dark:bg-slate-800 dark:text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1em] ${
                  errors.status ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <option value="">Pilih Status</option>
                <option value="Terselesaikan">Selesai</option>
                <option value="Diproses">Diproses</option>
              </select>
              {errors.status && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold">!</span></span>
                  {errors.status}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Waktu Mulai */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Waktu Mulai Perbaikan <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="datetime-local" 
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (errors.startTime) setErrors({ ...errors, startTime: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm dark:bg-slate-800 dark:text-slate-200 ${
                    errors.startTime ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.startTime && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold">!</span></span>
                    {errors.startTime}
                  </p>
                )}
              </div>

              {/* Waktu Selesai */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Waktu Selesai Perbaikan <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="datetime-local" 
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    if (errors.endTime) setErrors({ ...errors, endTime: undefined });
                  }}
                  className={`w-full px-4 py-3 rounded-xl border focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm dark:bg-slate-800 dark:text-slate-200 ${
                    errors.endTime ? 'border-rose-500 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
                {errors.endTime && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold">!</span></span>
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>

            {/* Catatan Penanganan */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Catatan Penanganan <span className="text-rose-500">*</span>
              </label>
              <textarea 
                rows={4}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  if (errors.notes) setErrors({ ...errors, notes: undefined });
                }}
                className={`w-full px-4 py-3 rounded-xl border outline-none text-sm dark:bg-slate-800 dark:text-slate-200 resize-none ${
                  errors.notes 
                    ? 'border-rose-500 focus:ring-rose-100 focus:ring-2 dark:border-rose-500' 
                    : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700'
                }`}
              />
              {errors.notes && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <span className="w-3.5 h-3.5 rounded-full border border-rose-500 flex items-center justify-center shrink-0"><span className="text-[10px] font-bold">!</span></span>
                  {errors.notes}
                </p>
              )}
            </div>

            {/* Upload Foto */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Foto Hasil Perbaikan (Bukti Terselesaikan)
              </label>
              
              {photo ? (
                <div className="border border-slate-200 border-dashed dark:border-slate-700 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{photo.name}</p>
                      <p className="text-xs text-slate-500">{photo.size} • Berhasil diunggah</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" type="button" className="px-3 py-1.5 text-xs text-slate-600">
                      Unggah Foto
                    </Button>
                    <button type="button" onClick={() => setPhoto(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Klik untuk mengunggah atau seret foto ke sini</p>
                  <p className="text-xs text-slate-500 mt-1">Maks. ukuran 5MB (JPG/PNG)</p>
                </div>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
          <Button type="submit" form="updateStatusForm" className="px-6 py-2.5 bg-[#003178] hover:bg-[#00255a] text-white">
            <Check className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
