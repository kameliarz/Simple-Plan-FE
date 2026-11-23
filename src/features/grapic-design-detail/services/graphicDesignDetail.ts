import { apiFetch } from "@/lib/apiFetch";
import { getToken } from "@/features/auth-login/services/authStorage";
import type {
  DesignFile,
  DesignOfficer,
  DesignPriority,
  DesignStatus,
  GraphicDesignDetail,
} from "../types/graphicDesignDetail.types";

interface ApiFile {
  original_name: string;
  size: number;
  mime_type: string;
  url?: string;
}
interface Person {
  id: number;
  name: string;
}
interface ApiDraft {
  id: number;
  created_at: string;
  notes: string | null;
  file: ApiFile;
  uploaded_by: Person;
}
export type DesignHistoryEvent =
  | (ApiDraft & { type: "draft" })
  | {
      type: "revision";
      id: number;
      created_at: string;
      design_draft_id: number;
      revision_note: string;
      requested_by: Person;
    };
interface ApiDetail {
  id: number;
  request_number: string;
  title: string;
  design_type: string;
  description: string;
  needed_at: string;
  status: string;
  priority: string | null;
  requester: Person;
  unit: { name: string } | null;
  assigned_officer: Person | null;
  reference_file: ApiFile | null;
  latest_draft: ApiDraft | null;
  latest_revision: { design_draft_id: number; revision_note: string } | null;
  rejection_note: string | null;
  created_at: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const response = await apiFetch(`/api/v1${path}`, { ...init, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const errors = body?.errors as Record<string, string[]> | undefined;
    throw new Error(
      errors
        ? Object.values(errors).flat().join("\n")
        : body?.message || `Permintaan gagal (${response.status}).`,
    );
  }
  return body as T;
}
const path = (id: string) => `/design-requests/${encodeURIComponent(id)}`;
const date = (value: string) => {
  if (!value) return "-";
  try {
    const cleanStr = value.includes("T") ? value.split("T")[0] : value.trim();
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const bulanPendek = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      if (!isNaN(year) && !isNaN(monthIdx) && !isNaN(day) && bulanPendek[monthIdx]) {
        return `${day} ${bulanPendek[monthIdx]} ${year}`;
      }
    }

    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return value;
  }
};
const file = (value: ApiFile): DesignFile => ({
  name: value.original_name,
  size:
    value.size < 1024 * 1024
      ? `${(value.size / 1024).toFixed(1)} KB`
      : `${(value.size / (1024 * 1024)).toFixed(1)} MB`,
  url: value.url ?? "",
});
const officer = (value: Person): DesignOfficer => ({
  ...value,
  role: "Petugas TIK",
  initials: value.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase(),
});
const statuses: Record<string, DesignStatus> = {
  baru: "Baru",
  ditugaskan: "Ditugaskan",
  menunggu_persetujuan: "Menunggu Persetujuan",
  perlu_revisi: "Perlu Revisi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};
const priorities: Record<string, DesignPriority> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export async function getGraphicDesignHistory(id: string): Promise<DesignHistoryEvent[]> {
  return (await request<{ data: DesignHistoryEvent[] }>(`${path(id)}/history`)).data;
}
export async function getGraphicDesignDetail(id: string): Promise<GraphicDesignDetail> {
  const [detail, events] = await Promise.all([
    request<{ data: ApiDetail }>(path(id)),
    getGraphicDesignHistory(id),
  ]);
  const data = detail.data;
  const drafts = events
    .filter((event) => event.type === "draft")
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() || a.id - b.id,
    );
  const revisionFor = (draftId: number) =>
    events
      .filter((event) => event.type === "revision" && event.design_draft_id === draftId)
      .map((event) => (event.type === "revision" ? event.revision_note : ""))
      .join("\n\n");
  const latest = data.latest_draft;
  const latestFile = drafts.find((draft) => draft.id === latest?.id)?.file ?? latest?.file;
  return {
    id: String(data.id),
    requestNumber: data.request_number,
    title: data.title,
    status: statuses[data.status],
    priority: data.priority ? (priorities[data.priority] ?? null) : null,
    designType: data.design_type,
    description: data.description,
    requiredDate: date(data.needed_at),
    requesterId: data.requester.id,
    requesterName: data.requester.name,
    unit: data.unit?.name ?? "-",
    requestDate: date(data.created_at),
    assignee: data.assigned_officer ? officer(data.assigned_officer) : null,
    referenceFile: data.reference_file ? file(data.reference_file) : null,
    draft: latest
      ? {
          date: date(latest.created_at),
          notes: latest.notes ?? "",
          file: latestFile ? file(latestFile) : null,
        }
      : null,
    draftNumber: latest
      ? drafts.findIndex((draft) => draft.id === latest.id) + 1 || drafts.length + 1
      : undefined,
    history: drafts.flatMap((draft, index) =>
      draft.id === latest?.id
        ? []
        : [
            {
              id: String(draft.id),
              number: index + 1,
              date: date(draft.created_at),
              notes: draft.notes ?? "",
              file: file(draft.file),
              revisionNote: revisionFor(draft.id),
            },
          ],
    ),
    rejectionNote: data.rejection_note,
    revisionNote:
      latest && data.latest_revision?.design_draft_id === latest.id
        ? data.latest_revision.revision_note
        : null,
  };
}

export async function getDesignOfficerOptions(search = ""): Promise<DesignOfficer[]> {
  // The users endpoint is available to super-admin; assignment eligibility is validated by the backend.
  interface User {
    id: number;
    nama: string;
    role: string;
    status_user: string;
    jabatan: string;
  }
  const users: User[] = [];
  let page = 1;
  while (true) {
    const result = await request<{ data: { data: User[]; meta?: { last_page: number } } }>(
      `/users?per_page=100&page=${page}`,
    );
    users.push(...result.data.data);
    if (page >= (result.data.meta?.last_page ?? 1)) break;
    page++;
  }
  const keyword = search.trim().toLowerCase();
  return users
    .filter(
      (user) =>
        user.role === "petugas-tik" &&
        user.status_user === "Aktif" &&
        `${user.nama} ${user.jabatan}`.toLowerCase().includes(keyword),
    )
    .map((user) => ({
      ...officer({ id: user.id, name: user.nama }),
      role: user.jabatan || "Petugas TIK",
    }));
}
export async function assignGraphicDesign(
  id: string,
  payload: { priority: DesignPriority; officerId: number },
) {
  await request(`${path(id)}/assignment`, {
    method: "PUT",
    body: JSON.stringify({
      priority: payload.priority.toLowerCase(),
      assigned_officer_id: payload.officerId,
    }),
  });
  return getGraphicDesignDetail(id);
}
export async function rejectGraphicDesign(id: string, reason: string) {
  await request(`${path(id)}/rejections`, {
    method: "POST",
    body: JSON.stringify({ rejection_note: reason.trim() }),
  });
  return getGraphicDesignDetail(id);
}
export async function uploadGraphicDesignDraft(id: string, payload: { file: File; notes: string }) {
  if (!payload.file.size) throw new Error("File draft wajib diunggah.");
  if (payload.file.size > 10 * 1024 * 1024) throw new Error("Ukuran file draft maksimal 10 MB.");
  const body = new FormData();
  body.append("file", payload.file);
  if (payload.notes.trim()) body.append("notes", payload.notes.trim());
  await request(`${path(id)}/drafts`, { method: "POST", body });
  return getGraphicDesignDetail(id);
}
export async function approveGraphicDesignDraft(id: string) {
  await request(`${path(id)}/approvals`, { method: "POST" });
}
export async function requestGraphicDesignRevision(id: string, payload: { notes: string }) {
  await request(`${path(id)}/revisions`, {
    method: "POST",
    body: JSON.stringify({ revision_note: payload.notes.trim() }),
  });
}
export async function getGraphicDesignFinalFile(id: string) {
  return request<{ final_file_url: string; file: ApiFile }>(`${path(id)}/final-file`);
}
