export type DesignRequestStatus =
  "Baru" | "Ditugaskan" | "Menunggu Persetujuan" | "Perlu Revisi" | "Selesai" | "Ditolak";

export interface DesignRequestItem {
  id: string;
  nomorRequest: string;
  judulRequest: string;
  jenisDesain: string;
  deskripsiKebutuhan: string;
  unit: string;
  namaPemohon: string;
  tanggalDibutuhkan: string;
  tanggalDibutuhkanRaw?: string;
  status: DesignRequestStatus;
  fileReferensiName?: string;
  createdAt?: string;
}

export interface CreateDesignRequestPayload {
  judulRequest: string;
  jenisDesain: string;
  deskripsiKebutuhan: string;
  tanggalDibutuhkan: string;
  fileReferensi?: File | null;
  namaPemohon: string;
  unit: string;
}
