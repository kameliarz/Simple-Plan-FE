import Table from "@/components/ui/ui-template/Table";
import { IconDatabaseOff } from "@tabler/icons-react";

import BackupStatusBadge from "./BackupStatusBadge";
import BackupActionMenu from "./BackupActionMenu";

import type { Backup } from "../types/backup.types";

interface BackupTableProps {
  backups: Backup[];
  onDownload: (backup: Backup) => void;
  onRestore: (backup: Backup) => void;
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export default function BackupTable({ backups, onDownload, onRestore }: BackupTableProps) {
  return (
    <Table className="min-w-262.5 table-auto">
      <Table.Thead>
        <tr>
          <Table.Th className="whitespace-nowrap">Nama File</Table.Th>
          <Table.Th className="whitespace-nowrap">Waktu Back Up</Table.Th>
          <Table.Th className="whitespace-nowrap">Jenis Back Up</Table.Th>
          <Table.Th className="whitespace-nowrap">Dilakukan Oleh</Table.Th>
          <Table.Th className="whitespace-nowrap">Ukuran File</Table.Th>
          <Table.Th className="whitespace-nowrap">Status</Table.Th>
          <Table.Th className="whitespace-nowrap text-center">Aksi</Table.Th>
        </tr>
      </Table.Thead>

      <Table.Tbody>
        {backups.length === 0 ? (
          <Table.Empty
            colSpan={7}
            message="Tidak ada data backup"
            description="Data backup yang kamu cari tidak ditemukan."
          >
            <IconDatabaseOff size={42} className="text-slate-400" />
          </Table.Empty>
        ) : (
          backups.map((backup) => (
            <tr
              key={backup.id}
              className="
                transition-colors
                hover:bg-slate-50
                dark:hover:bg-slate-800/50
              "
            >
              {/* NAMA FILE */}
              <Table.Td className="min-w-55 whitespace-nowrap">
                <span className="font-medium">{backup.fileName}</span>
              </Table.Td>

              {/* WAKTU BACK UP */}
              <Table.Td className="whitespace-nowrap">
                {dateFormatter.format(new Date(backup.backupDate))}
              </Table.Td>

              {/* JENIS BACK UP */}
              <Table.Td className="whitespace-nowrap">
                <BackupStatusBadge type={backup.type} />
              </Table.Td>

              {/* DILAKUKAN OLEH */}
              <Table.Td className="whitespace-nowrap">{backup.performedBy}</Table.Td>

              {/* UKURAN FILE */}
              <Table.Td className="whitespace-nowrap">{backup.fileSize} MB</Table.Td>

              {/* STATUS */}
              <Table.Td className="whitespace-nowrap">
                <BackupStatusBadge status={backup.status} />
              </Table.Td>

              {/* AKSI */}
              <Table.Td className="whitespace-nowrap text-center">
                <BackupActionMenu backup={backup} onDownload={onDownload} onRestore={onRestore} />
              </Table.Td>
            </tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
}
