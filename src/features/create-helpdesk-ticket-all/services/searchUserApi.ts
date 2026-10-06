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
