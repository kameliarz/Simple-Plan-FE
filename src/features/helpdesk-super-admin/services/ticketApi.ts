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
    "baru" | "terverifikasi" | "diproses" | "selesai" | "ditolak" | "diklasifikasi" | "eskalasi";
  date_from?: string;
  date_to?: string;
  search?: string;
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
