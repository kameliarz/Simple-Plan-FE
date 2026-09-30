import type { LoginUser } from "../types/auth-login.types";

const TOKEN_KEY = "simple-plan-token";
const USER_KEY = "simple-plan-user";

export function saveAuth(token: string, user: LoginUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): LoginUser | null {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as LoginUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
