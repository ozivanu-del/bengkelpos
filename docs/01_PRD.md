# 01 — Product Requirements Document (PRD)
## Bengkel POS — Syuhada Motor

**Status:** Draft Fondasi v1.0  
**Target:** Grand Opening lokasi baru ±2 bulan dari tahap perencanaan  
**Promo Grand Opening:** Diskon 15% Barang dan Jasa selama 3 hari

---

## 1. Ringkasan Produk

Bengkel POS Syuhada Motor adalah aplikasi operasional bengkel sekaligus aplikasi member/customer.

Tujuan utama:
1. Mempercepat proses pendaftaran customer sebelum servis.
2. Menjadikan nomor WhatsApp sebagai identitas komunikasi member.
3. Menyimpan profil kendaraan dan pemilik.
4. Mengelola transaksi barang dan jasa bengkel.
5. Mengelola member, point, saldo/deposit, promo, dan riwayat transaksi.
6. Memberikan kanal komunikasi WhatsApp untuk notifikasi.
7. Mendukung operasional kasir/admin dan laporan bengkel.

Aplikasi akan diluncurkan bersamaan dengan Grand Opening lokasi baru.

---

## 2. Konsep Registrasi Customer

### 2.1 Halaman awal

Halaman awal menampilkan:

> **Jika Ingin Diskon 15%, Silahkan Isi Nomor WhatsApp**

Customer mengisi nomor WhatsApp.

Setelah nomor valid:
- Sistem mencari nomor tersebut.
- Jika belum terdaftar → membuat/memberi proses registrasi member.
- Jika sudah terdaftar → membuka aplikasi/member area sesuai status.
- Saat Grand Opening, promo 15% berlaku selama 3 hari sesuai periode yang ditentukan admin.

### 2.2 Profil wajib

Pada pendaftaran pertama, customer diarahkan ke **Update Profil Pengguna**.

Field wajib:
- Nomor WhatsApp
- Nomor plat motor
- Nama pemilik
- Jenis kelamin
- Tanggal lahir
- Bulan lahir

Tahun lahir tidak disimpan sebagai field wajib.

Di bagian atas form:

> **Akan selalu Bonus dan Diskon untuk Member yang datanya lengkap.**

Member tidak dianggap memiliki data lengkap sebelum seluruh field wajib terisi.

### 2.3 Pesan WhatsApp setelah registrasi

Setelah registrasi berhasil, sistem mengirim WhatsApp ke nomor yang didaftarkan.

Isi minimal:
- Terima kasih sudah mendaftar.
- Link aplikasi/member area.
- Informasi bahwa Syuhada Motor akan memberikan layanan terbaik.

Contoh:

> Terima kasih sudah mendaftar sebagai Member Syuhada Motor.  
> Silakan akses aplikasi melalui link berikut: [LINK APLIKASI]  
> Syuhada Motor akan memberikan layanan terbaik untuk Anda.

---

## 3. Modul Utama

### 3.1 Member Area
- Dashboard member
- Profil pengguna
- Data kendaraan
- Point
- Saldo
- Riwayat point
- Riwayat saldo
- Riwayat servis/transaksi
- Promo
- Notifikasi
- Link/contact WhatsApp bengkel

### 3.2 Barang
- Master barang
- Kategori barang
- Satuan
- Harga beli
- Harga jual
- Stok
- Minimum stok
- Riwayat stok
- Barang aktif/nonaktif

### 3.3 Jasa
- Master jasa servis
- Kategori jasa
- Harga jasa
- Estimasi waktu
- Status aktif/nonaktif

### 3.4 Transaksi
- Transaksi servis
- Penjualan barang
- Jasa
- Gabungan barang + jasa
- Diskon
- Promo
- Pembayaran cash
- Pembayaran saldo member
- Penggunaan point → saldo
- Cetak/kirim invoice
- Riwayat transaksi

### 3.5 Pegawai
- Data pegawai
- Role
- Persentase/komisi pegawai
- Perhitungan komisi
- Riwayat komisi

### 3.6 Point
Point merupakan reward member.

Point:
- diperoleh berdasarkan aturan transaksi/promo yang ditentukan admin;
- dapat dikonversi menjadi saldo;
- saldo hasil konversi point hanya dapat digunakan di Syuhada Motor;
- tidak dapat ditarik menjadi cash.

Aturan konversi point harus dapat dikonfigurasi admin, bukan ditanam permanen dalam kode.

### 3.7 Saldo / Deposit

Ada dua sumber saldo:

**A. Saldo hasil Top Up**
- Member mengajukan top up.
- Member mengisi nominal.
- Sistem menampilkan rekening tujuan.
- Member upload bukti transfer.
- Ajuan berstatus `MENUNGGU_VERIFIKASI`.
- Sistem mengirim notifikasi ke WhatsApp admin/bengkel.
- Admin mengecek rekening.
- Admin approve.
- Saldo masuk ke member.

**B. Saldo hasil konversi point**
- Point ditukar menjadi saldo.
- Saldo tersebut hanya dapat digunakan untuk transaksi di Syuhada Motor.
- Tidak dapat dicairkan menjadi cash.

Sistem harus menyimpan `source` saldo agar asal saldo dapat dibedakan dan aturan penggunaannya dapat ditegakkan.

### 3.8 Top Up oleh Admin

Member yang datang langsung dapat melakukan top up melalui admin.

Admin:
- mencari member;
- memasukkan nominal;
- memilih sumber `TOPUP_LANGSUNG`;
- menyimpan transaksi;
- sistem menambahkan saldo;
- riwayat saldo tercatat.

---

## 4. Role Pengguna

### Customer/Member
Dapat:
- registrasi;
- melengkapi profil;
- melihat point;
- melihat saldo;
- mengajukan top up;
- upload bukti transfer;
- melihat transaksi;
- melihat promo;
- menggunakan saldo;
- menukar point sesuai aturan.

### Kasir/Pegawai
Dapat:
- mencari member;
- membuat transaksi;
- menggunakan promo;
- menerima pembayaran;
- menggunakan saldo member;
- melihat data yang diperlukan untuk transaksi.

Hak akses harus mengikuti role.

### Admin
Dapat:
- mengelola master barang;
- mengelola jasa;
- mengelola member;
- mengelola promo;
- memverifikasi deposit;
- input deposit langsung;
- mengelola point;
- mengelola pegawai dan persentase;
- melihat laporan.

### Super Admin
Dapat:
- seluruh hak admin;
- konfigurasi sistem;
- role & permission;
- rekening top up;
- audit log;
- konfigurasi point/saldo/promo.

---

## 5. Alur Utama

### A. Customer datang untuk servis

1. Customer membuka halaman aplikasi.
2. Mengisi nomor WhatsApp.
3. Sistem memeriksa nomor.
4. Customer melengkapi profil jika belum lengkap.
5. Sistem membuka aplikasi.
6. Customer/kasir melanjutkan proses transaksi.
7. Promo 15% otomatis diterapkan jika memenuhi aturan promo.

### B. Top Up via Transfer

1. Member pilih Top Up Saldo.
2. Masukkan nominal.
3. Sistem menampilkan rekening Syuhada Motor.
4. Member transfer.
5. Member upload bukti.
6. Submit.
7. Status menjadi menunggu verifikasi.
8. WhatsApp admin menerima notifikasi.
9. Admin cek mutasi/rekening.
10. Admin approve.
11. Saldo bertambah.
12. Member menerima notifikasi.

### C. Top Up langsung

1. Member datang.
2. Admin mencari member.
3. Admin input nominal.
4. Admin menyimpan.
5. Saldo langsung bertambah.
6. Riwayat mencatat admin dan waktu.

### D. Point menjadi saldo

1. Member membuka Point.
2. Sistem menampilkan point tersedia.
3. Member memilih jumlah point.
4. Sistem menghitung saldo konversi.
5. Member konfirmasi.
6. Sistem mengurangi point.
7. Sistem menambah saldo sumber `POINT_CONVERSION`.
8. Transaksi dicatat di ledger.

---

## 6. Aturan Bisnis Penting

### Promo Grand Opening
- Diskon barang dan jasa: 15%.
- Durasi: 3 hari.
- Periode harus configurable oleh admin.
- Sistem menentukan apakah transaksi berada dalam periode promo berdasarkan waktu server.
- Aturan apakah diskon berlaku per member/transaksi/item harus configurable.
- Sistem harus menyimpan harga normal dan nilai diskon untuk audit.

### Saldo
- Saldo harus menggunakan ledger transaksi, bukan hanya angka yang dapat diedit langsung.
- Setiap perubahan saldo wajib memiliki sumber dan referensi.
- Saldo top up dapat digunakan untuk membayar/membeli produk.
- Saldo hasil point tidak dapat dicairkan.
- Refund/pembatalan harus membalik transaksi melalui transaksi koreksi, bukan menghapus histori.

### Point
- Point tidak boleh diedit sembarangan.
- Penambahan/pengurangan point harus memiliki alasan/referensi transaksi.
- Konversi point harus tercatat.
- Nilai konversi harus configurable.

### WhatsApp
Notifikasi minimal:
- registrasi;
- pengajuan top up;
- top up disetujui;
- top up ditolak;
- transaksi;
- promo penting.

Pengiriman WhatsApp sebaiknya melalui provider/API resmi yang dapat diaudit. Sistem harus menyimpan status pengiriman.

---

## 7. Laporan

Minimal:
- Penjualan harian/bulanan
- Barang terjual
- Jasa terjual
- Stok
- Member baru
- Member aktif
- Point diterbitkan
- Point digunakan
- Saldo masuk
- Saldo digunakan
- Top up menunggu verifikasi
- Top up disetujui/ditolak
- Komisi pegawai
- Promo/diskon
- Transaksi berdasarkan periode
- Audit aktivitas admin

---

## 8. Non-Functional Requirements

- Responsive mobile-first.
- Aman terhadap manipulasi saldo/point.
- Password admin disimpan dengan hashing.
- OTP/verification untuk login member dapat ditambahkan.
- Validasi nomor WhatsApp.
- HTTPS wajib pada production.
- Backup database terjadwal.
- Audit log untuk aktivitas penting.
- Semua nominal uang disimpan sebagai integer dalam satuan Rupiah, bukan floating point.
- Timezone aplikasi: Asia/Jakarta.
- Semua transaksi penting memiliki timestamp server.
- Upload bukti transfer dibatasi tipe/ukuran file.
- File upload tidak boleh dapat mengeksekusi script.
- Role & permission harus diterapkan di backend, bukan hanya disembunyikan di frontend.

---

## 9. MVP Tahap 1

MVP yang disarankan:
1. Registrasi via WhatsApp.
2. Profil member.
3. Member area.
4. Master barang.
5. Master jasa.
6. Transaksi.
7. Promo 15%.
8. Point.
9. Saldo/deposit.
10. Top up member + upload bukti.
11. Approval admin.
12. Top up langsung oleh admin.
13. Riwayat transaksi.
14. WhatsApp notification.
15. Laporan dasar.
16. Role admin/kasir/member.

Fitur lanjutan dapat ditambahkan setelah operasional stabil:
- multi-cabang;
- barcode;
- printer thermal;
- appointment;
- reminder servis;
- stok opname;
- pembelian supplier;
- laporan laba/rugi;
- loyalty tier;
- integrasi payment gateway;
- WhatsApp template automation.

---

## 10. Acceptance Criteria Utama

Sistem dianggap siap MVP jika:
- customer dapat mendaftar dengan nomor WhatsApp;
- profil wajib dapat divalidasi;
- member dapat masuk ke member area;
- admin dapat mengelola barang dan jasa;
- kasir dapat membuat transaksi;
- diskon 15% dapat diterapkan sesuai periode;
- point dapat tercatat;
- point dapat dikonversi menjadi saldo;
- top up transfer dapat diajukan dengan bukti;
- admin dapat approve/reject;
- saldo bertambah hanya setelah status approved;
- top up langsung admin dapat dilakukan;
- saldo hasil point tidak dapat dicairkan;
- transaksi saldo memiliki histori;
- WhatsApp notification dapat dicatat statusnya;
- seluruh perubahan saldo/point memiliki audit trail.
