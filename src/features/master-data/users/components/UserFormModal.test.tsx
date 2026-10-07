import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserFormModal from "./UserFormModal";
import * as userApi from "../services/userApi";

// Mocking API
// palsukan fungsinya backend
jest.mock("../services/userApi", () => ({
  getUnits: jest.fn(),
  getRoles: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
}));

describe("Komponen UserFormModal (Level 2)", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    // bersihkan memori tiruan API
    jest.clearAllMocks();

    // getUnits dan getRoles selalu mengembalikan array kosong biar nggak error
    (userApi.getUnits as jest.Mock).mockResolvedValue([]);
    (userApi.getRoles as jest.Mock).mockResolvedValue([]);
  });

  it("harus memunculkan error validasi jika tombol Simpan diklik tapi form kosong", async () => {
    render(<UserFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Cari tombol Simpan
    const simpanButton = screen.getByRole("button", { name: "Simpan" });

    // Simulasi klik tombol Simpan kosongan (tanpa diisi)
    fireEvent.click(simpanButton);

    // memastikan tulisan error dari validasi form muncul di layar
    await waitFor(() => {
      expect(screen.getByText("Nama lengkap wajib diisi!")).toBeInTheDocument();
      expect(screen.getByText("NIP wajib diisi!")).toBeInTheDocument();
      expect(screen.getByText("Password wajib diisi!")).toBeInTheDocument();
      expect(screen.getByText("Unit wajib dipilih!")).toBeInTheDocument();
      expect(screen.getByText("Jabatan wajib diisi!")).toBeInTheDocument();
      expect(screen.getByText("Nomor HP wajib diisi!")).toBeInTheDocument();
    });

    expect(userApi.createUser).not.toHaveBeenCalled();
  });

  it("bisa mengetik di input Nama", () => {
    render(<UserFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Cari input berdasarkan placeholder-nya
    const inputNama = screen.getByPlaceholderText("Contoh: dr. Budi Santoso, Sp.PD");

    // Simulasi
    fireEvent.change(inputNama, { target: { value: "Joko" } });

    // Pastikan nilai berubah
    expect(inputNama).toHaveValue("Joko");
  });
});
