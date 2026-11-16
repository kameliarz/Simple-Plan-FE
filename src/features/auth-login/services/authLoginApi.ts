import type { LoginFormData, LoginResponse } from "../types/auth-login.types";

export async function login(data: LoginFormData): Promise<LoginResponse> {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      nip: data.nip,
      password: data.password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      data: result,
    };
  }

  return result;
}
