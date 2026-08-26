# ADR-001: Strategi Branch Git

## Status

Ditetapkan

## Konteks

Project frontend dikembangkan secara kolaboratif oleh dua frontend developer, yaitu FE1 dan FE2.

Keduanya perlu mengerjakan task yang berbeda secara bersamaan tanpa mengganggu pekerjaan satu sama lain, sekaligus tetap menjaga agar kode yang stabil tidak tercampur dengan kode yang masih dalam proses pengembangan.

Oleh karena itu, diperlukan strategi branching yang dapat memisahkan kode stabil, kode hasil integrasi, dan pekerjaan individual.

## Keputusan

Project menggunakan tiga tingkatan branch utama:

```text
main
develop
feature/*
```

Alur pengembangan:

```text
feature/* → develop → main
```

Branch tambahan seperti `fix/*` dan `refactor/*` dapat digunakan sesuai kebutuhan.

## Mengapa Menggunakan `main`?

`main` digunakan untuk merepresentasikan kode yang stabil dan siap digunakan untuk production atau release.

Dengan memisahkan `main` dari proses pengembangan aktif, fitur yang belum selesai tidak langsung dianggap sebagai kode production.

### Alternatif

Semua developer bekerja langsung pada `main`.

### Mengapa Tidak?

Kesalahan atau fitur yang belum selesai dapat langsung memengaruhi branch yang seharusnya berisi kode stabil.

---

## Mengapa Menggunakan `develop`?

`develop` digunakan sebagai tempat integrasi pekerjaan FE1 dan FE2.

Contohnya:

```text
FE1
└── feature/layout-shell
          │
          ▼
       develop
          ▲
          │
FE2
└── feature/design-system
```

Dengan demikian, kedua developer dapat bekerja secara terpisah dan kemudian menggabungkan hasil pekerjaannya pada satu branch integrasi sebelum masuk ke `main`.

### Alternatif

Feature branch langsung di-merge ke `main`.

### Mengapa Tidak?

`main` dapat berisi perubahan yang masih dalam tahap pengembangan atau belum melalui proses integrasi dan review yang memadai.

---

## Mengapa Menggunakan `feature/*`?

Setiap task dikembangkan pada branch tersendiri.

Contoh:

```text
feature/layout-shell
feature/design-system
feature/helpdesk-dashboard
```

Pemisahan ini membuat perubahan:

* Lebih mudah dikembangkan secara independen
* Lebih mudah direview melalui Pull Request
* Lebih mudah diketahui berasal dari task apa
* Lebih kecil kemungkinan mengganggu pekerjaan developer lain

### Alternatif

FE1 dan FE2 bekerja langsung pada `develop`.

### Mengapa Tidak?

Perubahan dari berbagai task akan bercampur sehingga proses review, debugging, dan pembatalan perubahan tertentu menjadi lebih sulit.

---

## Mengapa Menggunakan Pull Request?

Feature branch di-merge ke `develop` melalui Pull Request.

Pull Request menyediakan tempat untuk melakukan review sebelum perubahan menjadi bagian dari branch pengembangan bersama.

Alurnya:

```text
Feature
   ↓
Pull Request
   ↓
Review
   ↓
Merge
```

Dengan demikian, terdapat proses pemeriksaan tambahan sebelum perubahan memengaruhi kode bersama.

---

## Konsekuensi

### Keuntungan

* FE1 dan FE2 dapat bekerja secara paralel.
* Kode stabil terpisah dari kode yang sedang dikembangkan.
* Perubahan dapat direview sebelum diintegrasikan.
* Task lebih mudah dilacak berdasarkan branch.
* Perubahan tertentu lebih mudah diinvestigasi atau dibatalkan.

### Konsekuensi

* Workflow lebih kompleks dibandingkan menggunakan satu branch.
* Developer perlu memahami pengelolaan branch.
* Merge conflict tetap dapat terjadi.
* Pull Request membutuhkan waktu tambahan untuk proses review.

## Dokumentasi Terkait

Lihat [CONTRIBUTING.md](../../CONTRIBUTING.md) untuk workflow pengembangan dan konvensi branch secara lebih lengkap.
