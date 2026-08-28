# ADR-002: Konvensi Struktur Folder dan Coding

## Status

Ditetapkan

## Konteks

Project frontend dikembangkan secara kolaboratif oleh dua frontend developer, yaitu FE1 dan FE2.

Dengan adanya beberapa fitur dan komponen yang dikembangkan secara bersamaan, diperlukan struktur folder dan aturan penamaan yang konsisten agar kode lebih mudah dipahami, dicari, dan dikembangkan oleh seluruh developer.

Tanpa adanya konvensi yang jelas, struktur project dapat menjadi tidak konsisten karena setiap developer memiliki cara berbeda dalam menempatkan file, memberi nama folder, komponen, maupun fungsi.

Oleh karena itu, diperlukan panduan mengenai struktur folder dan coding convention yang digunakan dalam project.

## Keputusan

Project menggunakan pemisahan folder berdasarkan fungsi dan fitur.

Struktur utama:

```text
src/
├── components/
├── features/
├── pages/
├── services/
├── hooks/
└── utils/


src/components

Digunakan untuk menyimpan komponen yang bersifat reusable dan dapat digunakan oleh beberapa bagian project.

Contoh:

src/components/
├── Button/
├── Navbar/
├── Modal/
└── Card/
src/features

Digunakan untuk menyimpan kode yang berkaitan dengan fitur tertentu.

Contoh:

src/features/
├── auth/
├── helpdesk/
├── dashboard/
└── profile/

Setiap feature dapat memiliki komponen, hooks, service, dan file lain yang hanya berkaitan dengan feature tersebut.

Contoh:

src/features/helpdesk/
├── components/
├── hooks/
├── services/
└── pages/
Konvensi Penamaan
Folder

Nama folder menggunakan kebab-case untuk folder umum.

Contoh:

helpdesk-dashboard/
user-management/
design-system/

Untuk folder component, nama folder mengikuti nama component menggunakan PascalCase.

Contoh:

Button/
Navbar/
UserCard/
Component

Nama component menggunakan PascalCase.

Contoh:

UserCard
DashboardHeader
HelpdeskTable
Function dan Variable

Nama function dan variable menggunakan camelCase.

Contoh:

getUserData
handleSubmit
userData
isLoading
Constant

Nilai yang bersifat konstan menggunakan UPPER_SNAKE_CASE.

Contoh:

API_URL
MAX_RETRY
DEFAULT_PAGE_SIZE
Coding Convention

Beberapa aturan coding yang digunakan:

Menggunakan nama variable dan function yang jelas dan deskriptif.
Menghindari nama variable yang terlalu singkat dan tidak memiliki konteks.
Satu component sebaiknya memiliki satu tanggung jawab utama.
Logic yang digunakan berulang sebaiknya dipisahkan menjadi function atau hook yang reusable.
Menghindari duplikasi kode.
Menggunakan format dan indentation yang konsisten.
Setiap perubahan kode harus mengikuti struktur folder dan aturan penamaan yang telah ditetapkan.
Mengapa Menggunakan Konvensi Ini?

Konvensi ini digunakan agar:

Struktur project lebih mudah dipahami.
Developer dapat menemukan file dengan lebih cepat.
Penamaan file dan kode menjadi konsisten.
Komponen dapat digunakan kembali dengan lebih mudah.
Proses code review menjadi lebih sederhana.
Developer baru dapat memahami struktur project dengan lebih cepat.
Alternatif

Setiap developer bebas menentukan struktur folder dan penamaan kode sesuai kebiasaan masing-masing.

Mengapa Tidak?

Struktur project dapat menjadi tidak konsisten dan menyulitkan developer lain ketika mencari, menggunakan, atau mengubah kode.

Konsekuensi
Keuntungan
Struktur folder menjadi lebih terorganisir.
Penamaan kode lebih konsisten.
Komponen reusable lebih mudah ditemukan.
Pengembangan fitur dapat dilakukan dengan struktur yang jelas.
Mempermudah proses maintenance dan code review.
Konsekuensi
Developer harus mengikuti aturan penamaan yang telah ditentukan.
Beberapa file perlu ditempatkan pada struktur folder tertentu.
Developer perlu menyesuaikan diri dengan convention sebelum mengembangkan fitur baru.
Dokumentasi Terkait

Lihat CONTRIBUTING.md untuk workflow pengembangan dan panduan coding convention secara lebih lengkap.