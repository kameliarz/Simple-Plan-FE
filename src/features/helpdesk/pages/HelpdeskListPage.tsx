import React, { useState } from 'react';
import type { TicketCategory, TicketItem, TicketStatus } from '../types/helpdesk';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketCategoryBadge } from '../components/TicketCategoryBadge';
import {
  TicketFilterBottomSheet,
  type FilterState,
} from '../components/TicketFilterBottomSheet';
import Button from '../../../components/ui/Button';

interface HelpdeskListPageProps {
  onSelectTicket?: (id: string) => void;
  desktopSearchQuery?: string; // Query pencarian opsional yang diteruskan dari Navbar Desktop FE2
}

const MOCK_TICKETS: TicketItem[] = [
  {
    id: '1',
    code: 'TK-2023-001',
    title: 'Jaringan Wi-Fi Lantai 3 Mati Total',
    description:
      'Koneksi internet di seluruh area lantai 3 terputus sejak pagi ini. Sudah coba restart router tapi tetap tidak bisa.',
    category: 'TIK',
    status: 'Baru',
    reporter: { name: 'Dr. Andi Santoso', unit: 'Poli Umum' },
    createdAt: '24 Okt 2023, 08:30',
  },
  {
    id: '2',
    code: 'TK-2023-002',
    title: 'AC ruang tunggu IGD bocor',
    description:
      'Terdapat tetesan air yang cukup deras dari unit AC di ruang tunggu keluarga pasien IGD.',
    category: 'Sarpras',
    status: 'Diproses',
    reporter: { name: 'Ns. Siti Rahma', unit: 'IGD' },
    createdAt: '24 Okt 2023, 09:15',
  },
  {
    id: '3',
    code: 'TK-2023-003',
    title: 'Monitor Pasien Kamar 4 Blank Screen',
    description:
      'Monitor tanda vital di bed 4 mati layar hitam meskipun indikator daya menyala.',
    category: 'Sarpras',
    status: 'Diproses',
    reporter: { name: 'Ns. Siti Rahma', unit: 'Rawat Inap' },
    createdAt: '24 Okt 2023, 09:15',
  },
  {
    id: '4',
    code: 'TK-2023-004',
    title: 'Printer Resep Rawat Jalan Tidak Merespon',
    description:
      'Dokumen resep obat tertahan di antrean print spooler dan tidak tercetak.',
    category: 'Sarpras',
    status: 'Diproses',
    reporter: { name: 'Ns. Siti Rahma', unit: 'Farmasi' },
    createdAt: '24 Okt 2023, 09:15',
  },
];

const borderAccentMap: Record<TicketStatus, string> = {
  Baru: 'border-l-amber-500',
  Diproses: 'border-l-blue-600',
  Selesai: 'border-l-emerald-500',
};

export const HelpdeskListPage: React.FC<HelpdeskListPageProps> = ({
  onSelectTicket,
  desktopSearchQuery = '',
}) => {
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [activeMobileTab, setActiveMobileTab] = useState<'Semua' | TicketStatus>('Semua');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Filter state yang dipakai bersama oleh Dropdown Desktop dan Bottom Sheet Mobile
  const [filters, setFilters] = useState<FilterState>({
    category: null,
    status: null,
    date: '',
  });

  const mobileTabs: Array<'Semua' | TicketStatus> = ['Semua', 'Baru', 'Diproses', 'Selesai'];

  const filteredTickets = MOCK_TICKETS.filter((ticket) => {
    // Pencarian mobile memakai input lokal, pencarian desktop memakai prop dari navbar
    const effectiveSearch = mobileSearchQuery || desktopSearchQuery;
    const matchSearch =
      ticket.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      ticket.code.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      ticket.reporter.name.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchQuickTab = activeMobileTab === 'Semua' || ticket.status === activeMobileTab;
    const matchCategory = !filters.category || ticket.category === filters.category;
    const matchStatus = !filters.status || ticket.status === filters.status;

    return matchSearch && matchQuickTab && matchCategory && matchStatus;
  });

  return (
    <div className="w-full space-y-4 p-4 md:p-6 min-h-screen bg-slate-50/50">
      {/* ========================================================= */}
      {/* 1. KONTROL TAMPILAN MOBILE (Pencarian + Tab Status)       */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              placeholder="Cari ID tiket, pelapor..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs text-slate-600 hover:bg-slate-50 active:scale-95 transition"
            title="Filter Lanjutan"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </button>
        </div>

        {/* Tab Pills Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {mobileTabs.map((tab) => (
            <Button
              key={tab}
              type="button"
              onClick={() => setActiveMobileTab(tab)}
              className={`rounded-full text-xs px-4 h-8 whitespace-nowrap border transition ${
                activeMobileTab === tab
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KONTROL TAMPILAN DESKTOP (Toolbar Filter Dropdown)     */}
      {/* ========================================================= */}
      <div className="hidden md:flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl shadow-xs border border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          {/* Label Filter */}
          <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Dropdown Kategori */}
          <div className="relative">
            <select
              value={filters.category || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: (e.target.value as TicketCategory) || null,
                }))
              }
              className="appearance-none bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-2 pr-8 rounded-xl cursor-pointer transition border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Kategori</option>
              <option value="TIK">TIK</option>
              <option value="Sarpras">Sarpras</option>
            </select>
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown Status */}
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as TicketStatus) || null,
                }))
              }
              className="appearance-none bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-2 pr-8 rounded-xl cursor-pointer transition border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Status</option>
              <option value="Baru">Baru</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Filter Tanggal */}
          <div className="relative">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
              placeholder="mm/dd/yyyy"
              className="bg-slate-100/70 hover:bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            />
          </div>

          {/* Reset Filter jika ada filter aktif */}
          {(filters.category || filters.status || filters.date) && (
            <button
              type="button"
              onClick={() => setFilters({ category: null, status: null, date: '' })}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DAFTAR TIKET MOBILE (Card Feed dengan Aksen Kiri)       */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket?.(ticket.id)}
            className={`cursor-pointer p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs border-l-4 ${borderAccentMap[ticket.status]} flex flex-col gap-2 hover:shadow-md transition active:scale-[0.99]`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">#{ticket.code}</span>
                <TicketCategoryBadge category={ticket.category} />
              </div>
              <TicketStatusBadge status={ticket.status} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ticket.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{ticket.description}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                  {ticket.reporter.name.charAt(0)}
                </div>
                <span>
                  {ticket.reporter.name} ({ticket.reporter.unit})
                </span>
              </div>
              <span>{ticket.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 4. TABEL DESKTOP (Clean, Flat, Tanpa Card Tebal)          */}
      {/* ========================================================= */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-[#f0f4f9] text-slate-600 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Nomor Tiket</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Pelapor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tanggal Dibuat</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-4.5 font-semibold text-slate-800">#{ticket.code}</td>
                <td className="px-6 py-4.5">
                  <TicketCategoryBadge category={ticket.category} />
                </td>
                <td className="px-6 py-4.5 font-medium text-slate-800">{ticket.reporter.name}</td>
                <td className="px-6 py-4.5">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4.5 text-slate-500 font-normal">{ticket.createdAt}</td>
                <td className="px-6 py-4.5 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectTicket?.(ticket.id)}
                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                    title="Lihat Detail"
                  >
                    <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Desktop Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs text-slate-500 bg-white">
          <span>Showing 1 to {filteredTickets.length} of 48 entries</span>
          <div className="flex items-center gap-1.5">
            <button className="px-2 py-1 text-slate-400 cursor-not-allowed hover:text-slate-600">
              &lt;
            </button>
            <button className="w-7 h-7 rounded-lg bg-blue-900 text-white font-semibold flex items-center justify-center shadow-xs">
              1
            </button>
            <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center transition">
              2
            </button>
            <button className="w-7 h-7 rounded-lg text-slate-600 hover:bg-slate-100 flex items-center justify-center transition">
              3
            </button>
            <button className="px-2 py-1 text-slate-600 hover:text-slate-800">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Komponen Bottom Sheet Filter Mobile */}
      <TicketFilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        initialFilters={filters}
        onApply={(applied) => setFilters(applied)}
      />
    </div>
  );
};