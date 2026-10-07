import { render, screen } from "@testing-library/react";
import UserFormModal from "./UserFormModal";

jest.mock("../services/userApi", () => ({
  getUnits: jest.fn().mockResolvedValue([]),
  getRoles: jest.fn().mockResolvedValue([]),
  createUser: jest.fn(),
  updateUser: jest.fn(),
}));

describe("UserFormModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  it("tidak me-render apapun jika isOpen false", () => {
    const { container } = render(
      <UserFormModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("me-render form tambah user jika isOpen true dan tidak ada data awal", () => {
    render(<UserFormModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

    // Biasanya ada teks "Tambah Pengguna Baru" atau "Tambah User"
    // Cek keberadaan salah satu elemen yang pasti ada di form
    // (Bisa disesuaikan dengan teks asli di komponen UserFormModal)
    expect(screen.getByRole("button", { name: /simpan|tambah/i })).toBeInTheDocument();
  });
});
