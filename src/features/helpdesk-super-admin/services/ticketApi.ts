import type {
  ApiTicket,
  TicketCollectionResponse,
} from "@/features/helpdesk-super-admin/types/ticket";

import { getToken } from "@/features/auth-login/services/authStorage";

const API_BASE_URL = "/api/v1";

export interface GetTicketsParams {
  page?: number;
  per_page?: number;
  service?: "tik" | "sarpras";
  status?:
    | "baru"
    | "diklasifikasi"
    | "ditolak"
    | "ditugaskan"
    | "diproses"
    | "eskalasi"
    | "terselesaikan"
    | "ditutup";
  priority?: "low" | "medium" | "high" | "critical";
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface AssigneeApiOption {
  id: string | number;
  name?: string;
  nama?: string;
  role?: string;
  jabatan?: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ==========================================
// AMBIL DAFTAR TIKET
// GET /api/v1/tickets
// ==========================================
export async function getTickets(params: GetTicketsParams = {}): Promise<TicketCollectionResponse> {
  const query = new URLSearchParams();

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.per_page) {
    query.set("per_page", String(params.per_page));
  }

  if (params.service) {
    query.set("service", params.service);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.priority) {
    query.set("priority", params.priority);
  }

  if (params.date_from) {
    query.set("date_from", params.date_from);
  }

  if (params.date_to) {
    query.set("date_to", params.date_to);
  }

  if (params.search) {
    query.set("search", params.search);
  }

  const queryString = query.toString();

  const url = queryString ? `${API_BASE_URL}/tickets?${queryString}` : `${API_BASE_URL}/tickets`;

  console.log("GET /tickets URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("GET /tickets gagal:", {
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });

    throw new Error(`Gagal mengambil data tiket. (${response.status})`);
  }

  const result: TicketCollectionResponse = await response.json();

  console.log("GET /tickets response:", result);

  console.log(
    "GET /tickets priorities:",
    result.data.map((ticket) => ({
      id: ticket.id,
      ticket_number: ticket.ticket_number,
      priority: ticket.priority,
    })),
  );

  return result;
}

// ==========================================
// AMBIL DETAIL SATU TIKET
// GET /api/v1/tickets/{ticketId}
// ==========================================
export async function getTicket(ticketId: string): Promise<ApiTicket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("GET /tickets/{ticket} gagal:", {
      ticketId,
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });

    throw new Error(`Gagal mengambil detail tiket. (${response.status})`);
  }

  const result = await response.json();

  console.log("GET /tickets/{ticketId} berhasil:", result);

  return result.data;
}

// ==========================================
// AMBIL PETUGAS TERKAIT
// GET /api/v1/tickets/{ticketId}/assignee-options
// ==========================================

export const getTicketAssigneeOptions = async (ticketId: string, search = "") => {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  const url = queryString
    ? `${API_BASE_URL}/tickets/${ticketId}/assignee-options?${queryString}`
    : `${API_BASE_URL}/tickets/${ticketId}/assignee-options`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("GET assignee-options gagal:", {
      ticketId,
      status: response.status,
      statusText: response.statusText,
      body: errorBody,
    });

    throw new Error(`Gagal mengambil daftar petugas. (${response.status})`);
  }

  const result = await response.json();

  console.log("GET assignee-options response:", result);

  // Sesuaikan dengan bentuk respons API sebenarnya.
  const rows: AssigneeApiOption[] = Array.isArray(result)
    ? result
    : Array.isArray(result.data)
      ? result.data
      : [];

  return rows.map((item) => {
    const name = item.name ?? item.nama ?? "";

    return {
      id: Number(item.id),
      name,
      role: item.jabatan ?? item.role ?? "Petugas",
      initials: name
        .split(" ")
        .map((part: string) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };
  });
};

// ==========================================
// KIRIM KLASIFIKASI TIKET
// POST /api/v1/tickets/{ticket}/classify
// ==========================================

type ClassifyTicketPayload = {
  quality_category_id?: number;
  it_tag_id?: number;
  custom_it_tag_text?: string;
  sarpras_category_id?: number;
};

export const classifyTicket = async (ticketId: string, payload: ClassifyTicketPayload) => {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/classify`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Gagal mengklasifikasikan tiket (${response.status}): ${responseText}`);
  }

  return responseText ? JSON.parse(responseText) : null;
};
export interface CreateTicketPayload {
  service: "tik" | "sarpras";
  description: string;
  asset_id?: number | null;
  initial_evidence?: File | null;
}

export const createTicket = async (data: CreateTicketPayload) => {
  const formData = new FormData();
  formData.append("service", data.service);
  formData.append("description", data.description);

  if (data.asset_id) {
    formData.append("asset_id", String(data.asset_id));
  }

  if (data.initial_evidence) {
    formData.append("initial_evidence", data.initial_evidence);
  }

  const response = await fetch("${API_BASE_URL}/tickets", {
    method: "POST",
    headers: {
      Authorization: "Bearer ",
    },
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error("Gagal membuat tiket (${response.status}): ${responseText}");
  }

  return responseText ? JSON.parse(responseText) : null;
};
