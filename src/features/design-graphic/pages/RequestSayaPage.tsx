import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconInfoCircle, IconPlus } from "@tabler/icons-react";
import Button from "@/components/ui/ui-template/Button";
import Search from "@/components/ui/ui-template/Search";
import DesignRequestTable from "../components/DesignRequestTable";
import DesignStatusBadge from "../components/DesignStatusBadge";
import { designGraphicService } from "../services/designGraphicService";
import type { DesignRequestItem } from "../types/designGraphic.types";

export default function RequestSayaPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DesignRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async (query = searchTerm) => {
    setIsLoading(true);
    try {
      const data = await designGraphicService.getRequests(query, "Semua status");
      setItems(data);
    } catch (err) {
      console.error("Gagal memuat daftar request saya:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    designGraphicService
      .getRequests("", "Semua status")
      .then((data) => {
        if (active) {
          setItems(data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat daftar request saya:", err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    void loadData(val);
  };

  return (
    <div className="min-w-0 space-y-4 p-3 m-1 md:m-5 md:space-y-5 md:p-0">
      {/* mobile */}
      <div className="space-y-4 md:hidden">
        {/* Search Input */}
        <Search
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Cari nomor atau judul request..."
        />

        {/* Title & + Buat Request Button */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="font-poppins text-base font-semibold text-text-title">Request Saya</h1>
          <Button
            type="button"
            size="sm"
            icon={<IconPlus size={15} strokeWidth={2.2} />}
            label="Buat Request"
            onClick={() => navigate("/design-graphic/create")}
          />
        </div>

        {/* Mobile Cards or Empty State */}
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center text-sm text-text-secondary">
            Memuat daftar request desain...
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[60dvh] items-center justify-center px-4">
            <div className="flex items-center justify-center gap-2 text-text-secondary">
              <IconInfoCircle size={18} strokeWidth={1.8} className="shrink-0" />
              <p className="text-xs font-normal">Data request tidak ditemukan!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-table-card p-4 shadow-2xs dark:border-slate-700"
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-2.5 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-medium text-text-title">Nomor Request</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{item.nomorRequest}</p>
                  </div>
                  <DesignStatusBadge status={item.status} />
                </div>

                <div className="mt-2.5 space-y-1">
                  <p className="text-xs font-semibold text-text">{item.judulRequest}</p>
                  <p className="text-xs text-text-secondary">
                    Unit : <span className="font-semibold text-text">{item.unit}</span>
                  </p>
                  <p className="text-xs text-text-secondary">
                    Tanggal Dibutuhkan :{" "}
                    <span className="font-semibold text-text">{item.tanggalDibutuhkan}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* desktop */}
      <div className="hidden md:block space-y-5">
        <h1 className="font-poppins text-xl font-semibold text-text-title">Request Saya</h1>

        <div className="rounded-xl border border-med-border bg-table-card p-4 md:p-5">
          {/* Search & + Buat Request Bar */}
          <div className="mb-5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Search
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Cari nomor atau judul request..."
              />
            </div>

            <Button
              type="button"
              icon={<IconPlus size={16} strokeWidth={2.2} />}
              label="Buat Request"
              onClick={() => navigate("/design-graphic/create")}
              className="shrink-0"
            />
          </div>

          {/* Table */}
          <DesignRequestTable items={items} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
