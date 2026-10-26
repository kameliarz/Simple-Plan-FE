import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/ui-template/Input";
import Dropdown, { type DropdownOption } from "@/components/ui/ui-template/Dropdown";
import Button from "@/components/ui/ui-template/Button";

import {
  searchUnits,
  searchAssets,
  type SearchedUnit,
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
  onUnitChange,
  onInventoryNumberChange,
  onInventoryNameChange,
  onLocationChange,
  onAssetIdChange,
}: InventorySectionProps) {
  // =========================
  // State data Unit
  // =========================
  const [unitList, setUnitList] = useState<SearchedUnit[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  // =========================
  // State data Inventaris
  // =========================
  const [assetList, setAssetList] = useState<SearchedAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [fetchError, setFetchError] = useState("");
  // =========================
  // Load Unit
  // =========================
  useEffect(() => {
    let isMounted = true;

    searchUnits("")
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setUnitList(data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat unit:", err);
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
      label: u.unit_name,
      value: u.unit_name,
    }));
  }, [unitList]);

  // =========================
  // Fetch Inventaris ketika Unit berubah
  // =========================

  useEffect(() => {
    if (!unit || unitList.length === 0) return;

    const matchedUnit = unitList.find(
      (item) => item.unit_name.toLowerCase() === unit.toLowerCase(),
    );

    if (!matchedUnit) return;

    let isMounted = true;

    searchAssets(matchedUnit.id)
      .then((data) => {
        if (!isMounted) return;

        setAssetList(Array.isArray(data) ? data : []);
        setFetchError("");
        setIsLoadingAssets(false);
      })
      .catch((error) => {
        if (!isMounted) return;

        setAssetList([]);
        setFetchError("Gagal memuat inventaris untuk unit ini.");
        setIsLoadingAssets(false);
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [unit, unitList]);

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
    if (!unit) return;

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
    if (!unit) return;

    const matchedAsset = assetList.find((item) => item.asset_number === selectedNumber);

    if (matchedAsset) {
      onInventoryNumberChange(matchedAsset.asset_number ?? "");
      onInventoryNameChange(matchedAsset.name ?? "");
      onLocationChange(matchedAsset.location ?? "");
      onAssetIdChange(matchedAsset.id ?? null);

      console.log("Inventaris terpilih:", matchedAsset);
      console.log("Asset ID terpilih:", matchedAsset.id);
    } else {
      onInventoryNumberChange("");
      onLocationChange("");
      onAssetIdChange(null);

      console.warn("Inventaris tidak ditemukan:", selectedNumber);
    }
  };

  // =========================
  // Ganti Unit
  // =========================
  const handleUnitChange = (newUnitValue: string) => {
    setFetchError("");

    // State lokal
    setAssetList([]);
    setIsLoadingAssets(
      Boolean(newUnitValue) &&
        unitList.some((item) => item.unit_name.toLowerCase() === newUnitValue.toLowerCase()),
    );

    // State parent
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
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      {/* Unit */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-text-secondary">Unit</label>
        </div>

        <Dropdown
          value={unit ?? ""}
          displayValue={unit ?? ""}
          options={unitOptions}
          onChange={handleUnitChange}
          placeholder={isLoadingUnits ? "Memuat unit..." : "Pilih unit"}
          className="w-full"
          searchable
          searchPlaceholder="Cari unit..."
          sheetTitle="Pilih Unit"
          mobileSheet
        />
      </div>

      {/* Nama Inventaris */}
      <div className={`flex flex-col gap-2 ${!unit ? "cursor-not-allowed" : ""}`}>
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
      <div className={`flex flex-col gap-2 ${!unit ? "cursor-not-allowed" : ""}`}>
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
