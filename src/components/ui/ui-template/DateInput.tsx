import { IconCalendar } from "@tabler/icons-react";

export interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DateInput({ value, onChange }: DateInputProps) {
  return (
    <div className="relative w-48">
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
        <IconCalendar size={17} strokeWidth={1.8} className="text-slate-600" />
      </div>

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
            h-10
            w-full
            cursor-pointer
            rounded-md
            border-0
            bg-blue-50
            pl-11
            pr-3
            text-sm
            text-slate-600
            outline-none
            focus:ring-0

            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:right-0
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:opacity-0
        "
      />
    </div>
  );
}
