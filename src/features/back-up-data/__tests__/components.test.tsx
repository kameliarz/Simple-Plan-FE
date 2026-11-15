import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BackupActionMenu from "../components/BackupActionMenu";
import BackupCardMobile from "../components/BackupCardMobile";
import BackupMobileList from "../components/BackupMobileList";
import BackupStatusBadge from "../components/BackupStatusBadge";
import BackupTable from "../components/BackupTable";
import BackupTablePagination from "../components/BackupTablePagination";
import BackupConfirmModal from "../components/BackupConfirmModal";
import BackupDeleteModal from "../components/BackupDeleteModal";
import BackupFilterMobile from "../components/BackupFilterMobile";
import { backup, filters } from "./fixtures";

describe("badges and lists", () => {
  it.each([
    ["pending", "Menunggu"],
    ["processing", "Diproses"],
    ["success", "Berhasil"],
    ["failed", "Gagal"],
  ] as const)("renders %s", (status, label) => {
    render(<BackupStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it.each([
    ["automatic", "Otomatis"],
    ["manual", "Manual"],
  ] as const)("renders type %s", (type, label) => {
    render(<BackupStatusBadge type={type} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it("renders no badge without props", () => {
    expect(render(<BackupStatusBadge />).container).toBeEmptyDOMElement();
  });
  it("renders desktop and mobile empty states", () => {
    render(
      <>
        <BackupTable backups={[]} onDownload={vi.fn()} onDelete={vi.fn()} />
        <BackupMobileList backups={[]} onDownload={vi.fn()} onDelete={vi.fn()} />
      </>,
    );
    expect(screen.getByText("Tidak ada data backup")).toBeInTheDocument();
    expect(screen.getByText("Data back up tidak ditemukan!")).toBeInTheDocument();
  });
  it("renders mobile list, Jakarta date and localized file size", () => {
    render(<BackupMobileList backups={[backup]} onDownload={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("backup.zip")).toBeInTheDocument();
    expect(screen.getByText(/07:00 WIB/)).toBeInTheDocument();
    expect(screen.getByText("1,5 MB")).toBeInTheDocument();
  });
  it("mobile card tolerates invalid date", () => {
    render(
      <BackupCardMobile
        backup={{ ...backup, backupDate: "bad-date" }}
        onDownload={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });
  it("BUG: desktop table crashes for the same invalid date", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <BackupTable
          backups={[{ ...backup, backupDate: "bad-date" }]}
          onDownload={vi.fn()}
          onDelete={vi.fn()}
        />,
      ),
    ).toThrow(RangeError);
  });
  it.each(["pending", "processing", "failed", "missing"])(
    "disables mobile actions for %s",
    async (state) => {
      const action = vi.fn();
      render(
        <BackupCardMobile
          backup={{
            ...backup,
            ...(state === "missing"
              ? { fileAvailable: false }
              : { status: state as "pending" | "processing" | "failed" }),
          }}
          onDownload={action}
          onDelete={action}
        />,
      );
      for (const button of screen.getAllByRole("button")) {
        expect(button).toBeDisabled();
        await userEvent.click(button);
      }
      expect(action).not.toHaveBeenCalled();
    },
  );
  it("passes backup to mobile actions", async () => {
    const download = vi.fn();
    const remove = vi.fn();
    render(<BackupCardMobile backup={backup} onDownload={download} onDelete={remove} />);
    await userEvent.click(screen.getByRole("button", { name: "Download" }));
    await userEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(download).toHaveBeenCalledWith(backup);
    expect(remove).toHaveBeenCalledWith(backup);
  });
});

describe("desktop action menu", () => {
  it.each(["Download", "Hapus"])("invokes %s and closes portal", async (label) => {
    const download = vi.fn();
    const remove = vi.fn();
    render(<BackupActionMenu backup={backup} onDownload={download} onDelete={remove} />);
    const trigger = screen.getByRole("button", { name: "Aksi backup.zip" });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("menuitem", { name: label }));
    expect(label === "Download" ? download : remove).toHaveBeenCalledWith(backup);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
  it.each(["pending", "processing", "failed", "missing"])(
    "blocks menu actions for %s",
    async (state) => {
      render(
        <BackupActionMenu
          backup={{
            ...backup,
            ...(state === "missing"
              ? { fileAvailable: false }
              : { status: state as "pending" | "processing" | "failed" }),
          }}
          onDownload={vi.fn()}
          onDelete={vi.fn()}
        />,
      );
      await userEvent.click(screen.getByRole("button"));
      screen.getAllByRole("menuitem").forEach((item) => expect(item).toBeDisabled());
    },
  );
  it.each(["escape", "outside", "scroll"])("closes on %s", async (event) => {
    render(<BackupActionMenu backup={backup} onDownload={vi.fn()} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button"));
    if (event === "escape") fireEvent.keyDown(document, { key: "Escape" });
    if (event === "outside") fireEvent.pointerDown(document.body);
    if (event === "scroll") fireEvent.scroll(window);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("confirmation modals and pagination", () => {
  it("hides closed confirmation", () => {
    render(<BackupConfirmModal show={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByText("Back Up Sekarang?")).not.toBeInTheDocument();
  });
  it("confirms and cancels backup", async () => {
    const confirm = vi.fn();
    const close = vi.fn();
    render(<BackupConfirmModal show onClose={close} onConfirm={confirm} />);
    await userEvent.click(await screen.findByRole("button", { name: "Ya" }));
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });
  it("locks backup buttons during request", async () => {
    render(<BackupConfirmModal show isLoading onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(await screen.findByRole("button", { name: "Memproses..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Batal" })).toBeDisabled();
  });
  it("disables delete confirmation without target", async () => {
    render(<BackupDeleteModal show backup={null} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(await screen.findByRole("button", { name: "Ya" })).toBeDisabled();
  });
  it("shows target, confirms deletion and handles invalid date", async () => {
    const confirm = vi.fn();
    render(
      <BackupDeleteModal
        show
        backup={{ ...backup, backupDate: "bad" }}
        onClose={vi.fn()}
        onConfirm={confirm}
      />,
    );
    expect(await screen.findByText(/File ZIP - \(backup.zip\)/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ya" }));
    expect(confirm).toHaveBeenCalledOnce();
  });
  it("renders nothing for null pagination", () => {
    expect(
      render(<BackupTablePagination meta={null} onPageChange={vi.fn()} />).container,
    ).toBeEmptyDOMElement();
  });
  it("renders zero entries and disabled navigation", () => {
    render(
      <BackupTablePagination
        meta={{
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 10,
          from: null,
          to: null,
          path: "",
          links: [],
        }}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText("Showing 0 to 0 of 0 entries")).toBeInTheDocument();
    expect(screen.getByLabelText("Halaman berikutnya")).toBeDisabled();
    expect(screen.getByLabelText("Halaman sebelumnya")).toBeDisabled();
  });
});

describe("mobile filters", () => {
  it("BUG: clicking selected status again does not toggle it back to all", async () => {
    const apply = vi.fn();
    render(<BackupFilterMobile show filters={filters} onApply={apply} onClose={vi.fn()} />);
    await userEvent.click(screen.getByText("Berhasil"));
    await userEvent.click(screen.getByText("Berhasil"));
    await userEvent.click(screen.getByRole("button", { name: "Terapkan" }));
    // Characterizes the bug: checked native radio never fires a second onChange.
    expect(apply).toHaveBeenCalledWith({ ...filters, status: "success" });
  });
  it("keeps edits as draft until apply", async () => {
    const apply = vi.fn();
    const close = vi.fn();
    render(<BackupFilterMobile show filters={filters} onApply={apply} onClose={close} />);
    await userEvent.click(screen.getByText("Berhasil"));
    expect(apply).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Terapkan" }));
    expect(apply).toHaveBeenCalledWith({ ...filters, status: "success" });
    expect(close).toHaveBeenCalledOnce();
  });
  it("resets filters while preserving local search", async () => {
    const apply = vi.fn();
    render(
      <BackupFilterMobile
        show
        filters={{
          ...filters,
          search: "Admin",
          type: "manual",
          status: "failed",
          startDate: "2026-01-01",
        }}
        onApply={apply}
        onClose={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(apply).toHaveBeenCalledWith({ ...filters, search: "Admin" });
  });
  it("closes on Escape, discards draft and restores body overflow on unmount", () => {
    document.body.style.overflow = "auto";
    const close = vi.fn();
    const apply = vi.fn();
    const { unmount } = render(
      <BackupFilterMobile show filters={filters} onApply={apply} onClose={close} />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(close).toHaveBeenCalledOnce();
    expect(apply).not.toHaveBeenCalled();
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});
