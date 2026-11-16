# SIMPLE-PLAN

Frontend untuk web SIMPLE-PLAN.

## Gambaran Umum

Repository ini berisi pengembangan frontend yang dikerjakan secara kolaboratif oleh FE1 dan FE2. Pengembangan menggunakan workflow Git yang telah disepakati serta standar penamaan dan konvensi kode bersama.

## Teknologi

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

## Persiapan dan Menjalankan Project

### 1. Clone repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependency

```bash
npm install
```

### 3. Jalankan development server

```bash
npm run dev
```

## Strategi Branch

Project menggunakan struktur branch berikut:

```text
main
└── Kode stabil / production

develop
└── Branch integrasi pengembangan

feature/*
└── Pengembangan task atau fitur tertentu
```

Alur pengembangan:

```text
feature/* → develop → main
```

Detail workflow dan aturan pengembangan dapat dilihat pada [CONTRIBUTING.md](./CONTRIBUTING.md).

## Struktur Project

Struktur project akan dikembangkan seiring dengan ditetapkannya arsitektur aplikasi.

```text
src/
├── components/
├── features/
├── layouts/
├── pages/
└── ...
```

## Dokumentasi

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Panduan workflow, branch, dan commit.
- [ADR-001: Strategi Branch Git](./docs/decisions/001-git-workflow.md) - Alasan pemilihan workflow Git project.
