# Laporan automated testing Back Up Data

Tanggal: 12 November 2026.

## Analisis implementasi dan konfigurasi

Seluruh 15 file implementasi fitur dibaca: service, tipe, konstanta, halaman, dan 11 komponen. Proyek memakai React 19, Vite, TypeScript, Vitest, jsdom, React Testing Library, jest-dom, dan user-event. Terdapat contoh unit test di `src/lib/apiFetch.test.ts`, tetapi tidak ada script test di package.json maupun konfigurasi test khusus fitur. Versi Vitest terpasang saat eksekusi: 5.0.5.

Konfigurasi lokal `vitest.config.ts` membatasi discovery ke fitur ini, menyediakan alias `@`, jsdom, dan URL environment khusus testing. Tidak ada perubahan implementasi, package.json, lockfile, atau konfigurasi global. Cache test diarahkan ke folder fitur dan diabaikan oleh Git.

Service menangani history berpaginasi, pemetaan data API, pengaturan jadwal, antrean backup manual, download ZIP, serta penghapusan file. Halaman memadukan filter server, pencarian pada halaman aktif, polling 10 detik, toast, dan modal. Komponen membedakan status pending/processing/success/failed serta ketersediaan file.

## Hasil akhir

| Kelompok            | Passed | Failed |
| ------------------- | -----: | -----: |
| Unit service        |     34 |      0 |
| Component umum      |     36 |      0 |
| Component jadwal    |     11 |      0 |
| Integration halaman |     18 |      0 |
| **Total**           | **99** |  **0** |

Empat file test lulus, tidak ada test skipped. Durasi run akhir: 29,85 detik. Hasil mesin tersimpan di `__tests__/results.json`.

Pemeriksaan tambahan: ESLint file testing dan konfigurasi lulus; TypeScript project dengan `--noEmit --incremental false` lulus. Headless UI mengeluarkan peringatan polyfill getAnimations di jsdom; tidak ada kegagalan test terkait peringatan tersebut.

## Cakupan skenario

- Unit: header Accept/Authorization/Content-Type, signal abort, serialisasi filter, pengabaian pencarian lokal, bentuk pagination langsung/nested/meta, konversi angka/ukuran byte, fallback nama/tanggal/pelaku, flag file tidak tersedia, serta respons tidak valid.
- Unit: GET/POST/PUT/DELETE, ID URL encoded, respons 204, jadwal harian/mingguan/bulanan, default jadwal, error 409/422/500/503, validasi API, error non-JSON dan jaringan.
- Download: Blob URL, nama ZIP dan fallback, klik anchor, penghapusan anchor, serta pelepasan object URL setelah satu detik.
- Component: seluruh label status/jenis, kondisi kosong desktop/mobile, format waktu Jakarta dan ukuran lokal, callback aksi, pencegahan aksi pada status gagal/berjalan atau file hilang, menu portal dan penutupan lewat Escape/klik luar/scroll.
- Component: konfirmasi backup/hapus, status loading, target kosong, informasi pagination nol data, draft/reset/apply filter mobile, preservasi search, scroll lock dan cleanup.
- Jadwal: simpan sukses, hari/tanggal wajib setelah perubahan frekuensi, hari Minggu dan tanggal 28, jadwal nonaktif, jam wajib, preservasi menit dari API, error dan retry, cegah submit ganda dan Escape selama menyimpan.
- Integration: halaman dan komponen asli menggunakan service serta apiFetch asli dengan fetch mock; load history/settings, pencarian case-insensitive tanpa request tambahan, pagination dan reset halaman saat filter berubah, backup sukses/409/500, hapus sukses/404/500, download gagal/404, blokir backup pending/processing, kegagalan load, simpan jadwal sukses/422, polling dan abort saat unmount.

Semua fetch diganti mock sebelum setiap test. Request yang belum dikonfigurasi ditolak. Tidak ada request ke backend asli. Toast dimock pada integration agar keluaran halaman dapat diperiksa; komponen fitur dan service tidak dimock.

Cakupan di atas adalah cakupan skenario, bukan persentase line/branch coverage. Provider coverage Vitest tidak terpasang dan tidak ditambahkan karena batas perubahan hanya di folder fitur. Pengujian jsdom juga tidak memverifikasi layout responsif secara visual, browser download sungguhan, atau perilaku backend.

## Bug terkonfirmasi (tidak diperbaiki)

1. **Tanggal tidak valid membuat tabel desktop crash.** `components/BackupTable.tsx:71` memanggil Intl.DateTimeFormat.format tanpa pemeriksaan tanggal. Render record dengan `backupDate: "bad-date"` menghasilkan RangeError. Card mobile untuk input sama menampilkan `-`. Dampak: satu record rusak dapat menggagalkan render halaman karena tabel desktop tetap dirender meski tersembunyi pada mobile.
2. **Status filter mobile tidak dapat dibatalkan dengan klik pilihan yang sama.** `components/BackupFilterMobile.tsx:70` mencoba toggle status terpilih menjadi `all`, tetapi CategorySelector memakai native radio yang tidak memicu onChange saat radio terpilih diklik ulang. Reproduksi: klik Berhasil dua kali lalu Terapkan; callback tetap menerima `status: "success"`. Reset masih dapat menghapus filter.

Kedua test dengan awalan `BUG:` adalah test karakterisasi: test lulus jika perilaku bug saat ini berhasil direproduksi. Total 99 passed tidak berarti kedua bug telah diperbaiki. Setelah implementasi diperbaiki di pekerjaan terpisah, ekspektasi kedua test tersebut perlu diperbarui.

## Menjalankan ulang

Dari root repository pada PowerShell:

```powershell
.\node_modules\.bin\vitest.cmd run --config src/features/back-up-data/vitest.config.ts
```

Untuk memperbarui laporan JSON:

```powershell
.\node_modules\.bin\vitest.cmd run --config src/features/back-up-data/vitest.config.ts --reporter=default --reporter=json --outputFile=src/features/back-up-data/__tests__/results.json
```
