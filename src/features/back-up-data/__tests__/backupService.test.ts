import { beforeEach, describe, expect, it, vi } from "vitest";
import { backupService, BackupApiError } from "../services/backupService";
import { filters, json, record, schedule, settings } from "./fixtures";

const fetchMock = () => vi.mocked(fetch);
beforeEach(() => {
  fetchMock().mockResolvedValue(json({ data: [record] }));
});

describe("backup service: request and mapping", () => {
  it("adds stored bearer token to authenticated requests", async () => {
    localStorage.setItem("simple-plan-token", "test-token");
    await backupService.getBackups();
    expect(new Headers(fetchMock().mock.calls[0][1]?.headers).get("Authorization")).toBe(
      "Bearer test-token",
    );
  });
  it("maps records, byte sizes and default pagination", async () => {
    const result = await backupService.getBackups();
    expect(result.backups[0]).toMatchObject({
      id: "1",
      fileName: "backup.zip",
      performedBy: "Admin",
      fileSize: 1.5,
      fileAvailable: true,
    });
    expect(result.meta).toMatchObject({
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 1,
      from: null,
      links: [],
    });
    const [url, options] = fetchMock().mock.calls[0];
    expect(String(url)).toContain("/backups?page=1&per_page=10");
    expect(new Headers(options?.headers).get("Accept")).toBe("application/json");
    expect(new Headers(options?.headers).has("Authorization")).toBe(false);
  });
  it("serializes server filters, excludes local search and forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await backupService.getBackups(
      2,
      5,
      {
        ...filters,
        search: "secret",
        type: "automatic",
        status: "failed",
        startDate: "2026-01-01",
        endDate: "2026-02-01",
      },
      signal,
    );
    const [url, options] = fetchMock().mock.calls[0];
    const query = new URL(String(url), "http://localhost").searchParams;
    expect(Object.fromEntries(query)).toEqual({
      page: "2",
      per_page: "5",
      type: "automatic",
      status: "failed",
      date_from: "2026-01-01",
      date_to: "2026-02-01",
    });
    expect(options?.signal).toBe(signal);
  });
  it("omits all/empty filters", async () => {
    await backupService.getBackups(1, 10, filters);
    expect(String(fetchMock().mock.calls[0][0])).toMatch(/page=1&per_page=10$/);
  });
  it("accepts nested Laravel pagination and numeric strings", async () => {
    fetchMock().mockResolvedValue(
      json({
        data: {
          data: [record],
          current_page: "2",
          last_page: "3",
          per_page: "5",
          total: "12",
          from: 6,
          to: 10,
        },
      }),
    );
    expect((await backupService.getBackups()).meta).toMatchObject({
      current_page: 2,
      last_page: 3,
      per_page: 5,
      total: 12,
      from: 6,
      to: 10,
    });
  });
  it("accepts top-level meta", async () => {
    fetchMock().mockResolvedValue(
      json({
        data: [],
        meta: { total: 0, current_page: 1, last_page: 1, links: [{ label: "1" }] },
      }),
    );
    expect((await backupService.getBackups()).meta.links).toEqual([{ label: "1" }]);
  });
  it.each([null, {}, { data: {} }, { data: null }])(
    "rejects malformed history %j",
    async (body) => {
      fetchMock().mockResolvedValue(json(body));
      // null currently throws TypeError before the explicit shape guard.
      await expect(backupService.getBackups()).rejects.toThrow();
    },
  );
  it.each([
    [{ performed_by: { nama: "Nama" } }, "Nama"],
    [{ performed_by: { name: "Name" } }, "Name"],
    [{ performed_by: null, user: { nama: "User" } }, "User"],
    [{ performed_by: null, type: "automatic" }, "Sistem"],
    [{ performed_by: null }, "-"],
  ])("maps actor fallback %j", async (overrides, expected) => {
    fetchMock().mockResolvedValue(json({ data: [{ ...record, ...overrides }] }));
    expect((await backupService.getBackups()).backups[0].performedBy).toBe(expected);
  });
  it("maps alternate names, dates, explicit MB and missing size", async () => {
    fetchMock().mockResolvedValue(
      json({
        data: [
          {
            ...record,
            file_name: null,
            filename: "alias.zip",
            backup_date: "custom",
            file_size_mb: 0,
          },
          { ...record, file_name: null, file_size: null },
        ],
      }),
    );
    const { backups } = await backupService.getBackups();
    expect(backups[0]).toMatchObject({ fileName: "alias.zip", backupDate: "custom", fileSize: 0 });
    expect(backups[1]).toMatchObject({ fileName: "Backup #1", fileSize: 0 });
  });
  it.each([
    { file_available: false },
    { file_exists: false },
    { can_download: false },
    { deleted_at: "2026-01-01" },
  ])("marks unavailable file %j", async (flags) => {
    fetchMock().mockResolvedValue(json({ data: [{ ...record, ...flags }] }));
    expect((await backupService.getBackups()).backups[0].fileAvailable).toBe(false);
  });
});

describe("backup service: mutations and failures", () => {
  it.each(["daily", "weekly", "monthly"] as const)(
    "saves %s schedule with relevant day only",
    async (frequency) => {
      await backupService.saveSchedule({ ...schedule, frequency });
      const [url, init] = fetchMock().mock.calls[0];
      expect(String(url)).toContain("/backup-settings");
      expect(init?.method).toBe("PUT");
      expect(new Headers(init?.headers).get("Content-Type")).toBe("application/json");
      expect(JSON.parse(String(init?.body))).toEqual({
        is_active: true,
        frequency,
        backup_time: "02:00",
        ...(frequency === "weekly" ? { day_of_week: 1 } : {}),
        ...(frequency === "monthly" ? { day_of_month: 1 } : {}),
      });
    },
  );
  it.each([true, false])("reads wrapped/unwrapped schedule (%s)", async (wrapped) => {
    fetchMock().mockResolvedValue(json(wrapped ? { data: settings } : settings));
    expect(await backupService.getSchedule()).toEqual(schedule);
  });
  it("defaults missing schedule values and preserves Sunday zero", async () => {
    fetchMock().mockResolvedValue(json({ ...settings, backup_time: null, day_of_week: 0 }));
    expect(await backupService.getSchedule()).toMatchObject({
      time: "02:00",
      dayOfWeek: 0,
      dayOfMonth: 1,
    });
  });
  it("creates and deletes with encoded ID and accepts 204", async () => {
    fetchMock().mockResolvedValue(new Response(null, { status: 204 }));
    await backupService.createBackup();
    await backupService.deleteBackup("a/b ?");
    expect(fetchMock().mock.calls[0][1]?.method).toBe("POST");
    expect(String(fetchMock().mock.calls[1][0])).toContain("/backups/a%2Fb%20%3F");
    expect(fetchMock().mock.calls[1][1]?.method).toBe("DELETE");
  });
  it.each([
    [
      422,
      { errors: { time: ["Invalid time"], day: ["Invalid day"] }, message: "Ignored" },
      "Invalid time Invalid day",
    ],
    [409, { message: "Busy" }, "Busy"],
    [500, {}, "Permintaan backup gagal (500)"],
  ])("reports HTTP %s", async (status, body, message) => {
    fetchMock().mockResolvedValue(json(body, status));
    await expect(backupService.createBackup()).rejects.toMatchObject({ message, status });
  });
  it("handles non-JSON HTTP error", async () => {
    fetchMock().mockResolvedValue(new Response("oops", { status: 503 }));
    await expect(backupService.getSchedule()).rejects.toBeInstanceOf(BackupApiError);
  });
  it("propagates network failure", async () => {
    fetchMock().mockRejectedValue(new TypeError("Offline"));
    await expect(backupService.createBackup()).rejects.toThrow("Offline");
  });
  it.each(["original.zip", "unexpected.sql"])(
    "downloads %s and releases URL after delay",
    async (name) => {
      vi.useFakeTimers();
      const create = vi.fn(() => "blob:test");
      const revoke = vi.fn();
      vi.stubGlobal(
        "URL",
        class extends URL {
          static createObjectURL = create;
          static revokeObjectURL = revoke;
        },
      );
      const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        expect(this.download).toBe(name.endsWith(".zip") ? name : "backup-1.zip");
        expect(this.isConnected).toBe(true);
      });
      fetchMock().mockResolvedValue(new Response("zip bytes"));
      await backupService.downloadBackup("1", name);
      expect(click).toHaveBeenCalledOnce();
      expect(create).toHaveBeenCalledOnce();
      expect(document.querySelector("a")).toBeNull();
      expect(new Headers(fetchMock().mock.calls[0][1]?.headers).get("Accept")).toBe(
        "application/zip",
      );
      expect(revoke).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1000);
      expect(revoke).toHaveBeenCalledWith("blob:test");
    },
  );
});
