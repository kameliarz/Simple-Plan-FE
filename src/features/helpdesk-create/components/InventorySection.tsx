import { useEffect, useMemo, useState } from "react";

import Input from "@/components/ui/ui-template/Input";
import Dropdown, { type DropdownOption } from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";

import {
  searchAssetLocations,
  searchAssets,
  type SearchedAssetLocation,
  type SearchedAsset,
} from "../services/searchApi";

interface InventorySectionProps {
  unit: string | null;
  inventoryNumber: string;
  inventoryName: string;
  location: string;

  unitError?: string;

  onUnitChange: (value: string) => void;
  onInventoryNumberChange: (value: string) => void;
  onInventoryNameChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onAssetIdChange: (assetId: number | null) => void;
}

export default function InventorySection({
  unit,
  inventoryNumber,
  inventoryName,
  location,
  unitError,
  onUnitChange,
  onInventoryNumberChange,
  onInventoryNameChange,
  onLocationChange,
  onAssetIdChange,
}: InventorySectionProps) {
  // =========================
  // State data Unit
  // =========================

  const [unitList, setUnitList] = useState<SearchedAssetLocation[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  // =========================
  // State data Inventaris
  // =========================

  const [assetResult, setAssetResult] = useState<{
    code: SearchedAssetLocation["code"];
    assets: SearchedAsset[];
    error: string;
  } | null>(null);

  const [unitWarning, setUnitWarning] = useState("");

  // =========================
  // Load Unit
  // =========================

  useEffect(() => {
    let isMounted = true;

    searchAssetLocations("")
      .then((data) => {
        if (!isMounted) return;

        setUnitList(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Gagal memuat asset locations:", error);

        if (isMounted) {
          setUnitList([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingUnits(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // =========================
  // Format opsi Unit
  // =========================

  const unitOptions: DropdownOption[] = useMemo(() => {
    return unitList.map((u) => ({
      label: u.name,
      value: u.name,
    }));
  }, [unitList]);

  // =========================
  // Cari lokasi berdasarkan Unit
  // =========================

  const matchedLocation = useMemo(() => {
    if (!unit) return null;

    return unitList.find((item) => item.name.toLowerCase() === unit.toLowerCase()) ?? null;
  }, [unit, unitList]);

  const locationCode = matchedLocation?.code ?? null;

  // =========================
  // Derived state Inventaris
  // =========================

  const assetList = useMemo(() => {
    if (!locationCode) return [];

    if (assetResult?.code !== locationCode) return [];

    return assetResult.assets;
  }, [locationCode, assetResult]);

  const isLoadingAssets = Boolean(locationCode) && assetResult?.code !== locationCode;

  const fetchError = locationCode && assetResult?.code === locationCode ? assetResult.error : "";

  // =========================
  // Fetch Inventaris ketika Unit berubah
  // =========================

  useEffect(() => {
    if (!locationCode) return;

    let isMounted = true;

    // Gunakan CODE lokasi, bukan ID
    searchAssets(locationCode)
      .then((data) => {
        if (!isMounted) return;

        setAssetResult({
          code: locationCode,
          assets: Array.isArray(data) ? data : [],
          error: "",
        });
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Gagal memuat inventaris untuk unit:", locationCode, error);

        setAssetResult({
          code: locationCode,
          assets: [],
          error: "Gagal memuat inventaris untuk unit ini.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [locationCode]);

  // =========================
  // Validasi Unit
  // =========================

  const checkUnitSelected = (): boolean => {
    if (!unit) {
      setUnitWarning("Silakan pilih Unit terlebih dahulu!");
      return false;
    }

    setUnitWarning("");
    return true;
  };

  // =========================
  // Opsi Nama Inventaris
  // =========================

  const nameOptions: DropdownOption[] = useMemo(() => {
    const names = assetList
      .map((item) => item.name)
      .filter((name): name is string => Boolean(name));

    const uniqueNames = Array.from(new Set(names));

    return uniqueNames.map((name) => ({
      label: name,
      value: name,
    }));
  }, [assetList]);

  // =========================
  // Opsi No. Inventaris
  // =========================

  const numberOptions: DropdownOption[] = useMemo(() => {
    let filtered = assetList;

    if (inventoryName) {
      filtered = assetList.filter((item) => item.name === inventoryName);
    }

    const numbers = filtered
      .map((item) => item.asset_number)
      .filter((number): number is string => Boolean(number));

    const uniqueNumbers = Array.from(new Set(numbers));

    return uniqueNumbers.map((number) => ({
      label: number,
      value: number,
    }));
  }, [assetList, inventoryName]);

  // =========================
  // Pilih Nama Inventaris
  // =========================

  const handleNameSelect = (selectedName: string) => {
    if (!checkUnitSelected()) return;

    onInventoryNameChange(selectedName);

    const matchingAssets = assetList.filter((item) => item.name === selectedName);

    if (matchingAssets.length === 1) {
      const matchedAsset = matchingAssets[0];

      onInventoryNumberChange(matchedAsset.asset_number ?? "");
      onLocationChange(matchedAsset.location ?? "");
      onAssetIdChange(matchedAsset.id ?? null);

      return;
    }

    if (matchingAssets.length > 1) {
      const matchedByNumber = matchingAssets.find((item) => item.asset_number === inventoryNumber);

      if (matchedByNumber) {
        onLocationChange(matchedByNumber.location ?? "");
        onAssetIdChange(matchedByNumber.id ?? null);
      } else {
        onInventoryNumberChange("");
        onLocationChange("");
        onAssetIdChange(null);
      }
    }

    if (matchingAssets.length === 0) {
      onInventoryNumberChange("");
      onLocationChange("");
      onAssetIdChange(null);
    }
  };

  // =========================
  // Pilih No. Inventaris
  // =========================

  const handleNumberSelect = (selectedNumber: string) => {
    if (!checkUnitSelected()) return;

    onInventoryNumberChange(selectedNumber);

    const matchedAsset = assetList.find((item) => item.asset_number === selectedNumber);

    if (matchedAsset) {
      onInventoryNameChange(matchedAsset.name ?? "");
      onLocationChange(matchedAsset.location ?? "");
      onAssetIdChange(matchedAsset.id ?? null);
    } else {
      onInventoryNameChange("");
      onLocationChange("");
      onAssetIdChange(null);
    }
  };

  // =========================
  // Ganti Unit
  // =========================

  const handleUnitChange = (newUnitValue: string) => {
    setUnitWarning("");

    // Reset state di parent
    onUnitChange(newUnitValue);
    onInventoryNameChange("");
    onInventoryNumberChange("");
    onLocationChange("");
    onAssetIdChange(null);
  };

  // =========================
  // Reset Inventaris
  // =========================

  const handleReset = () => {
    onInventoryNameChange("");
    onInventoryNumberChange("");
    onLocationChange("");
    onAssetIdChange(null);
    setUnitWarning("");
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Unit */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">
            Unit
            <span className="ml-1 text-red-500">*</span>
          </label>
        </div>

        <Dropdown
          value={unit ?? ""}
          displayValue={unit ?? ""}
          options={unitOptions}
          onChange={handleUnitChange}
          placeholder={isLoadingUnits ? "Memuat unit..." : "Pilih unit"}
          className="w-full"
          error={unitError || unitWarning}
          searchable
          searchPlaceholder="Cari unit..."
          sheetTitle="Pilih Unit"
          mobileSheet
        />
      </div>

      {/* Nama Inventaris */}
      <div
        className={`flex flex-col gap-2 ${!unit ? "cursor-not-allowed" : ""}`}
        onClickCapture={() => {
          if (!unit) {
            checkUnitSelected();
          }
        }}
      >
        <label className="text-sm font-semibold text-text-secondary">Nama Inventaris</label>

        <div className={!unit ? "pointer-events-none opacity-60" : ""}>
          <Dropdown
            value={inventoryName}
            options={nameOptions}
            onChange={handleNameSelect}
            placeholder={
              isLoadingAssets
                ? "Memuat inventaris..."
                : unit
                  ? "Pilih Nama Inventaris"
                  : "Pilih Unit terlebih dahulu"
            }
            className="w-full"
            searchable
            searchPlaceholder="Cari nama inventaris..."
            sheetTitle="Pilih Nama Inventaris"
            mobileSheet
          />
        </div>
      </div>

      {/* No. Inventaris */}
      <div
        className={`flex flex-col gap-2 ${!unit ? "cursor-not-allowed" : ""}`}
        onClickCapture={() => {
          if (!unit) {
            checkUnitSelected();
          }
        }}
      >
        <label className="text-sm font-semibold text-text-secondary">No. Inventaris</label>

        <div className={!unit ? "pointer-events-none opacity-60" : ""}>
          <Dropdown
            value={inventoryNumber}
            options={numberOptions}
            onChange={handleNumberSelect}
            placeholder={
              isLoadingAssets
                ? "Memuat inventaris..."
                : unit
                  ? "Pilih No. Inventaris"
                  : "Pilih Unit terlebih dahulu"
            }
            className="w-full"
            searchable
            searchPlaceholder="Cari no. inventaris..."
            sheetTitle="Pilih No. Inventaris"
            mobileSheet
          />
        </div>
      </div>

      {/* Error API */}
      {fetchError && <p className="text-xs text-danger-500">{fetchError}</p>}

      {/* Lokasi */}
      <Input
        label="Lokasi"
        value={location}
        onChange={(event) => onLocationChange(event.target.value)}
        placeholder="Masukkan lokasi inventaris"
        readOnly
        className="cursor-default"
      />

      {/* Reset Pilihan */}
      {(inventoryName || inventoryNumber || location) && (
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
