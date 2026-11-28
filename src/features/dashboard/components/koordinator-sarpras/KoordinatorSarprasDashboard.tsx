import StatCard from "../super-admin/StatCard";
import TicketTrendChart from "../super-admin/TicketTrendChart";
import AssetStatusDonutChart from "../super-admin/AssetStatusDonutChart";
import MaintenanceCalendarWidget from "../super-admin/MaintenanceCalendarWidget";
import ReminderWidget from "../super-admin/ReminderWidget";
import DashboardSkeleton from "../DashboardSkeleton";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function KoordinatorSarprasDashboard() {
  const { data, isLoading } = useDashboardData("koordinator-sarpras");

  if (isLoading) {
    return <DashboardSkeleton statCount={4} hasCharts hasCalendar />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Selamat Datang, Koordinator Sarpras!
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Pantau tiket, aset, dan jadwal maintenance Sarpras hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} card={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <TicketTrendChart data={data.ticketTrends} />
        </div>
        <div className="lg:col-span-5">
          <AssetStatusDonutChart data={data.assetStatuses} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <MaintenanceCalendarWidget schedules={data.maintenanceSchedules} />
        </div>
        <div className="lg:col-span-5">
          <ReminderWidget initialReminders={data.reminders} />
        </div>
      </div>
    </div>
  );
}
