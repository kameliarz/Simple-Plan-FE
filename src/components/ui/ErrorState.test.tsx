import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "./ErrorState";

describe("Komponen ErrorState", () => {
  it("harus merender default pesan dengan benar", () => {
    render(<ErrorState />);

    expect(screen.getByText("Terjadi Kesalahan")).toBeInTheDocument();
    expect(
      screen.getByText("Gagal memuat data. Silakan coba beberapa saat lagi."),
    ).toBeInTheDocument();
  });

  it("harus merender title dan description custom sesuai props", () => {
    render(
      <ErrorState title="Internet Terputus" description="Pastikan koneksi internet Anda stabil." />,
    );

    expect(screen.getByText("Internet Terputus")).toBeInTheDocument();
    expect(screen.getByText("Pastikan koneksi internet Anda stabil.")).toBeInTheDocument();
  });

  it('tidak boleh merender tombol "Coba Lagi" jika onRetry tidak dikirim', () => {
    render(<ErrorState />);

    const retryButton = screen.queryByRole("button", { name: /coba lagi/i });
    expect(retryButton).not.toBeInTheDocument();
  });

  it('harus merender tombol "Coba Lagi" dan memanggil onRetry ketika diklik', () => {
    const mockOnRetry = jest.fn(); // Membuat fungsi tiruan

    render(<ErrorState onRetry={mockOnRetry} />);

    const retryButton = screen.getByRole("button", { name: /coba lagi/i });
    expect(retryButton).toBeInTheDocument();

    // Simulasikan user klik tombol
    fireEvent.click(retryButton);

    // Cek apakah fungsinya dipanggil sekali
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
});
