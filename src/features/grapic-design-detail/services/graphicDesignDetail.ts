import type {
  DesignOfficer,
  DesignPriority,
  GraphicDesignDetail,
} from "../types/graphicDesignDetail.types";

// ==========================================
// MOCK DATA
// ==========================================

const mockDesignDetails: Record<string, GraphicDesignDetail> = {
  "DG-2026-0007": {
    id: "DG-2026-0007",
    title: "Poster Hari Kesehatan Nasional",
    status: "Baru",
    priority: null,
    designType: "Poster",
    description:
      "Membutuhkan poster edukasi untuk peringatan Hari Kesehatan Nasional yang akan dipasang di lobi dan area rawat jalan. Ukuran A3 potret, memuat logo RS Citra Husada, tema kegiatan, tanggal, dan ajakan hidup sehat. Warna dominan biru dan putih mengikuti identitas rumah sakit.",
    requiredDate: "05/11/2026",
    requesterName: "Agung Sunaryo S.Kom",
    unit: "IT",
    requestDate: "01/11/2026",
    assignee: null,
    referenceFile: {
      name: "referensi.jpg",
      size: "920 KB",
      url: "/files/referensi.jpg",
    },
    draft: null,
    rejectionNote: null,
    requesterId: 53,
    revisionNote: null,
  },
};

// ==========================================
// MOCK OFFICERS
// ==========================================

const mockOfficers: DesignOfficer[] = [
  {
    id: 1,
    name: "Hendra Wijaya",
    role: "IT Support - SIMRS",
    initials: "HW",
  },
  {
    id: 2,
    name: "Rian Pratama",
    role: "Teknisi Lapangan",
    initials: "RP",
  },
  {
    id: 3,
    name: "Siti Aisyah",
    role: "IT Helpdesk",
    initials: "SA",
  },
  {
    id: 54,
    name: "Haris Arifin, S.Kom",
    role: "IT Support - Hardware",
    initials: "AF",
  },
];

// ==========================================
// STORAGE CONFIGURATION
// ==========================================

const STORAGE_PREFIX = "graphic-design-detail:";

const DRAFT_DB_NAME = "graphic-design-drafts";
const DRAFT_STORE_NAME = "draft-files";

const MAX_DRAFT_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================

const storageKey = (id: string): string => {
  return `${STORAGE_PREFIX}${id}`;
};

function readDesign(id: string): GraphicDesignDetail {
  const initial = mockDesignDetails[id];

  if (!initial) {
    throw new Error("Data request desain tidak ditemukan.");
  }

  const saved = localStorage.getItem(storageKey(id));

  if (saved) {
    try {
      const parsed: GraphicDesignDetail = JSON.parse(saved);

      if (parsed.id === id) {
        return parsed;
      }
    } catch {
      // Gunakan mock data awal jika data lokal rusak.
    }
  }

  return structuredClone(initial);
}

function writeDesign(detail: GraphicDesignDetail): void {
  localStorage.setItem(storageKey(detail.id), JSON.stringify(detail));
}

// ==========================================
// INDEXED DB HELPERS
// ==========================================

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DRAFT_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        db.createObjectStore(DRAFT_STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error("Gagal membuka penyimpanan draft."));
    };

    request.onblocked = () => {
      reject(new Error("Penyimpanan draft sedang digunakan oleh halaman lain."));
    };
  });
}

// ==========================================
// SAVE DRAFT FILE
// ==========================================

async function saveDraftFile(designId: string, file: File): Promise<void> {
  const db = await openDraftDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DRAFT_STORE_NAME, "readwrite");

      const store = transaction.objectStore(DRAFT_STORE_NAME);

      store.put(file, designId);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error("Gagal menyimpan file draft."));
      };

      transaction.onabort = () => {
        reject(new Error("Penyimpanan draft dibatalkan."));
      };
    });
  } finally {
    db.close();
  }
}

// ==========================================
// LOAD DRAFT FILE
// ==========================================

async function loadDraftFile(designId: string): Promise<Blob | null> {
  const db = await openDraftDatabase();

  try {
    return await new Promise<Blob | null>((resolve, reject) => {
      const transaction = db.transaction(DRAFT_STORE_NAME, "readonly");

      const store = transaction.objectStore(DRAFT_STORE_NAME);

      const request = store.get(designId);

      request.onsuccess = () => {
        resolve((request.result as Blob | undefined) ?? null);
      };

      request.onerror = () => {
        reject(new Error("Gagal membaca file draft."));
      };
    });
  } finally {
    db.close();
  }
}

// ==========================================
// DELETE DRAFT FILE
// ==========================================

async function deleteDraftFile(designId: string): Promise<void> {
  const db = await openDraftDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(DRAFT_STORE_NAME, "readwrite");

      transaction.objectStore(DRAFT_STORE_NAME).delete(designId);

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(new Error("Gagal menghapus file draft."));
      };

      transaction.onabort = () => {
        reject(new Error("Penghapusan file draft dibatalkan."));
      };
    });
  } finally {
    db.close();
  }
}

// ==========================================
// FORMAT FILE SIZE
// ==========================================

function formatDraftFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDraftDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

// ==========================================
// VALIDATE DRAFT FILE
// ==========================================

function validateDraftFile(file: File): void {
  if (!file || file.size === 0) {
    throw new Error("File draft wajib diunggah!");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error("Format file tidak didukung. Gunakan PDF, JPG, atau PNG.");
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("Format file draft tidak didukung.");
  }

  if (file.size > MAX_DRAFT_SIZE) {
    throw new Error("Ukuran file draft maksimal 5MB.");
  }
}

// ==========================================
// GET DETAIL REQUEST
// ==========================================

export async function getGraphicDesignDetail(id: string): Promise<GraphicDesignDetail> {
  const detail = readDesign(id);

  if (!detail.draft?.file) {
    return detail;
  }

  const storedFile = await loadDraftFile(id);

  if (!storedFile) {
    return {
      ...detail,
      draft: {
        ...detail.draft,
        file: {
          ...detail.draft.file,
          url: "",
        },
      },
    };
  }

  return {
    ...detail,
    draft: {
      ...detail.draft,
      file: {
        ...detail.draft.file,
        url: URL.createObjectURL(storedFile),
      },
    },
  };
}

// ==========================================
// GET OFFICER OPTIONS
// ==========================================

export async function getDesignOfficerOptions(search = ""): Promise<DesignOfficer[]> {
  const keyword = search.trim().toLowerCase();

  return mockOfficers.filter((officer) => {
    const matchName = officer.name.toLowerCase().includes(keyword);

    const matchRole = officer.role.toLowerCase().includes(keyword);

    return matchName || matchRole;
  });
}

// ==========================================
// ASSIGN REQUEST
// ==========================================

export async function assignGraphicDesign(
  id: string,
  payload: {
    priority: DesignPriority;
    officerId: number;
  },
): Promise<GraphicDesignDetail> {
  const detail = readDesign(id);

  if (detail.status !== "Baru") {
    throw new Error("Request ini tidak dapat ditugaskan.");
  }

  const allowedPriorities: DesignPriority[] = ["Rendah", "Sedang", "Tinggi"];

  if (!allowedPriorities.includes(payload.priority)) {
    throw new Error("Prioritas tidak valid.");
  }

  const officer = mockOfficers.find((item) => item.id === payload.officerId);

  if (!officer) {
    throw new Error("Petugas tidak ditemukan.");
  }

  const updated: GraphicDesignDetail = {
    ...detail,
    status: "Ditugaskan",
    priority: payload.priority,
    assignee: officer,
    draft: null,
    rejectionNote: null,
  };

  writeDesign(updated);

  return updated;
}

// ==========================================
// REJECT REQUEST
// ==========================================

export async function rejectGraphicDesign(
  id: string,
  reason: string,
): Promise<GraphicDesignDetail> {
  const detail = readDesign(id);

  if (detail.status !== "Baru") {
    throw new Error("Request ini tidak dapat ditolak.");
  }

  const rejectionNote = reason.trim();

  if (!rejectionNote) {
    throw new Error("Catatan penolakan wajib diisi!");
  }

  const updated: GraphicDesignDetail = {
    ...detail,
    status: "Ditolak",
    priority: null,
    assignee: null,
    draft: null,
    rejectionNote,
  };

  writeDesign(updated);

  return updated;
}

// ==========================================
// UPLOAD DRAFT
// ==========================================

export async function uploadGraphicDesignDraft(
  id: string,
  payload: {
    file: File;
    notes: string;
    officerId: number;
  },
): Promise<GraphicDesignDetail> {
  const detail = readDesign(id);

  // Validasi status request
  if (detail.status !== "Ditugaskan") {
    throw new Error("Request tidak berada dalam tahap unggah draft.");
  }

  // Validasi petugas
  if (detail.assignee?.id !== payload.officerId) {
    throw new Error("Hanya petugas yang ditugaskan yang dapat mengunggah draft.");
  }

  // Validasi file
  validateDraftFile(payload.file);

  // Simpan file ke IndexedDB
  await saveDraftFile(id, payload.file);

  const updated: GraphicDesignDetail = {
    ...detail,
    status: "Menunggu Persetujuan",
    draft: {
      date: formatDraftDate(new Date()),
      notes: payload.notes.trim(),
      file: {
        name: payload.file.name,
        size: formatDraftFileSize(payload.file.size),
        url: "",
      },
    },
  };

  // Simpan metadata ke localStorage
  try {
    writeDesign(updated);
  } catch (error) {
    // Hindari meninggalkan file tanpa metadata
    // jika penyimpanan metadata gagal.
    await deleteDraftFile(id).catch(() => undefined);
    throw error;
  }

  // Kembalikan data beserta URL untuk preview/download
  return {
    ...updated,
    draft: {
      ...updated.draft!,
      file: {
        ...updated.draft!.file!,
        url: URL.createObjectURL(payload.file),
      },
    },
  };
}

// ==========================================
// RESET MOCK DATA (DEVELOPMENT ONLY)
// ==========================================

export async function resetGraphicDesignDetail(id: string): Promise<void> {
  localStorage.removeItem(storageKey(id));

  await deleteDraftFile(id);
}

// ==========================================
// APPROVE DRAFT
// ==========================================

export async function approveGraphicDesignDraft(
  id: string,
  requesterId: number,
): Promise<GraphicDesignDetail> {
  const detail = readDesign(id);

  if (detail.status !== "Menunggu Persetujuan") {
    throw new Error("Draft belum berada dalam tahap persetujuan.");
  }

  if (String(detail.requesterId) !== String(requesterId)) {
    throw new Error("Hanya pemohon yang dapat menyetujui draft.");
  }

  if (!detail.draft?.file) {
    throw new Error("File draft tidak ditemukan.");
  }

  const storedFile = await loadDraftFile(id);

  if (!storedFile) {
    throw new Error("File draft tidak tersedia.");
  }

  const updated: GraphicDesignDetail = {
    ...detail,
    status: "Selesai",
    revisionNote: null,
  };

  writeDesign(updated);

  return updated;
}

// ==========================================
// REQUEST DRAFT REVISION
// ==========================================

export async function requestGraphicDesignRevision(
  id: string,
  payload: {
    requesterId: number;
    notes: string;
  },
): Promise<GraphicDesignDetail> {
  const detail = readDesign(id);

  if (detail.status !== "Menunggu Persetujuan") {
    throw new Error("Draft tidak berada dalam tahap pengajuan revisi.");
  }

  if (String(detail.requesterId) !== String(payload.requesterId)) {
    throw new Error("Hanya pemohon yang dapat mengajukan revisi.");
  }

  if (!detail.draft?.file) {
    throw new Error("Draft desain tidak ditemukan.");
  }

  const revisionNote = payload.notes.trim();

  if (!revisionNote) {
    throw new Error("Catatan revisi wajib diisi!");
  }

  const updated: GraphicDesignDetail = {
    ...detail,
    status: "Perlu Revisi",
    revisionNote,
  };

  writeDesign(updated);

  return updated;
}
