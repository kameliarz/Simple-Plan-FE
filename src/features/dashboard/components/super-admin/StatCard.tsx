import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { DashboardStatCard } from "../../types/dashboard.types";

interface StatCardProps {
  card: DashboardStatCard;
}

export default function StatCard({ card }: StatCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (card.link) {
      navigate(card.link);
    }
  };

  if (card.isPrimary) {
    return (
      <div
        onClick={handleClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#035bd8] to-[#0142a3] p-4 text-white shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5"
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full border-[18px] border-white/10" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full border-[22px] border-white/5" />

        <div className="relative z-10 flex flex-col justify-between h-full min-h-[110px]">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-white/90 leading-tight">{card.title}</span>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30">
              <ArrowUpRight size={13} strokeWidth={2.2} />
            </span>
          </div>

          <div className="mt-3">
            <p className="text-3xl font-bold tracking-tight text-white">{card.value}</p>
            <p className="mt-0.5 text-[11px] font-normal text-white/80">{card.subtext}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 cursor-pointer min-h-[110px]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-gray-700 dark:text-slate-300 leading-tight">
          {card.title}
        </span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
          <ArrowUpRight size={13} strokeWidth={2.2} />
        </span>
      </div>

      <div className="mt-3">
        <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {card.value}
        </p>
        <p className="mt-0.5 text-[11px] font-normal text-gray-400 dark:text-slate-500">
          {card.subtext}
        </p>
      </div>
    </div>
  );
}
