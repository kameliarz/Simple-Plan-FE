import type { TicketCollectionResponse } from "@/features/helpdesk-super-admin/types/ticket";

const API_BASE_URL = "/api/v1";

export interface GetTicketsParams {
  page?: number;
  per_page?: number;
  service?: "tik" | "sarpras";
  status?: "baru" | "terverifikasi" | "diproses" | "selesai" | "ditolak";
  date_from?: string;
  date_to?: string;
  search?: string;
}

export async function getTickets(params: GetTicketsParams = {}): Promise<TicketCollectionResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  if (params.service) query.set("service", params.service);
  if (params.status) query.set("status", params.status);
  if (params.date_from) query.set("date_from", params.date_from);
  if (params.date_to) query.set("date_to", params.date_to);
  if (params.search) query.set("search", params.search);

  const response = await fetch(`${API_BASE_URL}/tickets?${query.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer 1|PqaU0AkfTCvi51tPkh44a2mU1nxro0D9iUSwgwkM5503ba5d`,
    },
    credentials: "include",
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

  return response.json();
}
