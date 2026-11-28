import StatCard from "./StatCard";
import TicketTrendChart from "./TicketTrendChart";
import AssetStatusDonutChart from "./AssetStatusDonutChart";
import MaintenanceCalendarWidget from "./MaintenanceCalendarWidget";
import ReminderWidget from "./ReminderWidget";
import DashboardSkeleton from "../DashboardSkeleton";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function SuperAdminDashboard() {
  const { data, isLoading } = useDashboardData("super-admin");

  if (isLoading) {
    return <DashboardSkeleton statCount={5} hasCharts hasCalendar />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Selamat Datang, Super Admin!
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Pantau tiket, aset, jadwal maintenance, dan aktivitas sistem Simple-Plan hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
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
