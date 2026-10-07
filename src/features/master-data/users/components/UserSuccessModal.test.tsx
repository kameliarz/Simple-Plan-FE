import { render, screen, fireEvent } from "@testing-library/react";
import UserSuccessModal from "./UserSuccessModal";

describe("UserSuccessModal Component", () => {
  const mockOnClose = jest.fn();

  it("tidak me-render apapun jika isOpen false", () => {
    const { container } = render(
      <UserSuccessModal
        isOpen={false}
        onClose={mockOnClose}
        title="Sukses"
        message="Data berhasil disimpan"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("me-render title dan message jika isOpen true", () => {
    render(
      <UserSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        title="Berhasil!"
        message="Data user telah ditambahkan."
      />,
    );

    expect(screen.getByText("Berhasil!")).toBeInTheDocument();
    expect(screen.getByText("Data user telah ditambahkan.")).toBeInTheDocument();
  });

  it("memanggil function onClose saat tombol X (close) diklik", () => {
    render(<UserSuccessModal isOpen={true} onClose={mockOnClose} title="Sukses" message="Pesan" />);

    // Cari tombol (elemen button)
    const closeBtn = screen.getByRole("button");
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
