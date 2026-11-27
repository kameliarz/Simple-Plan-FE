import StatCard from "../super-admin/StatCard";
import MaintenanceCalendarWidget from "../super-admin/MaintenanceCalendarWidget";
import ReminderWidget from "../super-admin/ReminderWidget";
import { useDashboardData } from "../../hooks/useDashboardData";
import { MOCK_PETUGAS_TIK_DASHBOARD_DATA } from "../../services/dashboardMockData";

export default function PetugasTikDashboard() {
  const { data } = useDashboardData("petugas-tik", MOCK_PETUGAS_TIK_DASHBOARD_DATA);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Selamat Datang, Petugas TIK!
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Pantau tiket, jadwal maintenance, dan tugas desain yang ditugaskan kepada Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} card={stat} />
        ))}
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
