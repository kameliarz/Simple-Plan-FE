import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import BackupDataPage from "../pages/BackupDataPage";
import { json, record, settings } from "./fixtures";

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock("@/components/ui/ui-template/UseToast", () => ({ useToast: () => ({ showToast }) }));

let rows: unknown[];
let listStatus: number;
let mutationStatus: number;
let scheduleStatus: number;
beforeEach(() => {
  showToast.mockReset();
  rows = [record];
  listStatus = 200;
  mutationStatus = 200;
  scheduleStatus = 200;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname.endsWith("/backup-settings"))
      return json({ data: settings, message: "Settings unavailable" }, scheduleStatus);
    if (url.pathname.endsWith("/download"))
      return json({ message: "Download failed" }, mutationStatus);
    if (init?.method === "POST" || init?.method === "DELETE") {
      if (init.method === "DELETE" && mutationStatus === 200)
        rows = [{ ...record, file_available: false }];
      return json({ message: "Mutation rejected" }, mutationStatus);
    }
    if (url.pathname.endsWith("/backups"))
      return json(
        {
          data: rows,
          meta: {
            current_page: Number(url.searchParams.get("page")),
            last_page: 2,
            total: 11,
            per_page: 10,
            from: 1,
            to: rows.length,
          },
          message: "History unavailable",
        },
        listStatus,
      );
    throw new Error(`Unexpected API route ${url.pathname}`);
  });
});
async function ready() {
  render(<BackupDataPage />);
  await screen.findByRole("button", { name: "Aksi backup.zip" });
  await waitFor(() => expect(screen.getByRole("button", { name: "Atur Jadwal" })).toBeEnabled());
}
const requests = (method: string) =>
  vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === method);

it("loads history and schedule through real service and renders both layouts", async () => {
  await ready();
  expect(screen.getAllByText("backup.zip")).toHaveLength(2);
  expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  expect(showToast).not.toHaveBeenCalled();
});
it("searches current page case-insensitively without API request", async () => {
  await ready();
  fireEvent.change(screen.getAllByPlaceholderText("Cari di halaman ini...")[0], {
    target: { value: " ADMIN " },
  });
  expect(screen.getByRole("button", { name: "Aksi backup.zip" })).toBeInTheDocument();
  fireEvent.change(screen.getAllByPlaceholderText("Cari di halaman ini...")[0], {
    target: { value: "missing" },
  });
  expect(screen.getByText("Tidak ada data backup")).toBeInTheDocument();
  expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
});
it("changes page then resets page to one for server filter", async () => {
  await ready();
  await userEvent.click(screen.getAllByRole("button", { name: "2" })[0]);
  await waitFor(() =>
    expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("page=2"))).toBe(true),
  );
  await screen.findByRole("button", { name: "Aksi backup.zip" });
  await userEvent.click(screen.getByRole("button", { name: "Semua jenis" }));
  await userEvent.click(screen.getByRole("option", { name: "Manual" }));
  await waitFor(() =>
    expect(
      vi
        .mocked(fetch)
        .mock.calls.some(([url]) => String(url).includes("page=1&per_page=10&type=manual")),
    ).toBe(true),
  );
});
it.each([200, 409, 500])("creates backup with HTTP %s and corresponding toast", async (status) => {
  mutationStatus = status;
  await ready();
  await userEvent.click(screen.getByRole("button", { name: "Back Up" }));
  await userEvent.click(await screen.findByRole("button", { name: "Ya" }));
  await waitFor(() =>
    expect(showToast).toHaveBeenCalledWith(
      status === 200
        ? "Back up masuk antrean. Status akan diperbarui otomatis."
        : status === 409
          ? "Masih ada proses back up atau penghapusan yang berjalan"
          : "Mutation rejected",
      status === 200 ? "success" : status === 409 ? "warning" : "error",
    ),
  );
  expect(requests("POST")).toHaveLength(1);
});
it.each([200, 404, 500])(
  "deletes with HTTP %s, keeps history and reports outcome",
  async (status) => {
    mutationStatus = status;
    await ready();
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    await userEvent.click(await screen.findByRole("button", { name: "Ya" }));
    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        status === 200
          ? "File back up berhasil dihapus!"
          : status === 404
            ? "File back up tidak ditemukan"
            : "Mutation rejected",
        status === 200 ? "success" : "error",
      ),
    );
    expect(requests("DELETE")).toHaveLength(1);
    await screen.findByRole("button", { name: "Aksi backup.zip" });
    if (status === 200) expect(screen.getByRole("button", { name: "Download" })).toBeDisabled();
  },
);
it.each([404, 500])("reports download error %s", async (status) => {
  mutationStatus = status;
  await ready();
  await userEvent.click(screen.getByRole("button", { name: "Download" }));
  await waitFor(() =>
    expect(showToast).toHaveBeenCalledWith(
      status === 404 ? "File back up tidak ditemukan" : "Download failed",
      "error",
    ),
  );
});
it.each(["pending", "processing"])(
  "disables creation when loaded history contains %s",
  async (status) => {
    rows = [{ ...record, status }];
    await ready();
    expect(screen.getByRole("button", { name: "Back Up" })).toBeDisabled();
  },
);
it("shows list failure and empty states", async () => {
  listStatus = 500;
  render(<BackupDataPage />);
  await waitFor(() => expect(showToast).toHaveBeenCalledWith("History unavailable", "error"));
  expect(screen.getByText("Tidak ada data backup")).toBeInTheDocument();
});
it("disables schedule when initial settings request fails", async () => {
  scheduleStatus = 500;
  render(<BackupDataPage />);
  await waitFor(() => expect(showToast).toHaveBeenCalledWith("Settings unavailable", "error"));
  expect(screen.getByRole("button", { name: "Atur Jadwal" })).toBeDisabled();
});
it.each([200, 422])("saves schedule through modal and real service, HTTP %s", async (status) => {
  await ready();
  scheduleStatus = status;
  await userEvent.click(screen.getByRole("button", { name: "Atur Jadwal" }));
  await userEvent.click(await screen.findByRole("button", { name: "Simpan" }));
  await waitFor(() => expect(requests("PUT")).toHaveLength(1));
  await waitFor(() =>
    expect(showToast).toHaveBeenCalledWith(
      status === 200
        ? "Jadwal backup otomatis berhasil disimpan!"
        : "Gagal menyimpan jadwal back up!",
      status === 200 ? "success" : "error",
    ),
  );
  if (status === 422)
    expect(await screen.findByRole("alert")).toHaveTextContent("Settings unavailable");
});
it("polls after ten seconds and aborts outstanding history on unmount", async () => {
  await ready();
  vi.useFakeTimers();
  // Remount with fake timers so the polling interval is controlled.
  const { unmount } = render(<BackupDataPage />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  const before = vi.mocked(fetch).mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(vi.mocked(fetch).mock.calls.length).toBe(before + 1);
  const signal = vi.mocked(fetch).mock.calls.at(-1)?.[1]?.signal;
  unmount();
  expect(signal?.aborted).toBe(true);
  const after = vi.mocked(fetch).mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(vi.mocked(fetch)).toHaveBeenCalledTimes(after);
});
