import { apiFetch } from "@/lib/apiFetch";
import { getToken } from "@/features/auth-login/services/authStorage";
import type { ReportFilters, ReportModule } from "../types/report.types";

export const reportTabs = [
  { label: "Helpdesk", value: "helpdesk" },
  { label: "Inventaris", value: "inventaris" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Desain Grafis", value: "desain-grafis" },
] as const;
export const serviceOptions = [
  { label: "Semua", value: "all" },
  { label: "Sarpras", value: "sarpras" },
  { label: "TIK", value: "tik" },
];
const paths: Record<ReportModule, string> = {
  helpdesk: "helpdesk",
  inventaris: "inventory",
  maintenance: "maintenance",
  "desain-grafis": "design-graphic",
};
export type ReportData = { summary: Record<string, number>; charts: Record<string, unknown> };

export function reportParams(filters: ReportFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.module !== "inventaris") {
    if (filters.startDate) p.set("periode_awal", `${filters.startDate}-01`);
    if (filters.endDate) {
      const [year, month] = filters.endDate.split("-").map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      p.set("periode_akhir", `${filters.endDate}-${lastDay}`);
    }
  }
  if (filters.module === "helpdesk")
    p.set("jenis_layanan", filters.service === "all" ? "semua" : filters.service);
  if (filters.classification !== "all" && filters.module === "inventaris")
    p.set("classification_id", filters.classification);
  if (filters.classification !== "all" && filters.module === "maintenance")
    p.set("klasifikasi", filters.classification);
  if (filters.module === "inventaris") {
    if (filters.status !== "all") p.set("status", filters.status);
    if (filters.location !== "all") p.set("location_id", filters.location);
  }
  return p;
}
async function request(filters: ReportFilters, format?: "pdf" | "xlsx", signal?: AbortSignal) {
  const params = reportParams(filters);
  if (format) params.set("format", format);
  const token = getToken();
  const response = await apiFetch(
    `/api/v1/reports/${paths[filters.module]}${format ? "/export" : ""}?${params}`,
    {
      credentials: "include",
      signal,
      headers: {
        Accept: format ? "*/*" : "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!response.ok)
    throw new Error(`Gagal ${format ? "mengunduh" : "memuat"} laporan (HTTP ${response.status}).`);
  return response;
}
export async function getReport(filters: ReportFilters, signal?: AbortSignal): Promise<ReportData> {
  const response = await request(filters, undefined, signal);
  const result = (await response.json()) as { data: ReportData };
  if (!result.data?.summary || !result.data?.charts)
    throw new Error("Format laporan dari server tidak valid.");
  return result.data;
}
export async function downloadReport(filters: ReportFilters, format: "pdf" | "xlsx") {
  const response = await request(filters, format);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laporan-${paths[filters.module]}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
