import StatCard from "../super-admin/StatCard";
import ReminderWidget from "../super-admin/ReminderWidget";
import DashboardSkeleton from "../DashboardSkeleton";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function UserDashboard() {
  const { data, isLoading } = useDashboardData("user");

  if (isLoading) {
    return <DashboardSkeleton statCount={4} hasCharts={false} hasCalendar={false} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Selamat Datang, User!
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-slate-400">
          Pantau status tiket dan request desain yang Anda ajukan hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} card={stat} />
        ))}
      </div>

      <div className="w-full">
        <ReminderWidget initialReminders={data.reminders} />
      </div>
    </div>
  );
}
