import { clearAuth, getAuthRevision, getToken } from "@/features/auth-login/services/authStorage";

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getToken();
  const revision = getAuthRevision();
  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  const response = await fetch(input, init);

  if (
    response.status === 401 &&
    token &&
    headers.get("Authorization") === `Bearer ${token}` &&
    getToken() === token &&
    getAuthRevision() === revision
  ) {
    clearAuth();
  }

  return response;
}
