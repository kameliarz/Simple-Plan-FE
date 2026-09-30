import { useState, useEffect } from "react";
import { Search, Plus, Folder, SlidersHorizontal, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers, getUnits, type GetUsersParams } from "../services/userApi";
import type { ApiUser } from "../types/user";
import UserFormModal from "../components/UserFormModal";
import UserSuccessModal from "../components/UserSuccessModal";
import UserCardMobile from "../components/UserCardMobile";
import UserFilterBottomSheet from "../components/UserFilterBottomSheet";
import type { ApiMeta } from "@/types/api";

export default function UserListPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [units, setUnits] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<ApiMeta | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const fetchUserList = async () => {
    setIsLoading(true);
    try {
      const params: GetUsersParams = {
        page: currentPage,
      };

      if (searchQuery) params["filter[search]"] = searchQuery;
      if (unitFilter) params["filter[unit_id]"] = unitFilter;
      // Note: If backend supports status filter, we can add it here.
      // if (statusFilter) params["filter[status_user]"] = statusFilter;

      const result = await getUsers(params);

      if (result.data) {
        // Handle both possible structures: flat array or nested inside Resource Collection
        const responseData = result as unknown as { data: { data: ApiUser[]; meta: ApiMeta } };
        const dataArr = Array.isArray(result.data) ? result.data : responseData.data.data;
        const metaObj = Array.isArray(result.data) ? result.meta : responseData.data.meta;

        let filtered = dataArr || [];
        // Fallback frontend filtering for status if API doesn't handle it
        if (statusFilter) {
          filtered = filtered.filter((u: ApiUser) => u.status_user === statusFilter);
        }

        setUsers(filtered);
        if (metaObj) {
          setMeta(metaObj as unknown as ApiMeta);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, unitFilter, statusFilter]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const unitsData = await getUnits();
        setUnits(unitsData);
      } catch (error) {
        console.error("Gagal memuat filter units", error);
      }
    };
    fetchDropdowns();
  }, []);

  return (
    <div className="flex h-full flex-col bg-slate-50 md:bg-gray-50/50">
      <div className="px-4 py-4 md:px-8 md:py-6 flex-1 flex flex-col h-full">
        {/* === HEADER DESKTOP === */}
        <div className="mb-6 hidden items-center justify-between md:flex">
          <h1 className="text-xl font-bold text-gray-800">Daftar Pengguna Sistem</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
          >
            <Plus className="h-4 w-4" />
            Tambah User
          </button>
        </div>

        {/* === CONTROLS MOBILE === */}
        <div className="flex items-center gap-2 mb-4 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama ....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilterSheet(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 bg-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#113a77] px-3 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>

        {/* === LIST MOBILE === */}
        <div className="flex-1 md:hidden space-y-3">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">Memuat data pengguna...</div>
          ) : users.length > 0 ? (
            <>
              {users.map((user) => (
                <UserCardMobile
                  key={user.id}
                  user={user}
                  onClick={() => navigate(`/master-data/users/${user.id}`)}
                />
              ))}
              {/* Simple Pagination Mobile */}
              {meta && meta.last_page > 1 && (
                <div className="flex justify-center items-center gap-4 py-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={meta.current_page <= 1}
                    className="px-3 py-1 text-sm bg-white border rounded-lg disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-slate-500">
                    {meta.current_page} / {meta.last_page}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={meta.current_page >= meta.last_page}
                    className="px-3 py-1 text-sm bg-white border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Info className="h-5 w-5" />
                <span className="text-[15px]">User tidak ditemukan!</span>
              </div>
            </div>
          )}
        </div>

        {/* === VIEW DESKTOP === */}
        <div className="hidden md:block rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <select
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value ? Number(e.target.value) : "");
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
              >
                <option value="">Semua Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Cari data..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-slate-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">NAMA</th>
                  <th className="px-6 py-4 font-bold">UNIT</th>
                  <th className="px-6 py-4 font-bold">JABATAN</th>
                  <th className="px-6 py-4 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-gray-500">
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => {
                    const initials = user.nama.substring(0, 2).toUpperCase();
                    const isAktif = user.status_user === "Aktif";
                    return (
                      <tr
                        key={user.id}
                        className="group cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => navigate(`/master-data/users/${user.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">
                              {initials}
                            </div>
                            <span className="font-medium text-gray-900 group-hover:text-blue-700">
                              {user.nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{user.unit_user}</td>
                        <td className="px-6 py-4">{user.jabatan}</td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                              isAktif
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                          >
                            {isAktif ? "Aktif" : "Nonaktif"}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 border border-gray-100">
                        <Folder className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">User tidak ditemukan</h3>
                      <p className="text-xs text-gray-500">
                        {searchQuery
                          ? `Pencarian untuk "${searchQuery}" tidak membuahkan hasil.`
                          : "Belum ada data pengguna."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between border-t border-gray-100 px-6 py-4 md:flex-row">
            <p className="text-xs text-gray-500">
              Menampilkan {meta?.from || 0}-{meta?.to || 0} dari{" "}
              <span className="font-semibold">{meta?.total || 0}</span> pengguna
            </p>
            <div className="flex items-center gap-1 mt-3 md:mt-0">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!meta || meta.current_page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                &lt;
              </button>
              {meta &&
                (function () {
                  const start = Math.max(1, meta.current_page - 2);
                  const end = Math.min(meta.last_page, start + 4);
                  const adjustedStart = Math.max(1, Math.min(start, end - 4));
                  const pages = Array.from(
                    { length: end - adjustedStart + 1 },
                    (_, i) => adjustedStart + i,
                  );
                  return pages.map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
                        currentPage === page
                          ? "bg-blue-950 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              <button
                onClick={() => setCurrentPage((p) => Math.min(meta?.last_page || 1, p + 1))}
                disabled={!meta || meta.current_page >= meta.last_page}
                className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <UserFilterBottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        units={units}
        currentUnitFilter={unitFilter}
        currentStatusFilter={statusFilter}
        onApply={(unitId, status) => {
          setUnitFilter(unitId);
          setStatusFilter(status);
          setCurrentPage(1);
        }}
      />

      {showAddModal && (
        <UserFormModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            setShowSuccessModal(true);
            fetchUserList();
          }}
        />
      )}

      {showSuccessModal && (
        <UserSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Berhasil Ditambahkan!"
          message="Data user berhasil ditambahkan"
        />
      )}
    </div>
  );
}
