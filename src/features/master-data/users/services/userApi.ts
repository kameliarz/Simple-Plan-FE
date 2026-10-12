import type {
  ApiUser,
  CreateUserPayload,
  ToggleUserStatusPayload,
  UpdateUserPayload,
  UserCollectionResponse,
  UserDetailResponse,
} from "../types/user";
import { getToken } from "@/features/auth-login/services/authStorage";

const API_BASE_URL = "/api/v1";

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface GetUsersParams {
  page?: number;
  "filter[search]"?: string;
  "filter[unit_id]"?: number;
}

export async function getUsers(params: GetUsersParams = {}): Promise<UserCollectionResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params["filter[search]"]) query.set("filter[search]", params["filter[search]"]);
  if (params["filter[unit_id]"]) query.set("filter[unit_id]", String(params["filter[unit_id]"]));

  const queryString = query.toString();
  const url = queryString ? `${API_BASE_URL}/users?${queryString}` : `${API_BASE_URL}/users`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data user (${response.status})`);
  }

  return response.json();
}

export async function getUserDetail(userId: number | string): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil detail user (${response.status})`);
  }

  const result: UserDetailResponse = await response.json();
  return result.data;
}

export class ApiValidationError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}

export async function createUser(payload: CreateUserPayload): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiValidationError(
      errorData?.message || `Gagal menambah user (${response.status})`,
      errorData?.errors,
    );
  }

  const result: UserDetailResponse = await response.json();
  return result.data;
}

export async function updateUser(
  userId: number | string,
  payload: UpdateUserPayload,
): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH", // Update user bisa pake PATCH
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiValidationError(
      errorData?.message || `Gagal mengubah data user (${response.status})`,
      errorData?.errors,
    );
  }

  const result: UserDetailResponse = await response.json();
  return result.data;
}

export async function toggleUserStatus(
  userId: number | string,
  payload: ToggleUserStatusPayload,
): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiValidationError(
      errorData?.message || `Gagal mengubah status user (${response.status})`,
      errorData?.errors,
    );
  }

  const result: UserDetailResponse = await response.json();
  return result.data;
}

export async function getUnits(): Promise<{ id: number; name: string }[]> {
  const response = await fetch(`${API_BASE_URL}/units?per_page=100`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data unit (${response.status})`);
  }

  const result = await response.json();
  return result.data.map((item: { id: number; unit_name?: string; name?: string }) => ({
    id: item.id,
    name: item.unit_name || item.name,
  }));
}

export async function getRoles(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/roles?per_page=100`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data role (${response.status})`);
  }

  const result = await response.json();
  return result.data.map((item: { name: string }) => item.name);
}
