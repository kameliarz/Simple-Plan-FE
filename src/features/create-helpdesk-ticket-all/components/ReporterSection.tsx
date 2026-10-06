import Input from "@/components/ui/ui-template/Input";
import Dropdown from "@/components/ui/ui-template/Dropdown";
import CategorySelector from "@/components/ui/ui-template/CategorySelector";

import type { HelpdeskCategory } from "../types";
import type { SearchedUser } from "../services/searchUserApi";

interface ReporterSectionProps {
  reporterName: string;
  unit: string | null;
  category: HelpdeskCategory;
  isSuperAdmin: boolean;
  selectedReporterId: string;
  searchedUsers: SearchedUser[];
  isSearchingUsers: boolean;
  searchUsersError?: string;
  showUserResults: boolean;
  reporterNameError?: string;
  unitError?: string;
  onReporterSearchChange: (value: string) => void;
  onSelectReporter: (user: SearchedUser) => void;
  onCategoryChange: (value: HelpdeskCategory) => void;
}

export default function ReporterSection({
  reporterName,
  unit,
  category,
  isSuperAdmin,
  selectedReporterId,
  searchedUsers,
  isSearchingUsers,
  searchUsersError,
  reporterNameError,
  unitError,
  onReporterSearchChange,
  onSelectReporter,
  onCategoryChange,
}: ReporterSectionProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Nama Pelapor */}
        <div className="relative">
          {isSuperAdmin ? (
            <>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">
                Nama Pelapor <span className="text-red-500">*</span>
              </label>

              <Dropdown
                value={selectedReporterId}
                displayValue={reporterName}
                options={searchedUsers.map((user) => ({
                  label: user.name,
                  value: String(user.id),
                }))}
                onChange={(userId) => {
                  const selectedUser = searchedUsers.find((user) => String(user.id) === userId);

                  if (selectedUser) {
                    onSelectReporter(selectedUser);
                  }
                }}
                onSearchChange={onReporterSearchChange}
                placeholder=""
                className="w-full"
                error={reporterNameError}
                searchable
                searchPlaceholder="Cari nama pelapor..."
                mobileSheet
                sheetTitle="Pilih Pelapor"
              />

              {isSearchingUsers && <p className="mt-1 text-xs text-slate-500">Mencari user...</p>}

              {searchUsersError && <p className="mt-1 text-xs text-red-500">{searchUsersError}</p>}
            </>
          ) : (
            <Input
              label="Nama Pelapor"
              required
              value={reporterName}
              onChange={() => {}}
              placeholder="Nama pelapor"
              error={reporterNameError}
              readOnly
              className="cursor-default"
            />
          )}
        </div>

        {/* Unit Pelapor */}
        <div>
          <Input
            label="Unit Pelapor"
            value={unit ?? ""}
            onChange={() => {}}
            placeholder="Unit"
            error={unitError}
            readOnly
            className="cursor-default"
          />
        </div>
      </div>

      {/* Kategori Helpdesk */}
      <CategorySelector<HelpdeskCategory>
        label="Kategori Helpdesk"
        required
        value={category}
        onChange={onCategoryChange}
        options={[
          {
            label: "Teknologi Informasi & Komunikasi (TIK)",
            value: "tik",
          },
          {
            label: "Sarana & Prasarana (Sarpras)",
            value: "sarpras",
          },
        ]}
      />
    </div>
  );
}
