import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./apiFetch";
import {
  clearAuth,
  getToken,
  getUser,
  saveAuth,
  subscribeAuthChanges,
} from "@/features/auth-login/services/authStorage";
import { login } from "@/features/auth-login/services/authLoginApi";
const user = {
  id: 1,
  nama: "Test",
  unit_user: "TIK",
  jabatan: "Staff",
  role: "super-admin",
  status_user: "Aktif",
};
const fetchMock = vi.fn();
const options = { headers: { Authorization: "Bearer token-a" } };
function deferred() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  vi.stubGlobal("fetch", fetchMock);
  saveAuth("token-a", user);
});
afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});
describe("global authenticated requests", () => {
  it("clears token and user on 401 without consuming the response body", async () => {
    const response = new Response(JSON.stringify({ message: "Unauthenticated" }), { status: 401 });
    fetchMock.mockResolvedValue(response);
    expect(await apiFetch("/api/v1/notifications", options)).toBe(response);
    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(await response.json()).toEqual({ message: "Unauthenticated" });
  });
  it.each([200, 403, 422, 500])("keeps the session for HTTP %s", async (status) => {
    fetchMock.mockResolvedValue(new Response("body", { status }));
    await apiFetch("/api/v1/backups", options);
    expect(getToken()).toBe("token-a");
    expect(getUser()).toEqual(user);
  });
  it.each([new TypeError("Failed to fetch"), new DOMException("Aborted", "AbortError")])(
    "keeps the session when fetch rejects: %s",
    async (error) => {
      fetchMock.mockRejectedValue(error);
      await expect(apiFetch("/api/v1/tickets", options)).rejects.toBe(error);
      expect(getToken()).toBe("token-a");
    },
  );
  it("invalidates the session only once for simultaneous 401 responses", async () => {
    const a = deferred();
    const b = deferred();
    fetchMock.mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise);
    const changed = vi.fn();
    const unsubscribe = subscribeAuthChanges(changed);
    try {
      const first = apiFetch("/api/v1/tickets", options);
      const second = apiFetch("/api/v1/notifications", options);
      a.resolve(new Response(null, { status: 401 }));
      b.resolve(new Response(null, { status: 401 }));
      await Promise.all([first, second]);
      expect(changed).toHaveBeenCalledOnce();
    } finally {
      unsubscribe();
    }
  });
  it.each(["token-b", "token-a"])(
    "ignores an old 401 after a newer login using %s",
    async (newToken) => {
      const pending = deferred();
      fetchMock.mockReturnValue(pending.promise);
      const request = apiFetch("/api/v1/assets", options);
      clearAuth();
      saveAuth(newToken, user);
      pending.resolve(new Response(null, { status: 401 }));
      await request;
      expect(getToken()).toBe(newToken);
    },
  );
  it("supports authorization carried by a Request object", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    await apiFetch(new Request("http://localhost/api/v1/users", options));
    expect(getToken()).toBeNull();
  });
  it("does not invalidate the session for unauthenticated requests", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    await apiFetch("/public");
    expect(getToken()).toBe("token-a");
  });
  it("keeps login errors on the login form without invalidating an existing session", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Wrong password" }), { status: 401 }),
    );
    await expect(login({ nip: "1", password: "wrong" })).rejects.toMatchObject({ status: 401 });
    expect(getToken()).toBe("token-a");
  });
  it("preserves multipart bodies, abort signals and response headers", async () => {
    const body = new FormData();
    body.append("name", "Asset");
    const signal = new AbortController().signal;
    const init = { ...options, method: "POST", body, signal };
    const response = new Response("zip", { headers: { "Content-Type": "application/zip" } });
    fetchMock.mockResolvedValue(response);
    expect(await apiFetch("/api/v1/assets", init)).toBe(response);
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/assets", init);
  });
});
