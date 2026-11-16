import { useState } from "react";

interface DropdownProps {
  label: string;
  options: string[];
}

function Dropdown({ label, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-44">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-sidebar px-4 py-2.5 text-sm text-text transition hover:border-primary"
      >
        <span>{selected || label}</span>

        <span className={`text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-sidebar py-1 shadow-lg">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-2.5 text-left text-sm text-text transition hover:bg-background"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
