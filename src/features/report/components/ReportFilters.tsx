import { useEffect, useState } from "react";
import { getAssetClassifications } from "@/features/inventaris/services/inventarisApi";
import { getAssetLocations } from "@/features/helpdesk-create/services/searchApi";
import DownloadReport from "./DownloadOptions";
import { IconAlertCircle } from "@tabler/icons-react";

import Button from "@/components/ui/ui-template/Button";
import DateInput from "@/components/ui/ui-template/DateInput";
import Dropdown from "@/components/ui/ui-template/Dropdown";

import { serviceOptions } from "../services/report.service";

import type { ReportFilters as Filters } from "../types/report.types";

// =====================================
// PROPS
// =====================================

interface Props {
  value: Filters;
  onChange: (next: Filters) => void;
  onApply: () => void;
  onDownload: (format: "pdf" | "excel") => void;
  hasData: boolean;
  error?: string;
}

// =====================================
// DROPDOWN OPTIONS
// =====================================

const statusOptions = [
  { label: "Semua", value: "all" },
  ...["Digunakan", "Tidak Digunakan", "Dipinjam", "Rusak"].map((value) => ({
    label: value,
    value,
  })),
];

// =====================================
// STYLING
// =====================================

const fieldLabel = "mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300";

// =====================================
// MAIN COMPONENT
// =====================================

export default function ReportFilters({
  value,
  onChange,
  onApply,
  onDownload,
  hasData,
  error,
}: Props) {
  // =====================================
  // ACTIVE MODULE
  // =====================================

  const [classificationOptions, setClassificationOptions] = useState([
    { label: "Semua", value: "all" },
  ]);
  const [locationOptions, setLocationOptions] = useState([{ label: "Semua", value: "all" }]);
  const [lookupError, setLookupError] = useState("");
  useEffect(() => {
    if (value.module !== "inventaris" && value.module !== "maintenance") return;
    let active = true;
    getAssetClassifications()
      .then((items) => {
        if (active)
          setClassificationOptions([
            { label: "Semua", value: "all" },
            ...items.map((item) => ({ label: item.name, value: String(item.id) })),
          ]);
      })
      .catch(() => {
        if (active) setLookupError("Gagal memuat klasifikasi.");
      });
    if (value.module === "inventaris")
      getAssetLocations()
        .then((items) => {
          if (active)
            setLocationOptions([
              { label: "Semua", value: "all" },
              ...items.map((item) => ({ label: item.name, value: String(item.id) })),
            ]);
        })
        .catch(() => {
          if (active) setLookupError("Gagal memuat lokasi.");
        });
    return () => {
      active = false;
    };
  }, [value.module]);

  const isInventory = value.module === "inventaris";
  const isMaintenance = value.module === "maintenance";
  const isHelpdesk = value.module === "helpdesk";

  // =====================================
  // DEFAULT DROPDOWN VALUES
  // =====================================

  const selectedService = value.service || "all";

  const selectedClassification = value.classification || "all";

  const selectedStatus = value.status || "all";

  const selectedLocation = value.location || "all";

  // =====================================
  // VALIDATION
  // =====================================

  const isInvalidPeriod = Boolean(
    !isInventory && value.startDate && value.endDate && value.startDate > value.endDate,
  );

  const periodError = isInvalidPeriod
    ? "Periode akhir tidak boleh lebih awal dari periode awal."
    : "";

  const displayError = periodError || error || lookupError;

  // =====================================
  // UPDATE FILTER
  // =====================================

  const update = (patch: Partial<Filters>) => {
    onChange({
      ...value,
      ...patch,
    });
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <section
      className="
        rounded-xl bg-white p-4 shadow-sm
        dark:bg-slate-900
      "
    >
      {/* ========================== */}
      {/* FILTER GRID */}
      {/* ========================== */}

      <div
        className="
          grid grid-cols-1 gap-3
          md:grid-cols-2
          lg:grid-cols-[1fr_1fr_1fr_auto]
          lg:items-start
        "
      >
        {/* ========================== */}
        {/* INVENTARIS FILTER */}
        {/* ========================== */}

        {isInventory ? (
          <>
            {/* KLASIFIKASI */}

            <div className="min-w-0">
              <label className={fieldLabel}>Klasifikasi</label>

              <Dropdown
                className="w-full!"
                value={selectedClassification}
                options={classificationOptions}
                placeholder="Semua"
                onChange={(classification) =>
                  update({
                    classification,
                  })
                }
                mobileSheet
                sheetTitle="Pilih Klasifikasi"
              />
            </div>

            {/* STATUS */}

            <div className="min-w-0">
              <label className={fieldLabel}>Status</label>

              <Dropdown
                className="w-full!"
                value={selectedStatus}
                options={statusOptions}
                placeholder="Semua"
                onChange={(status) =>
                  update({
                    status,
                  })
                }
                mobileSheet
                sheetTitle="Pilih Status"
              />
            </div>

            {/* LOKASI RUANGAN */}

            <div className="min-w-0">
              <label className={fieldLabel}>Lokasi Ruangan</label>

              <Dropdown
                className="w-full!"
                value={selectedLocation}
                options={locationOptions}
                placeholder="Semua"
                onChange={(location) =>
                  update({
                    location,
                  })
                }
                mobileSheet
                sheetTitle="Pilih Lokasi Ruangan"
              />
            </div>
          </>
        ) : (
          <>
            {/* ========================== */}
            {/* PERIODE AWAL */}
            {/* ========================== */}

            <div className="min-w-0">
              <label className={fieldLabel}>Periode Awal</label>

              <DateInput
                variant="month"
                value={value.startDate}
                onChange={(startDate) =>
                  update({
                    startDate,
                  })
                }
              />
            </div>

            {/* ========================== */}
            {/* PERIODE AKHIR */}
            {/* ========================== */}

            <div className="min-w-0">
              <label className={fieldLabel}>Periode Akhir</label>

              <DateInput
                variant="month"
                value={value.endDate}
                invalid={isInvalidPeriod}
                onChange={(endDate) =>
                  update({
                    endDate,
                  })
                }
              />
            </div>

            {/* ========================== */}
            {/* JENIS LAYANAN / KLASIFIKASI */}
            {/* ========================== */}

            {(isHelpdesk || isMaintenance) && (
              <div className="min-w-0">
                <label className={fieldLabel}>{isHelpdesk ? "Jenis Layanan" : "Klasifikasi"}</label>

                <Dropdown
                  className="w-full!"
                  value={isHelpdesk ? selectedService : selectedClassification}
                  options={isHelpdesk ? serviceOptions : classificationOptions}
                  placeholder="Semua"
                  onChange={(next) => {
                    if (isHelpdesk) {
                      update({
                        service: next,
                      });
                    } else {
                      update({
                        classification: next,
                      });
                    }
                  }}
                  mobileSheet
                  sheetTitle={isHelpdesk ? "Pilih Jenis Layanan" : "Pilih Klasifikasi"}
                />
              </div>
            )}
          </>
        )}

        {/* ========================== */}
        {/* ACTION BUTTONS */}
        {/* ========================== */}

        <div
          className="
            flex gap-2
            lg:mt-5.5
          "
        >
          <Button
            className="
              min-w-28 flex-1
              lg:flex-none
            "
            size="sm"
            label="Tampilkan"
            disabled={isInvalidPeriod}
            onClick={onApply}
          />

          <DownloadReport hasData={hasData} onDownload={onDownload} />
        </div>
      </div>

      {/* ========================== */}
      {/* ERROR MESSAGE */}
      {/* ========================== */}

      {displayError && (
        <div className="pt-4">
          <div
            role="alert"
            className="
              flex items-center gap-1.5
              text-xs text-danger-500
            "
          >
            <IconAlertCircle size={14} strokeWidth={2} className="shrink-0" />

            <span className="lg:whitespace-nowrap">{displayError}</span>
          </div>
        </div>
      )}
    </section>
  );
}
