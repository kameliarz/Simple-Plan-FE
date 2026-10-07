import { render, screen, fireEvent } from "@testing-library/react";
import UserSuccessModal from "./UserSuccessModal";

describe("Komponen UserSuccessModal", () => {
  // Test komponen tidak muncul saat isOpen false
  it("tidak boleh merender modal jika isOpen adalah false", () => {
    const mockOnClose = jest.fn();

    render(
      <UserSuccessModal
        isOpen={false}
        onClose={mockOnClose}
        title="Berhasil"
        message="Data user berhasil disimpan"
      />,
    );

    // Karena return null kalau false, maka teks "Berhasil" tidak boleh ada di layar
    expect(screen.queryByText("Berhasil")).not.toBeInTheDocument();
  });

  // Test komponen muncul dan teks sesuai props saat isOpen true
  it("harus merender modal dengan title dan message yang benar jika isOpen adalah true", () => {
    const mockOnClose = jest.fn();

    render(
      <UserSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        title="Sukses Hapus"
        message="User Andi berhasil dihapus."
      />,
    );

    // Pastikan title dan message muncul
    expect(screen.getByText("Sukses Hapus")).toBeInTheDocument();
    expect(screen.getByText("User Andi berhasil dihapus.")).toBeInTheDocument();
  });

  // Test interaksi tombol Close (X) memanggil fungsi onClose
  it("harus memanggil onClose ketika tombol X diklik", () => {
    const mockOnClose = jest.fn(); // Bikin fungsi bohongan

    render(
      <UserSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        title="Berhasil"
        message="Simpan data sukses"
      />,
    );

    // Tombol X biasanya dirender sebagai button
    const closeButton = screen.getByRole("button");

    // Simulasik klik
    fireEvent.click(closeButton);

    // Pastikan fungsi onClose dipanggil 1 kali
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
