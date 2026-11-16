# 05 — BUSINESS RULES
## Bengkel POS — Syuhada Motor

**Versi:** 1.0  
**Status:** Draft Business Rules

> Dokumen ini menjadi acuan aturan bisnis aplikasi. Nilai yang belum ditetapkan secara final dibuat sebagai konfigurasi agar dapat diubah tanpa mengubah kode program.

## 1. Tujuan

Business Rules mengatur Member, Kendaraan, Promo, Barang, Jasa, Transaksi, Point, Saldo, Top Up/Deposit, Pegawai/Komisi, Refund, WhatsApp, dan Audit.

Aturan yang berhubungan dengan uang dan point harus dapat ditelusuri melalui histori/ledger.

## 2. Member

### 2.1 Identitas
1. Satu nomor WhatsApp hanya boleh memiliki satu akun member aktif.
2. Nomor WhatsApp dinormalisasi sebelum disimpan.
3. Nomor WhatsApp tidak boleh duplikat.
4. Member dapat registrasi melalui halaman awal.
5. Member yang sudah terdaftar tidak membuat akun baru.

### 2.2 Registrasi
Halaman awal:

> **Jika Ingin Diskon 15% Silahkan Isi Nomor WhatsApp**

Setelah nomor valid:
- jika belum ada → proses registrasi;
- jika sudah ada → masuk ke akun/member area.

### 2.3 Profil Wajib
Wajib:
- Nomor WhatsApp
- Nama Pemilik
- Nomor Plat Motor
- Jenis Kelamin
- Tanggal Lahir
- Bulan Lahir

Tahun lahir **tidak diwajibkan**.

Pesan:

> **Akan selalu Bonus dan Diskon untuk Member yang datanya lengkap**

Member dengan semua field wajib terisi diberi status `PROFILE_COMPLETED = TRUE`.

### 2.4 Kendaraan
Data kendaraan disimpan terpisah agar satu member dapat memiliki lebih dari satu kendaraan di masa depan.

Minimal:
- Nomor plat
- Jenis kendaraan
- Merek
- Model

## 3. Grand Opening

Promo:

> **DISKON 15% BARANG DAN JASA**

Durasi: **3 hari**.

Tanggal mulai dan berakhir ditentukan admin. Promo tidak boleh hard-coded di source code.

Sistem menggunakan timezone `Asia/Jakarta` dan waktu server.

Default cakupan:
- Barang → 15%
- Jasa → 15%

Transaksi wajib menyimpan harga normal, nilai diskon, dan harga setelah diskon.

Contoh:
```text
Harga normal : Rp100.000
Diskon 15%   : Rp15.000
Total        : Rp85.000
```

## 4. Barang

Master minimal:
- SKU/kode
- Nama
- Kategori
- Satuan
- Harga beli
- Harga jual
- Stok
- Minimum stok
- Status aktif/nonaktif

Penjualan mengurangi stok. Pembatalan/refund menggunakan transaksi koreksi stok, bukan menghapus histori.

## 5. Jasa

Master minimal:
- kode
- nama
- kategori
- harga
- estimasi waktu
- status

Harga jasa saat transaksi disimpan sebagai snapshot.

## 6. Transaksi

Jenis:
- Barang
- Jasa
- Barang + Jasa

Transaksi dapat dibuat untuk member maupun nonmember.

MVP pembayaran:
- Cash
- Saldo Member

Pembayaran cash + saldo dapat disiapkan untuk tahap UAT.

### Pembayaran Saldo
1. Baca saldo tersedia.
2. Cek saldo cukup.
3. Minta konfirmasi.
4. Buat transaksi.
5. Buat wallet debit.
6. Selesaikan transaksi.

Jika saldo tidak cukup, transaksi ditolak.

## 7. Point

Point adalah reward/member loyalty, **bukan uang tunai**.

Point dapat dikonversi menjadi saldo untuk digunakan di Syuhada Motor.

Sumber point dapat berasal dari:
- transaksi;
- promo;
- adjustment admin dengan alasan.

Nilai point per transaksi belum ditetapkan dan harus configurable.

Ledger point minimal:
```text
EARN
REDEEM
EXPIRE
ADJUSTMENT
REVERSAL
```

Contoh aturan konversi:
```text
100 point = RpX saldo
```

Nilai X belum ditetapkan.

### Konversi
```text
Point tersedia
      ↓
Member pilih jumlah
      ↓
Sistem hitung saldo
      ↓
Konfirmasi
      ↓
Point berkurang
      ↓
Saldo bertambah
```

Point tidak dapat ditarik menjadi cash.

## 8. Saldo Member

### 8.1 Sumber
Minimal:
1. `TOPUP_TRANSFER`
2. `TOPUP_DIRECT_ADMIN`
3. `POINT_CONVERSION`

### 8.2 Penggunaan
Saldo digunakan untuk:
- membayar jasa;
- membeli barang;
- membayar transaksi di Syuhada Motor.

### 8.3 Pencairan
Saldo hasil konversi point:

> **Tidak dapat ditarik menjadi cash.**

Saldo hasil top up merupakan saldo penggunaan di sistem. Kebijakan refund saldo top up harus ditentukan Syuhada Motor dan tidak boleh diasumsikan AI/developer.

### 8.4 Ledger
Contoh:
```text
CREDIT  +100.000  TOPUP_TRANSFER
DEBIT    -50.000  PAYMENT
CREDIT   +20.000  POINT_CONVERSION
```

Saldo tidak boleh berubah tanpa ledger.

## 9. Top Up Melalui Transfer

Member:
1. pilih Top Up;
2. masukkan nominal;
3. melihat rekening Syuhada Motor;
4. transfer;
5. upload bukti;
6. submit.

Status awal: `PENDING`.

Sistem mengirim WhatsApp ke admin/Syuhada.

Admin:
1. buka menu Deposit;
2. cek member;
3. cek nominal;
4. lihat bukti;
5. cek rekening;
6. Approve atau Reject.

Approval:
```text
PENDING
   ↓
APPROVED
   ↓
Wallet CREDIT
   ↓
Saldo bertambah
```

Approval harus atomik dan idempotent.

Jika ditolak:
- saldo tidak bertambah;
- alasan wajib dicatat;
- member dapat menerima notifikasi.

## 10. Top Up Langsung Admin

Untuk member yang datang langsung:
1. Admin mencari member.
2. Memasukkan nominal.
3. Memilih `DIRECT_ADMIN`.
4. Konfirmasi.
5. Sistem membuat deposit.
6. Sistem membuat wallet credit.
7. Audit log dibuat.

Status dapat langsung `APPROVED`.

## 11. Anti Double Credit

Sistem wajib mencegah approval dua kali.

Jika admin mengklik Approve dua kali, saldo tetap hanya bertambah satu kali.

Gunakan database transaction, locking, dan idempotency/reference yang sesuai.

## 12. Refund dan Pembatalan

Transaksi finansial tidak dihapus.

Gunakan:
- reversal;
- refund;
- alasan;
- admin pelaksana.

Contoh:
```text
Original:
Wallet DEBIT -100.000

Refund:
Wallet CREDIT +100.000
```

Refund harus memiliki referensi transaksi asal.

Jika transaksi menghasilkan point lalu dibatalkan, point dapat dibalik melalui `REVERSAL` sesuai aturan yang ditetapkan.

## 13. Pegawai dan Komisi

Data minimal:
- nama;
- nomor WhatsApp;
- role;
- status;
- aturan komisi.

Sistem mendukung persentase komisi.

Dasar perhitungan dapat berupa:
- harga normal;
- harga setelah diskon;
- nilai jasa saja;
- kategori tertentu.

**Belum ditetapkan.**

Histori komisi mencatat pegawai, transaksi, dasar perhitungan, persentase, nominal, dan status.

## 14. Urutan Kalkulasi Transaksi

Rekomendasi:
```text
Harga barang/jasa
       ↓
Promo/diskon
       ↓
Subtotal setelah diskon
       ↓
Point dihitung
       ↓
Pembayaran
```

Apakah point dihitung dari harga normal atau setelah diskon **belum ditetapkan** dan harus configurable.

## 15. WhatsApp

### Registrasi
> Terima kasih sudah mendaftar sebagai Member Syuhada Motor.  
> Silakan akses aplikasi melalui link berikut: [LINK APLIKASI]  
>  
> Syuhada Motor akan memberikan layanan terbaik untuk Anda.

Event minimal:
- registrasi;
- pengajuan top up;
- top up approved;
- top up rejected;
- transaksi selesai;
- promo penting.

Jika WhatsApp gagal:
- transaksi tetap dapat berjalan;
- status pengiriman dicatat;
- retry dapat dilakukan;
- retry tidak boleh menggandakan transaksi/saldo.

## 16. Hak Akses

### Member
Dapat melihat/mengubah profil, kendaraan, point, saldo, top up, riwayat, dan promo.

Tidak dapat approve deposit, mengubah saldo, mengubah point manual, atau mengubah harga.

### Kasir/Pegawai
Dapat membuat transaksi dan fungsi lain sesuai permission.

### Admin
Dapat mengelola member, barang, jasa, stok, transaksi, deposit, point, pegawai, promo, dan laporan.

### Super Admin
Memiliki kontrol konfigurasi dan permission tertinggi.

## 17. Audit

Wajib diaudit:
- login admin;
- perubahan role;
- perubahan harga;
- perubahan promo;
- approval/rejection deposit;
- top up langsung;
- adjustment point;
- adjustment saldo;
- konversi point;
- pembayaran saldo;
- refund;
- pembatalan transaksi.

Minimal:
```text
User
Action
Entity
Entity ID
Before
After
Timestamp
IP
User Agent
```

## 18. Konfigurasi Belum Ditentukan

| Parameter | Status |
|---|---|
| Nilai 1 point | BELUM DITETAPKAN |
| Point per transaksi | BELUM DITETAPKAN |
| Masa berlaku point | BELUM DITETAPKAN |
| Nilai konversi point | BELUM DITETAPKAN |
| Minimal top up | BELUM DITETAPKAN |
| Maksimal top up | BELUM DITETAPKAN |
| Rekening bank Syuhada | BELUM DITETAPKAN |
| Aturan refund saldo | BELUM DITETAPKAN |
| Persentase komisi pegawai | BELUM DITETAPKAN |
| Dasar perhitungan komisi | BELUM DITETAPKAN |
| Apakah promo dapat digabung | BELUM DITETAPKAN |
| Maksimal diskon | BELUM DITETAPKAN |
| Aturan point saat promo | BELUM DITETAPKAN |
| Pembayaran cash + saldo | DITENTUKAN SAAT UAT |
| OTP WhatsApp | BELUM DITETAPKAN |

## 19. Konfigurasi Sudah Ditentukan

| Parameter | Nilai |
|---|---|
| Nama Bengkel | Syuhada Motor |
| Produk | Bengkel POS |
| Registrasi awal | Nomor WhatsApp |
| Profil wajib | Plat, nama pemilik, jenis kelamin, tanggal & bulan lahir |
| Tahun lahir | Tidak wajib |
| Pesan profil | Akan selalu Bonus dan Diskon untuk Member yang datanya lengkap |
| Promo Grand Opening | 15% |
| Durasi promo | 3 hari |
| Cakupan promo default | Barang dan Jasa |
| Point | Dapat dikonversi menjadi saldo |
| Point | Tidak dapat ditarik cash |
| Saldo | Dapat digunakan di Syuhada Motor |
| Top Up | Transfer + upload bukti |
| Approval transfer | Admin Syuhada |
| Top Up langsung | Dapat diinput admin |
| Notifikasi | WhatsApp |
| Zona waktu | Asia/Jakarta |

## 20. Checklist Sebelum ERD Final

- [ ] Nilai point
- [ ] Rumus mendapatkan point
- [ ] Nilai konversi point
- [ ] Masa berlaku point
- [ ] Minimal top up
- [ ] Maksimal top up
- [ ] Rekening top up
- [ ] Aturan refund saldo
- [ ] Aturan pembayaran saldo
- [ ] Apakah saldo dapat membayar seluruh barang
- [ ] Apakah saldo dapat membayar seluruh jasa
- [ ] Apakah cash + saldo diperbolehkan
- [ ] Komisi pegawai
- [ ] Dasar komisi
- [ ] Aturan point ketika diskon
- [ ] Apakah promo dapat digabung
- [ ] Maksimal diskon
- [ ] Template WhatsApp
- [ ] Provider WhatsApp
- [ ] OTP/login member

## 21. Prinsip Final

```text
POINT ≠ CASH

POINT
  ↓
KONVERSI
  ↓
SALDO BENGKEL
  ↓
PEMBAYARAN DI SYUHADA MOTOR
```

Sedangkan:

```text
TOP UP
  ↓
VERIFIKASI
  ↓
APPROVED
  ↓
SALDO
```

Setiap transaksi finansial harus:
- tercatat;
- dapat diaudit;
- tidak dapat digandakan;
- tidak dihapus;
- dapat direkonsiliasi.

**Business rule yang belum ditetapkan tidak boleh dibuat berdasarkan asumsi AI/developer.**
