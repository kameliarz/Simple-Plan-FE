export interface DesignFile {
  name: string;
  size: string;
  url: string;
}

export interface DesignOfficer {
  id: number;
  name: string;
  role: string;
  initials: string;
}

export type DesignPriority = "Rendah" | "Sedang" | "Tinggi";

export type DesignStatus =
  "Baru" | "Ditugaskan" | "Menunggu Persetujuan" | "Perlu Revisi" | "Selesai" | "Ditolak";

export interface DesignDraft {
  date: string;
  notes: string;
  file: DesignFile | null;
}

export interface GraphicDesignDetail {
  id: string;
  title: string;
  status: DesignStatus;
  priority: DesignPriority | null;
  designType: string;
  description: string;
  requiredDate: string;
  requesterId: number;
  requesterName: string;
  unit: string;
  requestDate: string;
  assignee: DesignOfficer | null;
  referenceFile: DesignFile | null;
  draft: DesignDraft | null;
  rejectionNote: string | null;
  revisionNote: string | null;
}
