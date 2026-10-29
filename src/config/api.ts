const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");

export const API_BASE_URL = "/api/v1";

export const BACKEND_URL = ENV_API_BASE_URL.replace(/\/api\/v1$/, "");
