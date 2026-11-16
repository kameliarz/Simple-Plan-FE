import { useEffect, useId, useRef, useState } from "react";

import type { ChangeEvent } from "react";

import { IconChevronLeft, IconBolt, IconPhoto, IconCamera, IconLoader2 } from "@tabler/icons-react";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BarcodeScannerProps {
  onBack: () => void;
  onScanSuccess: (code: string) => void;
}

export default function BarcodeScanner({ onBack, onScanSuccess }: BarcodeScannerProps) {
  const readerId = `scanner-${useId().replace(/:/g, "")}`;

  // ==========================================
  // REFS
  // ==========================================

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busyRef = useRef(false);
  const scannedRef = useRef(false);
  const mountedRef = useRef(false);
  const callbackRef = useRef(onScanSuccess);

  const pendingRef = useRef<Promise<void>>(Promise.resolve());

  // ==========================================
  // STATE
  // ==========================================

  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // UPDATE CALLBACK
  // ==========================================

  useEffect(() => {
    callbackRef.current = onScanSuccess;
  }, [onScanSuccess]);

  // ==========================================
  // HANDLE HASIL SCAN
  // ==========================================

  const handleDetected = (decodedText: string) => {
    if (scannedRef.current || !mountedRef.current) {
      return;
    }

    const code = decodedText.trim();

    if (!code) return;

    scannedRef.current = true;

    // Navigasi tetap ditangani ScanBarcodePage
    callbackRef.current(code);
  };

  // ==========================================
  // INSTANCE SCANNER
  // ==========================================

  const getScanner = () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(readerId, {
        verbose: false,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
        ],
      });
    }

    return scannerRef.current;
  };

  // ==========================================
  // START CAMERA INTERNAL
  // ==========================================

  const startCameraInternal = async () => {
    const scanner = getScanner();

    if (scanner.isScanning) {
      setIsScanning(true);
      return;
    }

    scannedRef.current = false;

    await scanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      (decodedText) => {
        handleDetected(decodedText);
      },
      () => {
        // Belum mendeteksi kode
      },
    );

    if (mountedRef.current) {
      setIsScanning(true);
      setTorchOn(false);
    }
  };

  // ==========================================
  // OPERASI KAMERA BERURUTAN
  // ==========================================

  const runOperation = (operation: () => Promise<void>) => {
    const next = pendingRef.current.catch(() => {}).then(operation);

    pendingRef.current = next;

    return next;
  };

  // ==========================================
  // AUTO START CAMERA
  // ==========================================

  useEffect(() => {
    mountedRef.current = true;

    let cancelled = false;

    void runOperation(async () => {
      if (cancelled) return;

      busyRef.current = true;

      if (mountedRef.current) {
        setIsLoading(true);
        setError("");
      }

      try {
        await startCameraInternal();
      } catch (err) {
        console.error("Camera error:", err);

        if (!cancelled && mountedRef.current) {
          setIsScanning(false);
          setError(
            "Kamera tidak dapat dibuka. Periksa izin kamera dan pastikan website menggunakan HTTPS.",
          );
        }
      } finally {
        busyRef.current = false;

        if (!cancelled && mountedRef.current) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;

      void runOperation(async () => {
        const scanner = scannerRef.current;

        if (!scanner) return;

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }

          scanner.clear();
        } catch (err) {
          console.error("Scanner cleanup error:", err);
        } finally {
          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }
        }
      });
    };

    // Inisialisasi hanya saat mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // AMBIL FOTO DARI VIDEO KAMERA
  // ==========================================

  const capturePhoto = async () => {
    const scanner = scannerRef.current;

    if (busyRef.current || !scanner?.isScanning || scannedRef.current) {
      return;
    }

    const reader = document.getElementById(readerId);

    const video = reader?.querySelector("video");

    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setError("Kamera belum siap. Silakan coba lagi.");
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (!canvas.width || !canvas.height) {
      setError("Gagal mengambil gambar dari kamera.");
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      setError("Gagal memproses gambar kamera.");
      return;
    }

    // Ambil satu frame dari kamera
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      setError("Gagal mengambil foto. Silakan coba lagi.");
      return;
    }

    const photoFile = new File([blob], "helpdesk-scan.png", { type: "image/png" });

    await scanCapturedFile(photoFile);
  };

  // ==========================================
  // PROSES FOTO HASIL CAPTURE
  // ==========================================

  const scanCapturedFile = async (file: File) => {
    if (busyRef.current || scannedRef.current) {
      return;
    }

    busyRef.current = true;
    setIsLoading(true);
    setError("");

    await runOperation(async () => {
      const scanner = getScanner();

      let scanSucceeded = false;

      try {
        // Scan file tidak boleh berjalan
        // bersamaan dengan live camera scanner.
        if (scanner.isScanning) {
          await scanner.stop();
        }

        if (mountedRef.current) {
          setIsScanning(false);
          setTorchOn(false);
        }

        const result = await scanner.scanFile(file, false);

        scanSucceeded = true;
        handleDetected(result);
      } catch (err) {
        console.error("Photo scan error:", err);

        if (mountedRef.current) {
          setError("Kode tidak terbaca dari foto. Arahkan kamera lebih dekat dan coba lagi.");
        }
      } finally {
        // Jika gagal membaca foto,
        // hidupkan lagi kamera secara otomatis.
        if (!scanSucceeded && mountedRef.current) {
          try {
            await startCameraInternal();
          } catch (err) {
            console.error("Restart camera error:", err);

            if (mountedRef.current) {
              setError("Gagal membuka kembali kamera. Coba muat ulang halaman.");
            }
          }
        }

        busyRef.current = false;

        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    });
  };

  // ==========================================
  // TOGGLE FLASH
  // ==========================================

  const toggleFlash = async () => {
    const scanner = scannerRef.current;

    if (!scanner?.isScanning || busyRef.current) {
      return;
    }

    try {
      const next = !torchOn;

      await scanner.applyVideoConstraints({
        advanced: [
          {
            torch: next,
          } as MediaTrackConstraintSet,
        ],
      });

      if (mountedRef.current) {
        setTorchOn(next);
        setError("");
      }
    } catch (err) {
      console.error("Flash error:", err);

      if (mountedRef.current) {
        setError("Flash tidak didukung oleh perangkat ini.");
      }
    }
  };

  // ==========================================
  // SCAN DARI GALERI
  // ==========================================

  const handleGallery = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || busyRef.current) return;

    const input = event.currentTarget;

    await scanCapturedFile(file);

    input.value = "";
  };

  // ==========================================
  // UI - TIDAK DIUBAH
  // ==========================================

  return (
    <div className="flex min-h-dvh flex-col bg-table-card">
      {/* HEADER */}
      <header className="relative flex h-24 shrink-0 items-center justify-center px-7">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="absolute left-7 flex size-10 items-center justify-center rounded-full border border-soft-border bg-button shadow-sm"
        >
          <IconChevronLeft size={20} strokeWidth={1.7} className="text-text-secondary" />
        </button>

        <h1 className="font-semibold text-text-title">Pindai Barcode</h1>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
        {/* SATU AREA KAMERA */}
        <div className="relative aspect-square w-full max-w-78 overflow-hidden rounded-4xl bg-[#15243A] shadow-sm">
          {/* VIDEO KAMERA */}
          <div
            id={readerId}
            className="
              absolute inset-0 h-full w-full
              [&_video]:h-full
              [&_video]:w-full
              [&_video]:object-cover
            "
          />

          {/* STATE LOADING */}
          {isLoading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#15243A] text-white">
              <IconLoader2 size={30} className="animate-spin" />

              <p className="mt-3 text-xs text-slate-200">Memproses kamera...</p>
            </div>
          )}

          {/* KAMERA TIDAK AKTIF */}
          {!isScanning && !isLoading && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70">
              <IconCamera size={40} strokeWidth={1.3} />

              <p className="text-xs">Kamera tidak aktif</p>
            </div>
          )}

          {/* OVERLAY SCANNER */}
          <div className="pointer-events-none absolute inset-[12%] z-20">
            {/* SUDUT KIRI ATAS */}
            <div className="absolute left-0 top-0 size-8 rounded-tl-xl border-l-4 border-t-4 border-[#82B8FF]" />

            {/* SUDUT KANAN ATAS */}
            <div className="absolute right-0 top-0 size-8 rounded-tr-xl border-r-4 border-t-4 border-[#82B8FF]" />

            {/* SUDUT KIRI BAWAH */}
            <div className="absolute bottom-0 left-0 size-8 rounded-bl-xl border-b-4 border-l-4 border-[#82B8FF]" />

            {/* SUDUT KANAN BAWAH */}
            <div className="absolute bottom-0 right-0 size-8 rounded-br-xl border-b-4 border-r-4 border-[#82B8FF]" />

            {/* GARIS SCAN */}
            {isScanning && (
              <div className="absolute inset-x-3 inset-y-2 overflow-hidden">
                <div className="scanner-line absolute inset-x-0 h-0.75 rounded-full bg-blue-400 shadow-[0_0_12px_3px_#60A5FA]" />
              </div>
            )}
          </div>
        </div>

        {/* PETUNJUK */}
        <p className="mt-7 pt-3 text-center text-sm text-[#637594]">
          Arahkan barcode atau QR Code inventaris
        </p>

        {/* ERROR */}
        {error && (
          <p role="alert" className="mt-4 max-w-78 text-center text-xs leading-5 text-red-500">
            {error}
          </p>
        )}
      </main>

      {/* BOTTOM CONTROLS */}
      <footer className="mx-auto flex w-full max-w-97.5 shrink-0 items-center justify-between px-10 pb-16 pt-5">
        {/* FLASH */}
        <button
          type="button"
          onClick={() => void toggleFlash()}
          disabled={!isScanning || isLoading}
          aria-label="Flash kamera"
          aria-pressed={torchOn}
          className="flex size-12 items-center justify-center rounded-full border border-soft-border bg-button shadow-sm disabled:opacity-40"
        >
          <IconBolt size={22} className={torchOn ? "text-amber-500" : "text-text-secondary"} />
        </button>

        {/* TOMBOL FOTO / SHUTTER */}
        <button
          type="button"
          onClick={() => void capturePhoto()}
          disabled={!isScanning || isLoading}
          aria-label="Ambil foto barcode"
          className="flex size-20 items-center justify-center rounded-full border-4 border-[#EDF2FA] bg-white shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          <div className="flex size-15 items-center justify-center rounded-full bg-[#F5F8FF]">
            <div className="size-8 rounded-full bg-primary-700" />
          </div>
        </button>

        {/* GALERI */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Pilih gambar dari galeri"
          className="flex size-12 items-center justify-center rounded-full border border-soft-border bg-button shadow-sm disabled:opacity-40"
        >
          <IconPhoto size={22} className="text-text-secondary" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => void handleGallery(event)}
        />
      </footer>

      {/* SCAN ANIMATION */}
      <style>{`
        @keyframes scanMove {
          0% {
            top: 0%;
          }

          50% {
            top: calc(100% - 3px);
          }

          100% {
            top: 0%;
          }
        }

        .scanner-line {
          animation: scanMove 2.5s ease-in-out infinite;
        }

        #${readerId} video {
          object-fit: cover !important;
        }

        #${readerId} {
          width: 100%;
          height: 100%;
        }

        @media (prefers-reduced-motion: reduce) {
          .scanner-line {
            animation: none;
            top: 50%;
          }
        }
      `}</style>
    </div>
  );
}
