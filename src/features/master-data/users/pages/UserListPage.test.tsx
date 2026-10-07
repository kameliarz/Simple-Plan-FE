import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserListPage from "./UserListPage";
import * as userApi from "../services/userApi"; // Import API untuk di-mock

//mocking api
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("../services/userApi", () => ({
  getUsers: jest.fn(),
  getUnits: jest.fn(),
}));

describe("Master Data - UserListPage Testing", () => {
  // Bersihkan mock sebelum tiap test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // LEVEL 1: UNIT TESTING
  // Testing UI
  describe("Level 1: Unit Testing (UI Rendering)", () => {
    it("merender input pencarian dengan benar", async () => {
      // Mock balikan API kosong biar ga eror
      (userApi.getUsers as jest.Mock).mockResolvedValue({ data: [] });
      (userApi.getUnits as jest.Mock).mockResolvedValue({ data: [] });

      render(
        <BrowserRouter>
          <UserListPage />
        </BrowserRouter>,
      );

      // Pastikan ada kotak input untuk search di layar
      const searchInput = screen.getByPlaceholderText("Cari data...");
      expect(searchInput).toBeInTheDocument();
    });
  });

  // Testing  interaksi API Mock + User Action + State React
  describe("Level 2: Integration Testing (Interaksi & API)", () => {
    it("menampilkan data user dari API ke dalam tabel (Mocking API)", async () => {
      // pura-pura API mengembalikan 1 data user "Budi Santoso"
      const mockUsers = [
        {
          id: 1,
          nama: "Budi Santoso",
          unit_user: "IT Support",
          jabatan: "Staff",
          status_user: "Aktif",
        },
      ];

      (userApi.getUsers as jest.Mock).mockResolvedValue({
        data: mockUsers,
        meta: { last_page: 1 },
      });
      (userApi.getUnits as jest.Mock).mockResolvedValue([]);

      // RENDER KOMPONEN
      render(
        <BrowserRouter>
          <UserListPage />
        </BrowserRouter>,
      );

      // ASSERTION: Tunggu sampai nama "Budi Santoso" muncul di layar
      // waitFor digunakan karena fetching API butuh waktu (Asynchronous)
      await waitFor(() => {
        expect(screen.getAllByText(/Budi Santoso/i).length).toBeGreaterThan(0);
      });

      // Pastikan jabatan/unitnya juga ke-render
      expect(screen.getAllByText(/IT Support/i).length).toBeGreaterThan(0);
    });

    it("mengubah nilai input search saat diketik", async () => {
      (userApi.getUsers as jest.Mock).mockResolvedValue({ data: [] });
      (userApi.getUnits as jest.Mock).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <UserListPage />
        </BrowserRouter>,
      );

      // Cari elemen input search
      const searchInput = screen.getByPlaceholderText("Cari data...") as HTMLInputElement;

      // User pura-pura ngetik nama lain
      fireEvent.change(searchInput, { target: { value: "leon" } });

      // value di kotak input berubah jadi "leon"
      expect(searchInput.value).toBe("leon");
    });
  });
});
