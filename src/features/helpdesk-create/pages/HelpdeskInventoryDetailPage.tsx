import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { IconArrowLeft, IconMapPin, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";

import { getAssetByUid, type AssetByUid } from "../services/searchApi";

export default function HelpdeskInventoryDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const uid = searchParams.get("uid")?.trim() ?? "";

  const [asset, setAsset] = useState<AssetByUid | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  // ==========================================
  // GET ASSET BY UID
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    const fetchAsset = async () => {
      setIsLoading(true);
      setError("");
      setAsset(null);

      if (!uid) {
        setError("UID inventaris tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getAssetByUid(uid);

        if (cancelled) return;

        setAsset(result);
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Gagal mengambil detail inventaris.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchAsset();

    return () => {
      cancelled = true;
    };
  }, [uid, retryKey]);

  // ==========================================
  // NAVIGASI KE FORM BUAT TIKET
  // ==========================================

  const handleCreateTicket = () => {
    if (!asset || isLoading) return;

    navigate("/helpdesk/create", {
      state: {
        scannedAsset: asset,
      },
    });
  };

  // ==========================================
  // UI - TETAP
  // ==========================================

  return (
    <div className="min-h-dvh bg-table-card">
      <div className="mx-auto w-full max-w-250 px-6 py-5 sm:px-6 lg:px-0">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-slate-500 transition hover:text-bluersch"
            aria-label="Kembali"
          >
            <IconArrowLeft size={20} strokeWidth={1.7} />
          </button>

          <h1 className="text-sm font-semibold text-text">Buat Tiket</h1>
        </div>

        {/* DETAIL CARD */}
        <div className="overflow-hidden rounded-2xl border border-soft-border bg-white dark:bg-slate-700">
          {/* HEADER CARD */}
          <div className="flex items-center justify-between border-b border-soft-border px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary-600" />

              <h2 className="text-xs font-semibold uppercase tracking-wide text-text-title">
                Detail Inventaris
              </h2>
            </div>

            {asset && !isLoading && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                Ditemukan
              </span>
            )}
          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 px-5 py-12">
              <IconLoader2 size={28} className="animate-spin text-primary-700" />

              <p className="text-xs text-text-secondary">Memuat data inventaris...</p>
            </div>
          )}

          {/* ERROR */}
          {!isLoading && error && (
            <div className="flex flex-col items-center px-5 py-8 text-center">
              <IconAlertCircle size={30} className="text-red-500" />

              <p className="mt-3 text-sm text-red-500">{error}</p>

              <button
                type="button"
                onClick={() => setRetryKey((prev) => prev + 1)}
                className="mt-4 text-sm font-medium text-primary-700 underline"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* DATA INVENTARIS */}
          {!isLoading && asset && (
            <div className="px-5">
              {/* NOMOR INVENTARIS */}
              <div className="border-b border-soft-border py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Nomor Inventaris
                </p>

                <p className="text-sm font-medium text-text-title">
                  {asset.code ?? "Belum memiliki kode"}
                </p>
              </div>

              {/* NAMA INVENTARIS */}
              <div className="border-b border-soft-border py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Nama Inventaris
                </p>

                <p className="text-sm font-medium text-text-title">{asset.name || "—"}</p>
              </div>

              {/* MEREK INVENTARIS */}
              <div className="border-b border-soft-border py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Merek Inventaris
                </p>

                <p className="text-sm font-medium text-text-title">{asset.brand || "—"}</p>
              </div>

              {/* LOKASI */}
              <div className="py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Lokasi Inventaris
                </p>

                <div className="flex items-start gap-2">
                  <IconMapPin size={17} className="mt-0.5 shrink-0 text-text-secondary" />

                  <p className="text-sm leading-5 text-text-title">{asset.location || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BUAT TIKET */}
        <div className="mt-5">
          <button
            type="button"
            disabled={!asset || isLoading}
            onClick={handleCreateTicket}
            className="flex w-full items-center justify-center rounded-xl bg-primary-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buat Tiket
          </button>
        </div>
      </div>
    </div>
  );
}
