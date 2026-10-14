import { getToken } from "@/features/auth-login/services/authStorage";

/* =========================================================
   SEARCH USERS
   GET /api/v1/users/search
========================================================= */

export interface SearchedUser {
  id: number;
  name: string;
  unit: {
    id: number;
    unit_name: string;
  } | null;
}

interface SearchUsersResponse {
  data: SearchedUser[];
}

export async function searchUsersByName(name: string): Promise<SearchedUser[]> {
  const token = getToken();

  const queryParams = new URLSearchParams({
    name,
  });

  const response = await fetch(`/api/v1/users/search?${queryParams.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Search users error:", response.status, errorText);

    throw new Error(`Gagal mencari user: HTTP ${response.status}`);
  }

  const result: SearchUsersResponse = await response.json();

  return result.data;
}

/* =========================================================
   SEARCH ASSETS
   GET /api/v1/assets/search
========================================================= */

export interface SearchedAsset {
  id: number;
  asset_number: string;
  name: string;
  location?: string;
  unit_id?: number;
}

export async function searchAssets(
  unitId: number | string,
  searchKeyword: string = "",
): Promise<SearchedAsset[]> {
  const token = getToken();

  const queryParams = new URLSearchParams({
    unit: String(unitId),
    ...(searchKeyword ? { search: searchKeyword } : {}),
  });

  const response = await fetch(`/api/v1/assets/search?${queryParams.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Search assets error:", response.status, errorText);

    throw new Error(`Gagal mencari inventaris: HTTP ${response.status}`);
  }

  const result = await response.json();

  return Array.isArray(result) ? result : (result.data ?? []);
}

/* =========================================================
   SEARCH UNITS
   GET /api/v1/units/search
========================================================= */

export interface SearchedUnit {
  id: number;
  unit_name: string;
}

export async function searchUnits(searchKeyword: string = ""): Promise<SearchedUnit[]> {
  const token = getToken();

  const queryParams = new URLSearchParams(searchKeyword ? { search: searchKeyword } : {});

  const response = await fetch(`/api/v1/units/search?${queryParams.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Search units error:", response.status, errorText);

    throw new Error(`Gagal mencari unit: HTTP ${response.status}`);
  }

  const result = await response.json();

  return Array.isArray(result) ? result : (result.data ?? []);
}

/* =========================================================
   CREATE HELPDESK TICKET
   POST /api/v1/tickets
   Content-Type: multipart/form-data
========================================================= */

export type TicketService = "tik" | "sarpras";

export interface CreateTicketPayload {
  // Opsional, digunakan ketika super-admin
  // menentukan pelapor tiket
  reporter_id?: number | null;

  // Wajib
  service: TicketService;

  // Opsional, ID aset yang terkait dengan tiket
  asset_id?: number | null;

  // Wajib, deskripsi permasalahan
  description: string;

  // Opsional, bukti awal berupa file
  initial_evidence?: File | null;
}

export interface CreateTicketResponse {
  message?: string;
  data?: {
    id: number;
    ticket_number?: string;
    status?: string;
    [key: string]: unknown;
  };
}

export async function createTicket(payload: CreateTicketPayload): Promise<CreateTicketResponse> {
  const token = getToken();

  const formData = new FormData();

  /* ===============================
     REPORTER ID (OPSIONAL)
  =============================== */

  if (payload.reporter_id !== undefined && payload.reporter_id !== null) {
    formData.append("reporter_id", String(payload.reporter_id));
  }

  /* ===============================
     SERVICE (WAJIB)
  =============================== */

  formData.append("service", payload.service);

  /* ===============================
     ASSET ID (OPSIONAL)
  =============================== */

  if (payload.asset_id !== undefined && payload.asset_id !== null) {
    formData.append("asset_id", String(payload.asset_id));
  }

  /* ===============================
     DESCRIPTION (WAJIB)
  =============================== */

  formData.append("description", payload.description.trim());

  /* ===============================
     INITIAL EVIDENCE (OPSIONAL)
  =============================== */

  if (payload.initial_evidence instanceof File) {
    formData.append("initial_evidence", payload.initial_evidence);
  }

  /* ===============================
     REQUEST API
  =============================== */

  const response = await fetch("/api/v1/tickets", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  /* ===============================
     ERROR HANDLING
  =============================== */

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Create ticket error:", response.status, errorText);

    throw new Error(`Gagal membuat tiket: HTTP ${response.status}`);
  }

  /* ===============================
     RESPONSE
  =============================== */

  const result: CreateTicketResponse = await response.json();

  return result;
}
