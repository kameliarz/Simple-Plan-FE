import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import BackupScheduleModal from "../components/BackupScheduleModal";
import { schedule } from "./fixtures";

function mount(overrides = {}, save = vi.fn().mockResolvedValue(undefined)) {
  const anchorRef = createRef<HTMLDivElement>();
  const close = vi.fn();
  render(
    <>
      <div ref={anchorRef} />
      <BackupScheduleModal
        show
        schedule={{ ...schedule, ...overrides }}
        anchorRef={anchorRef}
        onSave={save}
        onClose={close}
      />
    </>,
  );
  return { save, close };
}
async function choose(trigger: string, option: string) {
  await userEvent.click(await screen.findByRole("button", { name: trigger }));
  // jsdom has no Tailwind stylesheet: both responsive menus are in the DOM.
  await userEvent.click(screen.getAllByRole("option", { name: option })[0]);
}

it("saves existing daily schedule and closes on success", async () => {
  const { save, close } = mount();
  await userEvent.click(await screen.findByRole("button", { name: "Simpan" }));
  await waitFor(() => expect(save).toHaveBeenCalledWith(schedule));
  expect(close).toHaveBeenCalledOnce();
});
it.each([
  ["Setiap Minggu", "Hari wajib diisi!"],
  ["Setiap Bulan", "Tanggal wajib diisi!"],
])("validates missing day after switching to %s", async (frequency, error) => {
  const { save } = mount();
  await choose("Setiap Hari", frequency);
  await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
  expect(screen.getByText(error)).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});
it.each([
  ["Setiap Minggu", "Pilih hari", "Minggu", "weekly", 7],
  ["Setiap Bulan", "Pilih tanggal", "28", "monthly", 28],
] as const)("saves valid %s schedule", async (frequency, trigger, option, value, day) => {
  const { save } = mount();
  await choose("Setiap Hari", frequency);
  await choose(trigger, option);
  await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({
      frequency: value,
      [value === "weekly" ? "dayOfWeek" : "dayOfMonth"]: day,
    }),
  );
});
it("allows inactive weekly schedule without selected day", async () => {
  const { save } = mount({ enabled: false });
  await choose("Setiap Hari", "Setiap Minggu");
  await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
  expect(save).toHaveBeenCalledWith({ ...schedule, enabled: false, frequency: "weekly" });
});
it("requires time even when inactive", async () => {
  const { save } = mount({ enabled: false, time: "" });
  await userEvent.click(await screen.findByRole("button", { name: "Simpan" }));
  expect(screen.getByText("Jam wajib diisi!")).toBeInTheDocument();
  expect(save).not.toHaveBeenCalled();
});
it("preserves non-hour API time", async () => {
  const { save } = mount({ time: "02:30" });
  expect(await screen.findByRole("button", { name: "02:30" })).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
  expect(save).toHaveBeenCalledWith({ ...schedule, time: "02:30" });
});
it("shows save error, stays open and permits retry", async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error("Schedule rejected"))
    .mockResolvedValueOnce(undefined);
  const { close } = mount({}, save);
  await userEvent.click(await screen.findByRole("button", { name: "Simpan" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Schedule rejected");
  expect(close).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
it("blocks duplicate submits and Escape while saving", async () => {
  let resolve!: () => void;
  const save = vi.fn(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  const { close } = mount({}, save);
  await userEvent.click(await screen.findByRole("button", { name: "Simpan" }));
  expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Batal" })).toBeDisabled();
  fireEvent.keyDown(document, { key: "Escape" });
  fireEvent.submit(document.querySelector("form")!);
  expect(save).toHaveBeenCalledOnce();
  expect(close).not.toHaveBeenCalled();
  resolve();
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
it("closes on Escape when idle", async () => {
  const { close } = mount();
  await screen.findByRole("button", { name: "Simpan" });
  fireEvent.keyDown(document, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
});
