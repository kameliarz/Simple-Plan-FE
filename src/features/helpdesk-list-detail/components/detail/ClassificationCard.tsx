import DetailCard from "./DetailCard";
import Dropdown, { type DropdownOption } from "../../../../components/ui/ui-template/Dropdown";
import Input from "../../../../components/ui/ui-template/Input";

type ClassificationDetail = {
  tik_detail?: {
    quality_category?: {
      id: number;
      name: string;
    } | null;
    it_tag?: {
      id: number;
      name: string;
    } | null;
    custom_it_tag_text?: string | null;
  } | null;
  sarpras_detail?: {
    sarpras_category?: {
      id: number;
      name: string;
    } | null;
  } | null;
};

type ClassificationCardProps = {
  isClassifying: boolean;
  isClassificationSaved: boolean;
  isSarpras: boolean;
  classificationRef: React.Ref<HTMLDivElement>;

  kategoriSarpras: string;
  setKategoriSarpras: (value: string) => void;
  kategoriSarprasOptions: DropdownOption[];
  kategoriSarprasError: string;
  setKategoriSarprasError: (value: string) => void;

  kategoriMutu: string;
  setKategoriMutu: (value: string) => void;
  kategoriMutuOptions: DropdownOption[];
  kategoriMutuError: string;
  setKategoriMutuError: (value: string) => void;

  tagsIT: string;
  setTagsIT: (value: string) => void;
  tagsITOptions: DropdownOption[];
  tagsITError: string;
  setTagsITError: (value: string) => void;

  customITTag: string;
  setCustomITTag: (value: string) => void;
  customITTagError: string;
  setCustomITTagError: (value: string) => void;

  classificationDetail?: ClassificationDetail | null;
};

export default function ClassificationCard({
  isClassifying,
  isClassificationSaved,
  isSarpras,
  classificationRef,

  kategoriSarpras,
  setKategoriSarpras,
  kategoriSarprasOptions,
  kategoriSarprasError,
  setKategoriSarprasError,

  kategoriMutu,
  setKategoriMutu,
  kategoriMutuOptions,
  kategoriMutuError,
  setKategoriMutuError,

  tagsIT,
  setTagsIT,
  tagsITOptions,
  tagsITError,
  setTagsITError,

  customITTag,
  setCustomITTag,
  customITTagError,
  setCustomITTagError,

  classificationDetail,
}: ClassificationCardProps) {
  const title = `Klasifikasi Tiket ${isSarpras ? "Sarpras" : "TIK"}`;

  // Untuk mode klasifikasi
  const selectedITTag = tagsITOptions.find((option) => String(option.value) === String(tagsIT));

  const isCustomITTag = selectedITTag?.label.trim().toLowerCase() === "lain-lain";

  // Untuk mode saved (mengambil nama langsung dari API)
  const kategoriSarprasLabel = classificationDetail?.sarpras_detail?.sarpras_category?.name ?? "-";

  const kategoriMutuLabel = classificationDetail?.tik_detail?.quality_category?.name ?? "-";

  const savedITTagName = classificationDetail?.tik_detail?.it_tag?.name ?? "";

  const savedCustomITTag = classificationDetail?.tik_detail?.custom_it_tag_text?.trim() ?? "";

  const tagsITLabel =
    savedITTagName.trim().toLowerCase() === "lain-lain"
      ? savedCustomITTag || savedITTagName
      : savedITTagName || "-";
  return (
    <>
      {isClassifying && (
        <div ref={classificationRef}>
          <DetailCard title={title} overflowVisible>
            <div className="px-6 py-5">
              {isSarpras ? (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-title">
                    Kategori Sarpras
                    <span className="ml-0.5 text-red-500">*</span>
                  </label>

                  <Dropdown
                    value={kategoriSarpras}
                    options={kategoriSarprasOptions}
                    onChange={(value) => {
                      setKategoriSarpras(value);

                      if (value) {
                        setKategoriSarprasError("");
                      }
                    }}
                    placeholder="Pilih kategori sarpras"
                    className="w-full"
                    error={kategoriSarprasError}
                  />
                </div>
              ) : (
                <>
                  {/* Kategori Mutu */}
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-medium text-text-title">
                      Kategori Mutu
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Dropdown
                      value={kategoriMutu}
                      options={kategoriMutuOptions}
                      onChange={(value) => {
                        setKategoriMutu(value);

                        if (value) {
                          setKategoriMutuError("");
                        }
                      }}
                      placeholder="Pilih kategori mutu"
                      className="w-full"
                      error={kategoriMutuError}
                    />
                  </div>

                  {/* Tags IT */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-title">
                      Tags IT
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Dropdown
                      value={tagsIT}
                      options={tagsITOptions}
                      onChange={(value) => {
                        setTagsIT(value);

                        if (value) {
                          setTagsITError("");
                        }

                        const selectedOption = tagsITOptions.find(
                          (option) => option.value === value,
                        );

                        const selectedIsCustom =
                          selectedOption?.label.toLowerCase() === "lain-lain";

                        // Kalau pindah dari Lain-lain ke tag biasa,
                        // hapus input custom sebelumnya.
                        if (!selectedIsCustom) {
                          setCustomITTag("");
                          setCustomITTagError("");
                        }
                      }}
                      placeholder="Pilih tags IT"
                      className="w-full"
                      error={tagsITError}
                    />

                    {/* Input custom hanya muncul ketika memilih Lain-lain */}
                    {isCustomITTag && (
                      <div className="mt-4">
                        <Input
                          label="Tags IT lainnya"
                          value={customITTag}
                          onChange={(event) => {
                            setCustomITTag(event.target.value);

                            if (event.target.value.trim()) {
                              setCustomITTagError("");
                            }
                          }}
                          placeholder="Masukkan tags IT"
                          error={customITTagError}
                          required
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </DetailCard>
        </div>
      )}

      {isClassificationSaved && (
        <DetailCard title={title}>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {isSarpras ? (
                <div>
                  <p className="text-xs text-slate-400">Kategori Sarpras</p>

                  <p className="mt-1.5 text-sm font-medium text-text-title">
                    {kategoriSarprasLabel}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-slate-400">Kategori Mutu</p>

                    <p className="mt-1.5 text-sm font-medium text-text-title">
                      {kategoriMutuLabel}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Tags IT</p>

                    <p className="mt-1.5 text-sm font-medium text-text-title">{tagsITLabel}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </DetailCard>
      )}
    </>
  );
}
