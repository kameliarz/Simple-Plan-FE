# Panduan Kontribusi

Dokumen ini menjelaskan workflow pengembangan dan konvensi yang digunakan oleh tim frontend.

## 1. Workflow Pengembangan

Pengembangan menggunakan alur:

```text
feature/* → develop → main
```

### Langkah 1: Perbarui `develop`

Sebelum memulai task baru, pastikan branch `develop` lokal sudah menggunakan versi terbaru.

```bash
git checkout develop
git pull origin develop
```

### Langkah 2: Buat Feature Branch

Buat branch berdasarkan task yang akan dikerjakan.

```bash
git checkout -b feature/<nama-task>
```

Contoh:

```text
feature/layout-shell
feature/sidebar
feature/helpdesk-dashboard
feature/inventory-dashboard
```

Untuk perbaikan bug:

```text
fix/<nama-task>
```

Contoh:

```text
fix/sidebar-responsive
```

### Langkah 3: Kerjakan Task

Kerjakan perubahan sesuai ruang lingkup task pada branch tersebut.

Hindari mencampurkan perubahan yang tidak berkaitan dengan task yang sedang dikerjakan.

### Langkah 4: Commit Perubahan

Project menggunakan Conventional Commits.

Format:

```text
<type>: <deskripsi>
```

Jenis commit yang umum digunakan:

| Type       | Penggunaan                                     |
| ---------- | ---------------------------------------------- |
| `feat`     | Menambahkan fitur                              |
| `fix`      | Memperbaiki bug                                |
| `refactor` | Mengubah struktur kode tanpa mengubah behavior |
| `style`    | Perubahan formatting atau styling              |
| `chore`    | Konfigurasi atau pemeliharaan project          |
| `docs`     | Perubahan dokumentasi                          |
| `test`     | Menambahkan atau mengubah test                 |
| `ci`       | Konfigurasi CI/CD                              |

Contoh:

```bash
git commit -m "feat: tambah layout utama aplikasi"
git commit -m "fix: perbaiki responsivitas sidebar"
git commit -m "refactor: rapikan struktur komponen layout"
git commit -m "chore: konfigurasi eslint"
git commit -m "docs: perbarui panduan kontribusi"
```

### Langkah 5: Push Branch

```bash
git push -u origin feature/<nama-task>
```

### Langkah 6: Buat Pull Request

Buat Pull Request dari feature branch menuju `develop`.

```text
feature/<nama-task>
        ↓
     develop
```

Pull Request sebaiknya menjelaskan:

- Perubahan yang dilakukan
- Alasan perubahan
- Detail implementasi yang penting
- Keterbatasan atau masalah yang masih diketahui

### Langkah 7: Review dan Merge

Perubahan harus melalui proses review sebelum di-merge ke `develop`.

Branch `main` tidak digunakan untuk pengembangan fitur secara langsung.

---

## 2. Konvensi Branch

### `main`

Berisi kode yang stabil dan siap digunakan untuk production atau release.

Pengembangan fitur tidak dilakukan langsung pada branch ini.

### `develop`

Berisi hasil integrasi pengembangan FE1 dan FE2.

Branch ini menjadi tujuan utama merge dari feature branch.

### `feature/*`

Digunakan untuk mengembangkan fitur atau task tertentu.

Format:

```text
feature/<nama-task>
```

Contoh:

```text
feature/layout-shell
feature/navbar
feature/helpdesk-ticket
feature/inventory
```

### `fix/*`

Digunakan untuk memperbaiki bug.

Format:

```text
fix/<nama-task>
```

Contoh:

```text
fix/sidebar-overflow
```

### `refactor/*`

Digunakan untuk perubahan atau perbaikan struktur kode tanpa menambahkan fitur baru.

Contoh:

```text
refactor/component-structure
```

---

## 3. Konvensi Commit

Gunakan Conventional Commits pada setiap commit.

Contoh yang baik:

```text
feat: tambah navigasi sidebar
fix: perbaiki overflow sidebar
refactor: rapikan struktur komponen layout
chore: konfigurasi eslint
```

Hindari commit message yang terlalu umum seperti:

```text
update
fix
changes
final
final fix
fix lagi
```

Commit message harus menjelaskan tujuan perubahan secara jelas sehingga pembaca tidak perlu membuka seluruh perubahan kode hanya untuk memahami apa yang terjadi.

---

## 4. Konvensi Pull Request

Pull Request harus:

1. Ditujukan ke `develop`.
2. Memiliki judul yang jelas.
3. Menjelaskan perubahan yang dilakukan.
4. Tidak mencampurkan perubahan yang tidak berkaitan.
5. Melalui proses review sebelum di-merge.

Contoh:

```text
feature/layout-shell
        ↓
   Pull Request
        ↓
     develop
```

---

## 5. Kolaborasi FE1 dan FE2

FE1 bertanggung jawab terutama pada arsitektur frontend, development tooling, layout shell, dan kebutuhan integrasi.

FE2 bertanggung jawab terutama pada design system, reusable UI component, dan UI mocking.

Keduanya perlu berkoordinasi ketika perubahan berkaitan dengan struktur bersama seperti:

- `components/`
- `layouts/`
- design token
- reusable UI component
- routing
- konfigurasi aplikasi

Keputusan yang memengaruhi struktur bersama perlu didiskusikan sebelum implementasi.

---

## 6. Aturan Umum

- Kerjakan perubahan sesuai ruang lingkup task.
- Ambil perubahan terbaru dari `develop` sebelum memulai task baru.
- Gunakan nama branch yang deskriptif.
- Gunakan Conventional Commits.
- Jangan melakukan direct push untuk pekerjaan fitur ke `main`.
- Jangan menyimpan API key, credential, atau secret di repository.
- Komunikasikan perubahan struktur kepada frontend developer lainnya sebelum implementasi.
