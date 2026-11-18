# PORTOFOLIO PROJEK BOOKSTORE

## JUDUL

BookStore - Aplikasi Toko Buku Online

## PORTFOLIO PROJECT

BookStore merupakan aplikasi toko buku online yang dibuat untuk membantu admin
mengelola katalog dan pesanan, serta membantu user mencari dan membeli buku.

## INTRODUCTION / DESKRIPSI

BookStore memiliki dua aktor utama, yaitu Admin dan User. Admin dapat mengelola
buku, kategori, user, dan pesanan. User dapat melakukan registrasi, login,
mencari buku, memasukkan buku ke keranjang, checkout, dan melakukan pembayaran.

## PROBLEM

Pembelian buku secara manual menyulitkan user dalam melihat katalog, mengetahui
stok, mengirim pesanan, dan memantau status pembayaran. Admin juga membutuhkan
sistem terpusat untuk mengelola data buku, kategori, user, dan pesanan.

## TOOLS

- Frontend: HTML, CSS, JavaScript, React, dan Vite
- Backend: PHP dengan Framework Laravel
- Database: MySQL
- Authentication: JWT
- Payment: Midtrans Snap dan pembayaran di tempat (COD)

Tools pendukung:

- Visual Studio Code
- XAMPP atau MySQL Server
- Browser
- GitHub atau Google Drive untuk pengumpulan project

## OUTPUT

- Website BookStore yang dapat dijalankan secara lokal.
- Dashboard Admin untuk mengelola katalog, user, dan pesanan.
- Halaman User untuk katalog, pencarian, keranjang, checkout, dan pesanan.
- Integrasi pembayaran COD dan Midtrans Sandbox.
- Source code project dan dokumentasi cara menjalankan aplikasi.

Link source code / file project: `ISI_LINK_GITHUB_ATAU_DRIVE_DI_SINI`

Link presentasi: `ISI_LINK_SLIDE_DI_SINI`

## FITUR ADMIN

| Fitur | Status |
| --- | --- |
| Tambah kategori buku | Selesai |
| Update kategori buku | Selesai |
| Hapus kategori buku | Selesai |
| Tambah data buku | Selesai |
| Update data buku | Selesai |
| Hapus data buku | Selesai |
| Melihat user yang terdaftar | Selesai |
| Melihat pesanan user | Selesai |

## FITUR USER

| Fitur | Status |
| --- | --- |
| Registrasi user | Selesai |
| Login user | Selesai |
| Melihat halaman About Us | Selesai |
| Mengirim pesan ke Admin | Selesai |
| Mencari buku | Selesai |
| Menambahkan buku ke keranjang | Selesai |
| Checkout dan pembayaran | Selesai |

## ALUR DEMONSTRASI

1. Buka halaman katalog dan cari judul buku.
2. Buka detail buku, lalu login atau registrasi.
3. Tambahkan buku ke keranjang.
4. Isi nomor telepon dan alamat pengiriman.
5. Pilih COD untuk demo lokal atau Midtrans untuk pembayaran online.
6. Buka halaman pesanan untuk melihat status pesanan.
7. Login sebagai Admin.
8. Buka Dashboard Admin untuk mengelola buku, kategori, user, dan pesanan.
9. Uji halaman Contact dan lihat pesan tersebut dari Dashboard Admin.

## AKUN DEMO

- Admin: `admin@example.com` / `admin123`
- User: `customer@example.com` / `customer123`

## MENJALANKAN APLIKASI

Backend Laravel:

```bash
cd booksales-api
php artisan migrate
php artisan db:seed
php artisan serve
```

Frontend:

```bash
cd booksales/booksales
npm install
npm run dev
```

URL frontend: `http://localhost:5173`

URL backend: `http://127.0.0.1:8000`

## KONFIGURASI MIDTRANS

Isi credential Sandbox Midtrans pada file `.env` backend:

```env
MIDTRANS_SERVER_KEY=isi_server_key_sandbox
MIDTRANS_CLIENT_KEY=isi_client_key_sandbox
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_FINISH_URL=http://localhost:5173/orders
# Set this in Midtrans Dashboard > Settings > Payment Notification URL.
# Localhost is not reachable by Midtrans; use a public HTTPS tunnel for testing.
# https://your-public-host.example/api/payments/notification
```

COD dapat digunakan untuk demo tanpa credential Midtrans. Untuk transaksi online sungguhan, credential Sandbox Midtrans harus diisi terlebih dahulu.

## DATABASE

Tabel utama yang digunakan:

- `users`
- `books`
- `authors`
- `genres`
- `transactions`
- `carts`
- `contacts`

Diagram ERD tersedia di file [`ERD-BOOKSTORE.md`](ERD-BOOKSTORE.md) dan dapat
ditampilkan pada slide presentasi bagian Desain Database.
