export interface ApiUser {
  id: number;
  nama: string;
  nip: string;
  unit_user: string;
  jabatan: string;
  role: string;
  no_hp: string;
  status_user: "Aktif" | "Nonaktif";
  alasan_nonaktif: string | null;
  riwayat_status_akun: StatusHistory[];
}

export interface StatusHistory {
  status: "Aktif" | "Nonaktif";
  alasan: string;
  tanggal: string;
}

export interface UserCollectionResponse {
  success: boolean;
  message: string;
  data: ApiUser[];
  links: Record<string, unknown>;
  meta: Record<string, unknown>;
}

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: ApiUser;
}

export interface CreateUserPayload {
  nama: string;
  nip: string;
  password?: string; // minimal 8 karakter
  unit_id: number;
  jabatan: string;
  no_hp: string;
  role:
    | "super admin"
    | "koordinator-sarpras"
    | "petugas-tik"
    | "petugas-sarpras"
    | "user"
    | "management";
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface ToggleUserStatusPayload {
  status_user: "Aktif" | "Nonaktif";
  alasan_nonaktif?: "Resign" | "Cuti Panjang" | "Mutasi" | "Lainnya";
}
