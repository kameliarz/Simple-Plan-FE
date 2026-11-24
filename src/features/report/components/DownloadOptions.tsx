import { useState } from "react";
import { IconDownload, IconX, IconAlertCircle } from "@tabler/icons-react";

import Button from "@/components/ui/ui-template/Button";

type DownloadFormat = "pdf" | "excel";

interface DownloadReportProps {
  hasData: boolean;
  onDownload: (format: DownloadFormat) => void;
}

export default function DownloadReport({ hasData, onDownload }: DownloadReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<DownloadFormat | null>(null);
  const [error, setError] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setFormat(null);
    setError(false);
  };

  const handleDownload = () => {
    if (!format) {
      setError(true);
      return;
    }

    onDownload(format);
    handleClose();
  };

  return (
    <div className="relative inline-block">
      {/* Tombol utama Unduh */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<IconDownload size={16} stroke={1.8} />}
        label="Unduh"
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
        className="py-2"
      />

      {/* Pop-up Unduh Laporan */}
      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2
                     w-64 rounded-xl border border-gray-100
                     bg-white p-4 shadow-lg"
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-800">Unduh Laporan</h3>

            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 transition hover:text-gray-600"
              aria-label="Tutup pop-up"
            >
              <IconX size={16} stroke={1.8} />
            </button>
          </div>

          {!hasData ? (
            /* Kondisi tidak ada data */
            <p className="py-5 text-center text-xs text-gray-400">
              Tidak ada data yang dapat diunduh.
            </p>
          ) : (
            <>
              {/* Pilihan format laporan */}
              <p className="mb-2 text-xs text-gray-600">Format laporan</p>

              <div className="space-y-2">
                {(["pdf", "excel"] as const).map((item) => (
                  <label
                    key={item}
                    className={`flex cursor-pointer items-center
                      gap-2 rounded-lg border p-3 text-xs
                      transition-colors
                      ${
                        error
                          ? "border-red-400"
                          : format === item
                            ? "border-primary-600"
                            : "border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="report-format"
                      value={item}
                      checked={format === item}
                      onChange={() => {
                        setFormat(item);
                        setError(false);
                      }}
                      className="accent-primary-600"
                    />

                    <span className="text-gray-700">{item === "pdf" ? "PDF" : "Excel"}</span>
                  </label>
                ))}
              </div>

              {/* Validasi format */}
              {error && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                  <IconAlertCircle size={14} stroke={1.8} />
                  Format laporan harus dipilih!
                </p>
              )}

              {/* Tombol Unduh dalam pop-up */}
              <Button
                type="button"
                variant="primary"
                size="sm"
                label="Unduh"
                onClick={handleDownload}
                className="mt-4 w-full"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
