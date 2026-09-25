import { IconAlertCircle, IconCalendar } from "@tabler/icons-react";

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  variant?: "date" | "datetime";
  required?: boolean;
  error?: string;
}

export default function DateInput({
  value,
  onChange,
  variant = "date",
  required = false,
  error,
}: DateInputProps) {
  const inputType = variant === "datetime" ? "datetime-local" : "date";

  return (
    <div className="relative w-50">
      <div className="relative">
        {/* icon kiri */}
        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-0
            z-10
            flex
            items-center
            pl-4
          "
        >
          <IconCalendar size={17} strokeWidth={1.8} className="text-text-secondary" />
        </div>

        <input
          type={inputType}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          className={`
              h-10
              w-full
              cursor-pointer
              rounded-md
              border-0
              bg-button
              pl-11
              pr-3
              text-sm
              text-text-secondary
              outline-none
              focus:ring-0
              ${
                error
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-transparent focus:border-primary focus:ring-primary/10"
              }

              [&::-webkit-calendar-picker-indicator]:absolute
              [&::-webkit-calendar-picker-indicator]:right-0
              [&::-webkit-calendar-picker-indicator]:h-full
              [&::-webkit-calendar-picker-indicator]:w-full
              [&::-webkit-calendar-picker-indicator]:opacity-0
          `}
        />
      </div>
      {error && (
        <small className="mt-1 flex items-center gap-1 text-xs font-normal text-danger-500">
          <IconAlertCircle size={14} strokeWidth={2} />
          <span>{error}</span>
        </small>
      )}
    </div>
  );
}
