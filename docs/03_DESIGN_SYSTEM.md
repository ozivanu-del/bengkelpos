# 03 — DESIGN SYSTEM
## Bengkel POS — Syuhada Motor

**Versi:** 1.0  
**Gaya:** Modern, bersih, cepat, mudah digunakan oleh kasir dan customer.

---

## 1. Brand Direction

Nama:
**Syuhada Motor**

Produk:
**Bengkel POS**

Karakter visual:
- profesional;
- terpercaya;
- otomotif;
- sederhana;
- cepat;
- ramah.

Desain harus terasa seperti aplikasi bengkel, bukan aplikasi perbankan atau marketplace.

---

## 2. Warna

Gunakan token agar warna mudah diganti:

```css
--color-primary: ...
--color-primary-dark: ...
--color-secondary: ...
--color-success: ...
--color-warning: ...
--color-danger: ...
--color-info: ...
--color-background: ...
--color-surface: ...
--color-text: ...
--color-muted: ...
```

Warna brand final ditentukan setelah logo/identitas visual Syuhada Motor ditetapkan.

Rekomendasi:
- warna utama bernuansa otomotif;
- background netral;
- success untuk saldo/approval;
- warning untuk pending;
- danger untuk rejection/error.

Jangan menaruh warna langsung di komponen. Gunakan design token.

---

## 3. Typography

Font:
- gunakan font sans-serif modern;
- prioritas readability pada layar HP.

Hierarki:
- H1: halaman utama
- H2: section
- H3: card/module
- Body: informasi
- Caption: informasi tambahan
- Numeric: angka saldo, point, total transaksi

Nominal uang harus mudah dibaca dan diberi emphasis visual.

---

## 4. Layout

### Member mobile

```text
┌─────────────────────────────┐
│ Syuhada Motor      🔔       │
├─────────────────────────────┤
│ Halo, Budi                  │
│ Member Syuhada Motor       │
│                             │
│ ┌──────────┐ ┌───────────┐ │
│ │ POINT    │ │ SALDO     │ │
│ │ 1.250    │ │ Rp250.000 │ │
│ └──────────┘ └───────────┘ │
│                             │
│ Promo                       │
│ ┌─────────────────────────┐ │
│ │ Diskon Grand Opening 15%│ │
│ └─────────────────────────┘ │
│                             │
│ Aktivitas Terakhir          │
│ ...                         │
├─────────────────────────────┤
│ Home  Transaksi  Point  Profil │
└─────────────────────────────┘
```

### Admin desktop

Sidebar:
- Dashboard
- POS
- Member
- Barang
- Jasa
- Stok
- Transaksi
- Deposit
- Point
- Pegawai
- Promo
- Laporan
- Pengaturan

---

## 5. Halaman Registrasi

Headline:

> **Jika Ingin Diskon 15%, Silahkan Isi Nomor WhatsApp**

Field:
- Nomor WhatsApp

CTA:
> **Lanjutkan**

Informasi kecil:
> Nomor WhatsApp digunakan untuk akun member dan menerima informasi dari Syuhada Motor.

Jangan meminta terlalu banyak data pada halaman pertama.

---

## 6. Halaman Profil Wajib

Top banner:

> **Akan selalu Bonus dan Diskon untuk Member yang datanya lengkap**

Form:
- Nomor WhatsApp — readonly
- Nama Pemilik
- Nomor Plat Motor
- Jenis Kelamin
- Tanggal Lahir
- Bulan Lahir

CTA:
> **Simpan Profil**

Progress indicator dapat digunakan:

```text
Profil Member
████████░░ 80%
```

---

## 7. Member Dashboard

Card utama:
1. Point tersedia.
2. Saldo tersedia.
3. Promo aktif.
4. Status data profil.

CTA:
- Top Up Saldo
- Tukar Point
- Riwayat Transaksi
- Lengkapi Profil

---

## 8. Top Up

Flow UI:

```text
Nominal
   ↓
Pilih/lihat rekening Syuhada Motor
   ↓
Transfer
   ↓
Upload bukti
   ↓
Submit
   ↓
Menunggu Verifikasi
```

Status badge:
- Menunggu Verifikasi
- Disetujui
- Ditolak

Saat pending:

> Pengajuan Anda sedang diperiksa oleh Syuhada Motor. Saldo akan bertambah setelah pembayaran diverifikasi.

---

## 9. POS Kasir

POS harus mengutamakan kecepatan.

Layout:
```text
┌──────────────────┬────────────────────┐
│ Cari barang/jasa │ Keranjang          │
│                  │                    │
│ [search]         │ Oli       1 x ... │
│                  │ Servis    1 x ... │
│                  │                    │
│                  │ Subtotal           │
│                  │ Diskon             │
│                  │ TOTAL              │
│                  │                    │
│                  │ Member / Nonmember │
│                  │ Bayar              │
└──────────────────┴────────────────────┘
```

Fungsi:
- pencarian cepat;
- barcode bila tersedia;
- pilih member;
- otomatis membaca promo;
- pilihan pembayaran;
- konfirmasi sebelum transaksi selesai.

---

## 10. Visualisasi Saldo

Saldo harus dibedakan dari point.

Contoh:

**Saldo**
> Rp 250.000

**Point**
> 1.250 Poin

Jika diperlukan, tampilkan informasi:

> Sebagian saldo berasal dari konversi point dan hanya dapat digunakan untuk transaksi di Syuhada Motor.

---

## 11. Status UI

Gunakan pola konsisten:

| Status | Makna |
|---|---|
| Success | Berhasil/disetujui |
| Warning | Menunggu/perlu tindakan |
| Danger | Ditolak/gagal |
| Info | Informasi |

Jangan menggunakan warna saja sebagai satu-satunya indikator. Tambahkan teks/icon.

---

## 12. Button

Primary:
- Simpan
- Lanjutkan
- Bayar
- Ajukan Top Up

Secondary:
- Kembali
- Batal
- Lihat Detail

Danger:
- Tolak
- Batalkan

Button:
- tinggi nyaman untuk touchscreen;
- area klik cukup besar;
- disabled state jelas;
- loading state saat request berlangsung.

---

## 13. Empty State

Contoh:

> Belum ada transaksi  
> Riwayat transaksi servis Anda akan muncul di sini.

Jangan menampilkan halaman kosong tanpa penjelasan.

---

## 14. Error Message

Pesan harus manusiawi.

Buruk:
> Error 500

Lebih baik:
> Data belum dapat disimpan. Silakan coba lagi.

Untuk validasi:
> Nomor WhatsApp wajib diisi.

---

## 15. Invoice

Invoice minimal:
- Logo/nama Syuhada Motor
- nomor invoice
- tanggal
- nama member
- nomor WhatsApp
- plat motor
- kasir
- barang
- jasa
- subtotal
- diskon
- total
- pembayaran
- saldo digunakan
- point diperoleh
- ucapan terima kasih

---

## 16. Grand Opening UI

Selama promo:

Banner:

> **GRAND OPENING SYUHADA MOTOR**
>
> **DISKON 15% BARANG & JASA**
>
> Berlaku selama 3 hari.

Tanggal promo harus berasal dari database/configuration, bukan teks hard-coded.

---

## 17. Responsive

Prioritas:
1. Mobile member.
2. Tablet kasir.
3. Desktop admin.

Breakpoints mengikuti framework yang digunakan.

---

## 18. Accessibility

- kontras teks memadai;
- form memiliki label;
- error dikaitkan dengan field;
- keyboard navigation untuk admin;
- jangan menggunakan placeholder sebagai satu-satunya label;
- icon penting memiliki text/aria label.

---

## 19. UX Rules

- Jangan membuat member mengisi data yang belum diperlukan.
- Satu layar = satu tujuan utama.
- Gunakan konfirmasi untuk transaksi finansial.
- Tampilkan nominal dengan format Rupiah.
- Selalu tampilkan status transaksi.
- Hindari pop-up berlebihan.
- Loading harus terlihat.
- Jangan menghilangkan data yang sudah diketik ketika validasi gagal.
