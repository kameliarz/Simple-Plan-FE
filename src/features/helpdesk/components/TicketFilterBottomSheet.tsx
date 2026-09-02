import React, { useState } from 'react';
import type { TicketCategory, TicketStatus } from '../types/helpdesk';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

export type ExtendedTicketStatus = TicketStatus | 'Ditolak';

export interface FilterState {
  category: TicketCategory | null;
  status: ExtendedTicketStatus | null;
  date: string;
}

interface TicketFilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export const TicketFilterBottomSheet: React.FC<TicketFilterBottomSheetProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = { category: null, status: null, date: '' },
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(
    initialFilters.category
  );
  const [selectedStatus, setSelectedStatus] = useState<ExtendedTicketStatus | null>(
    initialFilters.status
  );
  const [selectedDate, setSelectedDate] = useState<string>(initialFilters.date);

  if (!isOpen) return null;

  const categories: TicketCategory[] = ['TIK', 'Sarpras'];
  const statuses: ExtendedTicketStatus[] = ['Baru', 'Diproses', 'Selesai', 'Ditolak'];

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedStatus(null);
    setSelectedDate('');
    onApply({ category: null, status: null, date: '' });
    onClose();
  };

  const handleApply = () => {
    onApply({
      category: selectedCategory,
      status: selectedStatus,
      date: selectedDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Modal */}
      <div className="relative w-full bg-white rounded-t-3xl p-5 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Filter Tiket</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Kategori */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700">Kategori</span>
          <div className="flex items-center gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cat)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition ${
                    isSelected
                      ? 'bg-blue-100/70 border-blue-400 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700">Status</span>
          <div className="flex flex-wrap gap-2">
            {statuses.map((st) => {
              const isSelected = selectedStatus === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(isSelected ? null : st)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium border transition ${
                    isSelected
                      ? 'bg-blue-100/70 border-blue-400 text-blue-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Tanggal Menggunakan Global UI Input */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-700">Tanggal Dibuat</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Tombol Aksi Menggunakan Global UI Button */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
          >
            Terapkan
          </Button>
        </div>
      </div>
    </div>
  );
};