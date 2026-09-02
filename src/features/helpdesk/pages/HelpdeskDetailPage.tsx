import React from 'react';
import type { TicketItem } from '../types/helpdesk';
import { TicketStatusBadge } from '../components/TicketStatusBadge';
import { TicketCategoryBadge } from '../components/TicketCategoryBadge';
import { AttachmentItem } from '../components/AttachmentItem';

interface Props {
  ticket?: TicketItem;
  onBack?: () => void;
}

const MOCK_DETAIL_TICKET: TicketItem = {
  id: '1',
  code: 'TIK-2023-045',
  title: 'Jaringan Wi-Fi Lantai 3 Mati Total',
  description:
    'Koneksi internet di seluruh area lantai 3 terputus sejak pagi ini. Sudah coba restart router tapi tetap tidak bisa.',
  category: 'TIK',
  status: 'Diproses',
  reporter: {
    name: 'Ahmad Subagyo',
    unit: 'Poli Umum',
    avatarInitials: 'AS',
  },
  assignee: {
    name: 'Budi Santoso',
    role: 'IT Support',
    avatarInitials: 'BS',
  },
  createdAt: '10 Okt 2023, 08:30 WIB',
  finishedAt: '-',
  attachments: [
    {
      id: 'att-1',
      name: 'sebelum_perbaikan.jpg',
      size: '920 KB',
      url: '#',
    },
  ],
  history: [
    {
      id: 'log-1',
      action: 'Petugas melakukan pengecekan router di lokasi.',
      timestamp: '24 Okt 09:15',
      isCompleted: true,
    },
    {
      id: 'log-2',
      action: 'Petugas ditugaskan (Budi Santoso).',
      timestamp: '24 Okt 09:00',
      isCompleted: false,
    },
    {
      id: 'log-3',
      action: 'Tiket dibuat oleh sistem.',
      timestamp: '24 Okt 08:30',
      isCompleted: false,
    },
  ],
};

export const HelpdeskDetailPage: React.FC<Props> = ({ ticket = MOCK_DETAIL_TICKET, onBack }) => {
  const statusSteps = [
    { label: 'Baru', active: true },
    { label: 'Diproses', active: ticket.status === 'Diproses' || ticket.status === 'Selesai' },
    { label: 'Selesai', active: ticket.status === 'Selesai' },
  ];

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 min-h-screen space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Kembali"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-base md:text-lg font-bold text-slate-900">
            Detail Tiket #{ticket.code}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <TicketCategoryBadge category={ticket.category} />
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Stepper Status Alur Kerja */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between max-w-sm mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          {statusSteps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  step.active
                    ? 'bg-amber-500 border-amber-500 ring-4 ring-amber-100'
                    : 'bg-slate-300 border-white'
                }`}
              />
              <span
                className={`text-[11px] mt-1.5 font-medium ${
                  step.active ? 'text-amber-600 font-semibold' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Konten Grid: Mobile Stack (1 kolom), Layar Besar (3 kolom: 2 Kiri, 1 Kanan) */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
        {/* Kolom Kiri: Data Pihak Terkait & Rincian Masalah */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card Pelapor & Petugas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium">Pelapor</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                    {ticket.reporter.avatarInitials || ticket.reporter.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{ticket.reporter.name}</h4>
                    <p className="text-xs text-slate-500">{ticket.reporter.unit}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-medium">Petugas Menangani</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {ticket.assignee?.avatarInitials || ticket.assignee?.name.charAt(0) || '-'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {ticket.assignee?.name || 'Belum ditugaskan'}
                    </h4>
                    <p className="text-xs text-slate-500">{ticket.assignee?.role || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400">Tanggal Dibuat</span>
                <p className="font-semibold text-slate-700 mt-0.5">{ticket.createdAt}</p>
              </div>
              <div>
                <span className="text-slate-400">Tanggal Selesai</span>
                <p className="font-semibold text-slate-700 mt-0.5">{ticket.finishedAt || '-'}</p>
              </div>
            </div>
          </div>

          {/* Card Deskripsi & Lampiran Awal */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Deskripsi Masalah
            </h3>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              "{ticket.description}"
            </p>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 mb-2 block">Lampiran Awal</span>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((att) => (
                    <AttachmentItem key={att.id} attachment={att} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Penanganan & Bukti Selesai */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Riwayat Penanganan
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {ticket.history?.map((log) => (
              <div key={log.id} className="relative">
                <div
                  className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${
                    log.isCompleted ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-slate-400'
                  }`}
                />
                <span className={`text-[11px] font-bold ${log.isCompleted ? 'text-amber-600' : 'text-slate-500'}`}>
                  {log.timestamp}
                </span>
                <p className="text-xs font-medium text-slate-800 mt-0.5">{log.action}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 mb-2 block">Bukti Hasil Penanganan</span>
            <AttachmentItem
              attachment={{
                id: 'att-after',
                name: 'sesudah_perbaikan.jpg',
                size: '920 KB',
                url: '#',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};