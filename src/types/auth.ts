export type Role =
  "super-admin" | "koordinator-sarpras" | "petugas-tik" | "petugas-sarpras" | "user" | "management";

export const BACKUP_ROLES: Role[] = ["super-admin"];

export const MASTER_DATA_ROLES: Role[] = ["super-admin"];

export const MAINTENANCE_ROLES: Role[] = [
  "super-admin",
  "koordinator-sarpras",
  "petugas-tik",
  "petugas-sarpras",
  "management",
];
