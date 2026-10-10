import { getToken } from "@/features/auth-login/services/authStorage";

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

export async function searchUsersByName(name: string) {
  const token = getToken();

  const response = await fetch(`/api/v1/users/search?name=${encodeURIComponent(name)}`, {
    method: "GET",
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

//GET /assets /search

export interface SearchedAsset {
  id: number;
  asset_number: string;
  name: string;
  location?: string;
  unit_id?: number;
}

export async function searchAssets(unitId: number | string, searchKeyword: string = "") {
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

export interface SearchedUnit {
  id: number;
  unit_name: string;
}

export async function searchUnits(searchKeyword: string = "") {
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

export interface CreateTicketPayload {
  service: string; // "sarpras" | "tik"
  asset_id?: number | string | null;
  description: string;
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

  // Wajib
  formData.append("service", payload.service);
  formData.append("description", payload.description);

  // Opsional: asset_id (hanya dikirim jika ada)
  if (payload.asset_id) {
    formData.append("asset_id", String(payload.asset_id));
  }

  // Opsional: initial_evidence (file bukti foto)
  if (payload.initial_evidence instanceof File) {
    formData.append("initial_evidence", payload.initial_evidence);
  }

  // Catatan: Jangan set header 'Content-Type' secara manual saat mengirim FormData
  // agar browser dapat membuat boundary header secara otomatis.
  const response = await fetch("/api/v1/tickets", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Create ticket error:", response.status, errorText);
    throw new Error(`Gagal membuat tiket: HTTP ${response.status}`);
  }

  return await response.json();
}
