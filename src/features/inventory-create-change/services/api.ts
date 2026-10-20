import { getToken } from "@/features/auth-login/services/authStorage";

const BASE_URL = "http://localhost:8000/api/v1";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function apiPost<T>(endpoint: string, data: FormData): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: data,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    const message = errorData?.message || `Gagal menyimpan data. Status: ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function apiPostJson<T>(endpoint: string, data: object): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    const message = errorData?.message || `Gagal menyimpan data. Status: ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
