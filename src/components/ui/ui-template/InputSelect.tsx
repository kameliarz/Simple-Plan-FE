import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { IconChevronDown, IconCircle, IconCircleFilled } from "@tabler/icons-react";
import { useState } from "react";

export type SelectOption = {
  id: number | string;
  [key: string]: unknown;
};

export interface InputSelectProps<TOption extends SelectOption> {
  data: TOption[];
  displayKey?: keyof TOption & string;
  error?: string;
  label?: string;
  multiple?: boolean;
  placeholder?: string;
  searchable?: boolean;
  selected: TOption | TOption[] | null;
  setSelected: (value: TOption | TOption[]) => void;
}

export default function InputSelect<TOption extends SelectOption>({
  data,
  displayKey = "name" as keyof TOption & string,
  error,
  label,
  multiple = false,
  placeholder = "Pilih...",
  searchable = false,
  selected,
  setSelected,
}: InputSelectProps<TOption>) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    String(item[displayKey] ?? "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const buttonLabel = multiple
    ? Array.isArray(selected) && selected.length > 0
      ? selected.map((item) => String(item[displayKey] ?? "")).join(", ")
      : placeholder
    : selected && !Array.isArray(selected)
      ? String(selected[displayKey] ?? "")
      : placeholder;

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label className="block text-base font-semibold text-slate-700">{label}</label>
      ) : null}

      <Listbox by="id" multiple={multiple} onChange={setSelected} value={selected ?? undefined}>
        <ListboxButton
          className="
            flex h-11 w-full items-center justify-between gap-4
            rounded-xl border border-[#DCE4EF] bg-white
            px-4 text-sm text-slate-700
            transition
            focus:border-bluersch
            focus:outline-none
            focus:ring-2 focus:ring-bluersch/10
          "
        >
          <span className={selected ? "truncate text-slate-700" : "truncate text-[#91A4C3]"}>
            {buttonLabel}
          </span>

          <IconChevronDown size={20} strokeWidth={1.5} className="shrink-0 text-slate-400" />
        </ListboxButton>

        <ListboxOptions
          className="
            mt-2 flex max-h-72 flex-col gap-2
            overflow-auto rounded-xl
            border border-[#DCE4EF]
            bg-white p-3 shadow-lg
            focus:outline-none
          "
        >
          {searchable ? (
            <input
              className="
                mb-1 h-11 w-full
                rounded-xl border border-[#DCE4EF]
                bg-white px-4
                text-base text-slate-700
                placeholder:text-[#91A4C3]
                focus:border-bluersch
                focus:outline-none
                focus:ring-2 focus:ring-bluersch/10
              "
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari..."
              type="text"
              value={search}
            />
          ) : null}

          {filteredData.map((item) => (
            <ListboxOption key={item.id} value={item}>
              {({ selected: isSelected }) => (
                <div
                  className="
                    flex cursor-pointer items-center gap-3
                    rounded-lg px-3 py-2.5
                    text-sm text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  {isSelected ? (
                    <IconCircleFilled
                      className="shrink-0 text-bluersch"
                      size={15}
                      strokeWidth={1.5}
                    />
                  ) : (
                    <IconCircle className="shrink-0 text-slate-400" size={15} strokeWidth={1.5} />
                  )}

                  <span className="truncate">{String(item[displayKey] ?? "")}</span>
                </div>
              )}
            </ListboxOption>
          ))}

          {filteredData.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-400">Data tidak ditemukan.</p>
          ) : null}
        </ListboxOptions>
      </Listbox>

      {error ? <small className="text-xs font-normal text-danger-500">{error}</small> : null}
    </div>
  );
}
