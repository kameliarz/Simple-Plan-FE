import { useState, useEffect } from "react";
import { Search, Plus, Folder, SlidersHorizontal, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUsers, getUnits, type GetUsersParams } from "../services/userApi";
import type { ApiUser } from "../types/user";
import UserFormModal from "../components/UserFormModal";
import UserSuccessModal from "../components/UserSuccessModal";
import UserCardMobile from "../components/UserCardMobile";
import UserFilterBottomSheet from "../components/UserFilterBottomSheet";
import Table from "@/components/ui/ui-template/Table";
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
    <div className="flex h-full flex-col bg-background text-text">
      <div className="px-4 py-4 md:px-8 md:py-6 flex-1 flex flex-col h-full">
        {/* === HEADER DESKTOP === */}
        <div className="mb-6 hidden items-center justify-between md:flex">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Daftar Pengguna Sistem
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#003178] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#00255c] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </button>
        </div>

        {/* === CONTROLS MOBILE === */}
        <div className="flex items-center gap-2 mb-4 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama ....."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
          <button
            onClick={() => setShowFilterSheet(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#003178] px-3 text-sm font-medium text-white hover:bg-[#00255c] transition"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </div>

        {/* === LIST MOBILE === */}
        <div className="flex-1 md:hidden space-y-3">
          {isLoading ? (
            <div className="py-10 text-center text-sm text-text-secondary">
              Memuat data pengguna...
            </div>
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
                    className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-text-secondary">
                    {meta.current_page} / {meta.last_page}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(meta.last_page, p + 1))}
                    disabled={meta.current_page >= meta.last_page}
                    className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <div className="flex items-center gap-2 text-slate-400">
                <Info className="h-5 w-5" />
                <span className="text-[15px]">User tidak ditemukan!</span>
              </div>
            </div>
          )}
        </div>

        {/* === VIEW DESKTOP === */}
        <div className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-700 bg-table-card overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-700 p-4 md:flex-row md:items-center md:justify-between bg-table-card">
            <div className="flex items-center gap-3">
              <select
                value={unitFilter}
                onChange={(e) => {
                  setUnitFilter(e.target.value ? Number(e.target.value) : "");
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
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
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
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
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 placeholder-slate-400"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Table>
            <Table.Thead>
              <tr>
                <Table.Th>NAMA</Table.Th>
                <Table.Th>UNIT</Table.Th>
                <Table.Th>JABATAN</Table.Th>
                <Table.Th>STATUS</Table.Th>
              </tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-text-secondary">
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
                      className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                      onClick={() => navigate(`/master-data/users/${user.id}`)}
                    >
                      <Table.Td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900 dark:bg-blue-900/40 dark:text-blue-300">
                            {initials}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user.nama}
                          </span>
                        </div>
                      </Table.Td>
                      <Table.Td>{user.unit_user}</Table.Td>
                      <Table.Td>{user.jabatan}</Table.Td>
                      <Table.Td>
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                            isAktif
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
                          }`}
                        >
                          {isAktif ? "Aktif" : "Nonaktif"}
                        </div>
                      </Table.Td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <Folder className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
                      User tidak ditemukan
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {searchQuery
                        ? `Pencarian untuk "${searchQuery}" tidak membuahkan hasil.`
                        : "Belum ada data pengguna."}
                    </p>
                  </td>
                </tr>
              )}
            </Table.Tbody>
          </Table>

          <div className="flex flex-col items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-table-card px-6 py-4 md:flex-row">
            <p className="text-xs text-text-secondary">
              Menampilkan {meta?.from || 0}-{meta?.to || 0} dari{" "}
              <span className="font-semibold">{meta?.total || 0}</span> pengguna
            </p>
            <div className="flex items-center gap-1 mt-3 md:mt-0">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!meta || meta.current_page <= 1}
                className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                &lt;
              </button>
              {meta &&
                (function () {
                  const start = Math.max(1, meta.current_page - 2);
                  const end = Math.min(meta.last_page, start + 4);
                  const adjustedStart = Math.max(1, Math.min(start, end - 4));
                  const pages = Array.from(
                    { length: Math.max(1, end - adjustedStart + 1) },
                    (_, i) => adjustedStart + i,
                  );
                  return pages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition cursor-pointer ${
                        currentPage === page
                          ? "bg-blue-900 text-white"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ));
                })()}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(meta?.last_page || 1, p + 1))}
                disabled={!meta || meta.current_page >= meta.last_page}
                className="flex h-7 w-7 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
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
