export interface PerPageProps {
  onChange: (value: number | "all") => void;
  value: number | "all";
}

const options: Array<number | "all"> = [5, 10, 15, 20, "all"];

export default function PerPage({ onChange, value }: PerPageProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      Tampilkan
      <select
        className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue === "all" ? "all" : Number(nextValue));
        }}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? "Semua" : option}
          </option>
        ))}
      </select>
    </label>
  );
}
