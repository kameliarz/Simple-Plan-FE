import DetailCard from "./DetailCard";
import Dropdown from "@/components/ui/ui-template/Dropdown";

type ClassificationCardProps = {
  isClassifying: boolean;
  isClassificationSaved: boolean;
  isSarpras: boolean;
  classificationRef: React.Ref<HTMLDivElement>;

  kategoriSarpras: string;
  setKategoriSarpras: (value: string) => void;
  kategoriSarprasOptions: string[];
  kategoriSarprasError: string;
  setKategoriSarprasError: (value: string) => void;

  kategoriMutu: string;
  setKategoriMutu: (value: string) => void;
  kategoriMutuOptions: string[];
  kategoriMutuError: string;
  setKategoriMutuError: (value: string) => void;

  tagsIT: string;
  setTagsIT: (value: string) => void;
  tagsITOptions: string[];
  tagsITError: string;
  setTagsITError: (value: string) => void;
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
}: ClassificationCardProps) {
  const title = `Klasifikasi Tiket ${isSarpras ? "Sarpras" : "TIK"}`;

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
                    onChange={(value: string) => {
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
                  <div className="mb-4">
                    <label className="mb-1.5 block text-sm font-medium text-text-title">
                      Kategori Mutu
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Dropdown
                      value={kategoriMutu}
                      options={kategoriMutuOptions}
                      onChange={(value: string) => {
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

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-title">
                      Tags IT
                      <span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Dropdown
                      value={tagsIT}
                      options={tagsITOptions}
                      onChange={(value: string) => {
                        setTagsIT(value);

                        if (value) {
                          setTagsITError("");
                        }
                      }}
                      placeholder="Pilih tags IT"
                      className="w-full"
                      error={tagsITError}
                    />
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

                  <p className="mt-1.5 text-sm font-medium text-text-title">{kategoriSarpras}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">Kategori Mutu</p>

                    <p className="mt-1.5 text-sm font-medium text-text-title">{kategoriMutu}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Tags IT</p>

                    <p className="mt-1.5 text-sm font-medium text-text-title">{tagsIT}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DetailCard>
      )}
    </>
  );
}
