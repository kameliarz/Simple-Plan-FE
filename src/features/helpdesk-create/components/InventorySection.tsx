import { useEffect, useMemo, useState } from "react";

import Dropdown, { type DropdownOption } from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";

import {
  getAssetLocations,
  getAssets,
  type AssetLocation,
  type ListedAsset,
  type AssetByUid,
} from "../services/searchApi";

interface InventorySectionProps {
  unit: string | null;
  inventoryNumber: string;
  inventoryName: string;
  location: string;
  unitError?: string;
  inventoryNumberError?: string;
  scannedAsset?: AssetByUid | null;
  onUnitChange: (value: string) => void;
  onInventoryNumberChange: (value: string) => void;
  onInventoryNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onAssetIdChange: (assetId: number | null) => void;
  onResetInventory?: () => void;
}

type AssetRequestResult = {
  locationId: number;
  assets: ListedAsset[];
  error: string;
};

export default function InventorySection({
  unit,
  inventoryNumber,
  inventoryName,
  location,
  unitError,
  inventoryNumberError,
  scannedAsset,
  onUnitChange,
  onInventoryNumberChange,
  onInventoryNameChange,
  onLocationChange,
  onAssetIdChange,
  onResetInventory,
}: InventorySectionProps) {
  const isFromScan = Boolean(scannedAsset);

  const [locations, setLocations] = useState<AssetLocation[]>([]);

  const [assetResult, setAssetResult] = useState<AssetRequestResult | null>(null);

  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const [locationError, setLocationError] = useState("");
  const [selectionError, setSelectionError] = useState("");

  // ==========================================
  // LOKASI DARI API BARU (semua halaman)
  // ==========================================

  useEffect(() => {
    if (isFromScan) return;

    const controller = new AbortController();

    void getAssetLocations(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;

        setLocations(data);
        setLocationError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        console.error("Gagal memuat lokasi inventaris:", error);

        setLocationError("Gagal memuat daftar lokasi inventaris.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingLocations(false);
        }
      });

    return () => controller.abort();
  }, [isFromScan]);

  const locationOptions: DropdownOption[] = useMemo(
    () =>
      locations.map((item) => ({
        label: item.name,
        value: String(item.id),
      })),
    [locations],
  );

  // Tetap menggunakan prop `unit` agar parent tidak perlu diubah.
  // Dalam mode MANUAL, isinya adalah ID lokasi (string).

  const selectedLocation = useMemo(
    () => locations.find((item) => String(item.id) === unit) ?? null,
    [locations, unit],
  );

  // ==========================================
  // ASET FISIK BERDASARKAN LOKASI
  // Tidak memakai API /units atau /assets/search.
  // ==========================================

  useEffect(() => {
    if (isFromScan || !selectedLocation) return;

    const controller = new AbortController();
    const locationId = selectedLocation.id;

    void getAssets({ assetLocationId: locationId }, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;

        setAssetResult({
          locationId,
          assets: data,
          error: "",
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        console.error("Gagal memuat aset pada lokasi:", error);

        setAssetResult({
          locationId,
          assets: [],
          error: "Gagal memuat inventaris pada lokasi ini.",
        });
      });

    return () => controller.abort();
  }, [isFromScan, selectedLocation]);

  // ==========================================
  // DERIVED STATE
  // Menghindari setState sinkron dalam useEffect.
  // ==========================================

  const hasSelectedLocation = !isFromScan && selectedLocation !== null;

  const hasCurrentAssetResult =
    hasSelectedLocation && assetResult?.locationId === selectedLocation.id;

  const isLoadingAssets = hasSelectedLocation && !hasCurrentAssetResult;

  const assetError = selectionError || (hasCurrentAssetResult ? (assetResult?.error ?? "") : "");

  // Hanya menampilkan aset yang sesuai lokasi aktif.
  // Data lokasi sebelumnya tidak masuk ke dropdown.

  const availableAssets = useMemo(() => {
    if (isFromScan || !selectedLocation || assetResult?.locationId !== selectedLocation.id) {
      return [];
    }

    return assetResult.assets.filter(
      (asset) =>
        asset.asset_code?.location?.id === selectedLocation.id &&
        Boolean(asset.asset_code?.full_code?.trim()) &&
        Boolean(asset.asset_code?.item?.name?.trim()),
    );
  }, [assetResult, selectedLocation, isFromScan]);

  // ==========================================
  // DROPDOWN NAMA INVENTARIS
  // ==========================================

  // Nama inventaris mengikuti lokasi.
  // Jika nomor dipilih, nama terkunci pada nomor tersebut.

  const nameOptions: DropdownOption[] = useMemo(() => {
    const matching = inventoryNumber
      ? availableAssets.filter((asset) => asset.asset_code?.full_code === inventoryNumber)
      : availableAssets;

    const names = Array.from(
      new Set(
        matching
          .map((asset) => asset.asset_code?.item?.name)
          .filter((name): name is string => Boolean(name)),
      ),
    );

    return names.map((name) => ({
      label: name,
      value: name,
    }));
  }, [availableAssets, inventoryNumber]);

  // ==========================================
  // DROPDOWN NOMOR INVENTARIS
  // ==========================================

  // Nomor inventaris mengikuti lokasi dan nama terpilih.

  const numberOptions: DropdownOption[] = useMemo(() => {
    const matching = inventoryName
      ? availableAssets.filter((asset) => asset.asset_code?.item?.name === inventoryName)
      : availableAssets;

    const codes = Array.from(
      new Set(
        matching
          .map((asset) => asset.asset_code?.full_code)
          .filter((code): code is string => Boolean(code)),
      ),
    );

    return codes.map((code) => ({
      label: code,
      value: code,
    }));
  }, [availableAssets, inventoryName]);

  // ==========================================
  // HANDLER LOKASI
  // ==========================================

  const handleLocationChange = (locationId: string) => {
    if (isFromScan) return;

    const selected = locations.find((item) => String(item.id) === locationId);

    setSelectionError("");

    onUnitChange(locationId);
    onLocationChange(selected?.name ?? "");
    onInventoryNameChange("");
    onInventoryNumberChange("");
    onAssetIdChange(null);
  };

  // ==========================================
  // HANDLER NAMA INVENTARIS
  // ==========================================

  const handleNameSelect = (name: string) => {
    if (isFromScan || !selectedLocation || isLoadingAssets) {
      return;
    }

    setSelectionError("");
    onInventoryNameChange(name);

    const matching = availableAssets.filter((asset) => asset.asset_code?.item?.name === name);

    if (matching.length === 1) {
      // Tepat satu aset:
      // Nomor inventaris dan ID langsung terisi.

      onInventoryNumberChange(matching[0].asset_code?.full_code ?? "");

      onAssetIdChange(matching[0].id);
      return;
    }

    // Pertahankan nomor sebelumnya hanya jika
    // masih menunjuk satu aset yang cocok.

    const retained = matching.filter((asset) => asset.asset_code?.full_code === inventoryNumber);

    if (retained.length === 1) {
      onAssetIdChange(retained[0].id);
    } else {
      onInventoryNumberChange("");
      onAssetIdChange(null);
    }
  };

  // ==========================================
  // HANDLER NOMOR INVENTARIS
  // ==========================================

  const handleNumberSelect = (number: string) => {
    if (isFromScan || !selectedLocation || isLoadingAssets) {
      return;
    }

    setSelectionError("");

    const matching = availableAssets.filter((asset) => asset.asset_code?.full_code === number);

    if (matching.length === 1) {
      const asset = matching[0];

      onInventoryNumberChange(number);
      onInventoryNameChange(asset.asset_code?.item?.name ?? "");

      // ID record /assets yang benar untuk POST /tickets.
      // Bukan asset_code.id atau item.id.

      onAssetIdChange(asset.id);
      return;
    }

    onInventoryNumberChange(number);
    onInventoryNameChange("");
    onAssetIdChange(null);

    setSelectionError(
      matching.length > 1
        ? "Nomor inventaris digunakan oleh lebih dari satu aset."
        : "Nomor inventaris tidak ditemukan pada lokasi ini.",
    );
  };

  // ==========================================
  // RESET INVENTARIS
  // ==========================================

  const handleReset = () => {
    setSelectionError("");

    if (onResetInventory) {
      onResetInventory();
      return;
    }

    onUnitChange("");
    onInventoryNameChange("");
    onInventoryNumberChange("");
    onLocationChange("");
    onAssetIdChange(null);
  };

  // ==========================================
  // MODE SCAN - menggunakan data UID
  // ==========================================

  const scannedLocation = scannedAsset?.location || "—";
  const scannedName = scannedAsset?.name || "—";
  const scannedNumber = scannedAsset?.code ?? "Belum memiliki kode";

  const scannedLocationOptions: DropdownOption[] = [
    {
      label: scannedLocation,
      value: scannedLocation,
    },
  ];

  const scannedNameOptions: DropdownOption[] = [
    {
      label: scannedName,
      value: scannedName,
    },
  ];

  const scannedNumberOptions: DropdownOption[] = [
    {
      label: scannedNumber,
      value: scannedNumber,
    },
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* LOKASI */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">Lokasi</label>
        </div>

        {isFromScan ? (
          <div className="pointer-events-none">
            <Dropdown
              value={scannedLocation}
              displayValue={scannedLocation}
              options={scannedLocationOptions}
              onChange={() => {}}
              className="w-full"
            />
          </div>
        ) : (
          <Dropdown
            value={unit ?? ""}
            displayValue={selectedLocation?.name ?? ""}
            options={locationOptions}
            onChange={handleLocationChange}
            placeholder={isLoadingLocations ? "Memuat lokasi..." : "Pilih Lokasi"}
            className="w-full"
            searchable
            searchPlaceholder="Cari lokasi..."
            sheetTitle="Pilih Lokasi"
            mobileSheet
          />
        )}

        {(unitError || locationError) && (
          <p className="text-xs text-danger-500">{unitError || locationError}</p>
        )}
      </div>

      {/* NAMA INVENTARIS */}
      <div className={`flex flex-col gap-2 ${!unit && !isFromScan ? "cursor-not-allowed" : ""}`}>
        <label className="text-sm font-semibold text-text-secondary">Nama Inventaris</label>

        <div className={!unit && !isFromScan ? "pointer-events-none opacity-60" : ""}>
          {isFromScan ? (
            <div className="pointer-events-none">
              <Dropdown
                value={scannedName}
                options={scannedNameOptions}
                onChange={() => {}}
                className="w-full"
              />
            </div>
          ) : (
            <Dropdown
              value={inventoryName}
              options={nameOptions}
              onChange={handleNameSelect}
              placeholder={
                isLoadingAssets
                  ? "Memuat inventaris..."
                  : unit
                    ? "Pilih Nama Inventaris"
                    : "Pilih Lokasi terlebih dahulu"
              }
              className="w-full"
              searchable
              searchPlaceholder="Cari nama inventaris..."
              sheetTitle="Pilih Nama Inventaris"
              mobileSheet
            />
          )}
        </div>
      </div>

      {/* NOMOR INVENTARIS */}
      <div className={`flex flex-col gap-2 ${!unit && !isFromScan ? "cursor-not-allowed" : ""}`}>
        <label className="text-sm font-semibold text-text-secondary">No. Inventaris</label>

        <div className={!unit && !isFromScan ? "pointer-events-none opacity-60" : ""}>
          {isFromScan ? (
            <div className="pointer-events-none">
              <Dropdown
                value={scannedNumber}
                options={scannedNumberOptions}
                onChange={() => {}}
                className="w-full"
              />
            </div>
          ) : (
            <Dropdown
              value={inventoryNumber}
              options={numberOptions}
              onChange={handleNumberSelect}
              placeholder={
                isLoadingAssets
                  ? "Memuat inventaris..."
                  : unit
                    ? "Pilih No. Inventaris"
                    : "Pilih Lokasi terlebih dahulu"
              }
              className="w-full"
              searchable
              searchPlaceholder="Cari no. inventaris..."
              sheetTitle="Pilih No. Inventaris"
              mobileSheet
            />
          )}
        </div>

        {inventoryNumberError && <p className="text-xs text-danger-500">{inventoryNumberError}</p>}
      </div>

      {/* ERROR ASET */}
      {!isFromScan && assetError && <p className="text-xs text-danger-500">{assetError}</p>}

      {/* RESET PILIHAN */}
      {(isFromScan || inventoryName || inventoryNumber || location) && (
        <div className="flex justify-end pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            label="Reset Pilihan"
            onClick={handleReset}
          />
        </div>
      )}
    </div>
  );
}
