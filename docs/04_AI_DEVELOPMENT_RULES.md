# 04 — AI DEVELOPMENT RULES
## Aturan Pengembangan Aplikasi Bengkel POS — Syuhada Motor

Dokumen ini menjadi aturan kerja untuk AI coding assistant/developer.

---

## 1. Prinsip Utama

AI harus:
1. Memahami PRD sebelum menulis kode.
2. Mengutamakan keamanan transaksi.
3. Tidak mengubah business rule tanpa alasan.
4. Tidak membuat asumsi finansial yang tidak ditentukan.
5. Menjaga backward compatibility.
6. Menulis kode yang dapat diuji.
7. Menghindari over-engineering pada MVP.

---

## 2. Source of Truth

Urutan prioritas:

```text
01_PRD.md
02_ARCHITECTURE.md
03_DESIGN_SYSTEM.md
04_AI_DEVELOPMENT_RULES.md
↓
Keputusan eksplisit user
↓
Kode existing yang sudah tervalidasi
↓
Asumsi teknis
```

Jika requirement bertentangan, jangan diam-diam memilih salah satunya. Tandai konflik dan gunakan requirement terbaru yang eksplisit.

---

## 3. Jangan Mengarang Business Rule

AI dilarang menentukan sendiri:
- nilai rupiah per point;
- jumlah point per transaksi;
- batas minimal top up;
- masa berlaku point;
- batas saldo;
- biaya admin;
- aturan refund;
- batas penggunaan promo;
- komisi pegawai;
- rekening bank.

Jika belum ditentukan, buat konfigurasi/placeholder.

---

## 4. Aturan Uang

Semua nominal:
- integer Rupiah;
- tidak menggunakan floating point untuk perhitungan uang;
- setiap perubahan saldo melalui ledger;
- tidak boleh menghapus transaksi finansial.

Contoh yang dilarang sebagai source of truth:

```php
$member->balance += $amount;
```

Gunakan service transaksi/ledger.

---

## 5. Aturan Point

Point wajib menggunakan ledger.

Contoh:

```text
EARN +100
REDEEM -100
REVERSAL +100
ADJUSTMENT +/-N
```

Konversi point:
1. validasi jumlah point;
2. lock data bila diperlukan;
3. kurangi point;
4. buat credit saldo;
5. simpan reference;
6. audit;
7. commit transaction.

---

## 6. Aturan Saldo

Saldo harus dapat dijelaskan dari histori.

Setiap entry memiliki:
- member;
- amount;
- direction;
- source;
- reference;
- timestamp;
- actor.

Source minimal:
- TOPUP_TRANSFER
- TOPUP_DIRECT_ADMIN
- POINT_CONVERSION
- PAYMENT
- REFUND
- ADJUSTMENT

Saldo hasil `POINT_CONVERSION` tidak boleh dicairkan.

Saldo hasil top up dapat digunakan sesuai aturan bisnis Syuhada Motor.

---

## 7. Deposit Approval

Jangan menambahkan saldo saat member baru mengirim pengajuan.

Urutan:

```text
SUBMIT
  ↓
PENDING
  ↓
ADMIN REVIEW
  ↓
APPROVED
  ↓
CREATE CREDIT LEDGER
```

Jika REJECTED:
- saldo tidak berubah.

Approval harus idempotent agar double click tidak menggandakan saldo.

---

## 8. Concurrency

Untuk operasi:
- approve deposit;
- pembayaran saldo;
- redeem point;
- refund;
- adjustment;

gunakan database transaction dan locking yang sesuai.

Sistem harus mencegah:
- saldo minus karena race condition;
- deposit masuk dua kali;
- point terpakai dua kali.

---

## 9. Audit

Audit wajib untuk:
- approval/rejection deposit;
- adjustment saldo;
- adjustment point;
- refund;
- perubahan promo;
- perubahan harga;
- perubahan role;
- perubahan rekening top up.

Jangan menyimpan password atau secret di audit log.

---

## 10. Authorization

Jangan hanya menyembunyikan menu.

Contoh:
```text
Frontend: menu Approve Deposit tidak tampil untuk Kasir.
Backend: endpoint Approve Deposit juga menolak Kasir.
```

Authorization harus selalu diperiksa server-side.

---

## 11. WhatsApp

Buat abstraction:

```text
NotificationService
```

Business logic tidak boleh bergantung langsung pada nama provider.

Simpan:
- nomor tujuan;
- event;
- status;
- waktu;
- provider message ID jika ada;
- error code/message bila gagal.

Jangan mengirim pesan WhatsApp berulang akibat retry tanpa idempotency.

---

## 12. Nomor WhatsApp

Normalisasi nomor sebelum disimpan.

Contoh:
```text
081234567890
+6281234567890
6281234567890
```

harus dipetakan ke satu format internal.

Gunakan unique constraint pada nomor member setelah normalisasi.

Jangan mengekspos nomor member ke publik tanpa kebutuhan.

---

## 13. Profil Member

Field awal:
- WhatsApp
- nama pemilik
- plat motor
- jenis kelamin
- tanggal lahir
- bulan lahir

Tahun lahir tidak diwajibkan.

Bila sistem nanti membutuhkan data tambahan, buat migration baru dan jangan merusak data lama.

---

## 14. Plat Nomor

Normalisasi plat untuk pencarian:
- uppercase;
- trim;
- hilangkan spasi berlebih.

Tetap pertimbangkan menyimpan format tampilan asli bila diperlukan.

Contoh:
`BA 1234 XX` dan `BA1234XX` dapat diarahkan ke canonical search key yang sama.

---

## 15. Promo 15%

Jangan hard-code:

```text
discount = 15%
```

Gunakan promotion record:
- name;
- start_at;
- end_at;
- discount;
- scope;
- condition;
- status.

Harga normal tetap dicatat.

Contoh:
```text
Normal      Rp100.000
Discount   -Rp15.000
Total       Rp85.000
```

---

## 16. Database

Gunakan:
- foreign key;
- unique constraint;
- index untuk pencarian yang sering;
- enum/status yang konsisten;
- created_at/updated_at;
- soft delete untuk master yang memang perlu histori.

Jangan melakukan hard delete terhadap:
- transaksi;
- ledger;
- deposit approved;
- audit log.

---

## 17. API

API harus:
- authenticated jika data privat;
- authorized;
- tervalidasi;
- memiliki response konsisten;
- memiliki error handling;
- memiliki idempotency untuk endpoint finansial bila relevan.

Contoh response:

```json
{
  "success": true,
  "message": "Deposit berhasil diajukan",
  "data": {}
}
```

---

## 18. File Upload Bukti Transfer

Validasi:
- MIME type;
- extension;
- file size;
- image dimensions bila diperlukan.

Simpan di private storage.

Jangan mengandalkan extension sebagai validasi keamanan.

Download harus melalui endpoint terotorisasi.

---

## 19. Frontend

Gunakan:
- reusable component;
- design token;
- consistent spacing;
- responsive layout.

Jangan mengulang style yang sama di banyak file.

---

## 20. Coding Style

AI harus:
- memberikan nama variabel jelas;
- menghindari fungsi terlalu panjang;
- memisahkan business logic dari controller/UI;
- membuat service untuk proses kompleks;
- memberi komentar hanya jika membantu memahami alasan/aturan;
- tidak membuat dead code;
- tidak meninggalkan debug statement.

---

## 21. Migration Rule

Setiap perubahan struktur database:
1. migration;
2. model update;
3. validation update;
4. service update;
5. test;
6. dokumentasi bila business rule berubah.

Jangan mengubah database production secara manual sebagai solusi permanen.

---

## 22. Testing

Minimal test:
- registrasi member;
- profil lengkap;
- promo 15%;
- transaksi barang;
- transaksi jasa;
- point earn;
- point redeem;
- point → saldo;
- top up pending;
- approve top up;
- reject top up;
- top up langsung admin;
- pembayaran dengan saldo;
- saldo tidak cukup;
- double approval;
- authorization role.

---

## 23. Definition of Done

Fitur dianggap selesai jika:
- requirement terpenuhi;
- validasi tersedia;
- authorization tersedia;
- error handling tersedia;
- audit tersedia untuk transaksi penting;
- test tersedia;
- mobile responsive;
- tidak ada console/debug error;
- migration tersedia jika DB berubah;
- dokumentasi teknis diperbarui jika diperlukan.

---

## 24. Aturan Perubahan AI

Jika AI diminta mengubah fitur:
1. Identifikasi file/modul terdampak.
2. Jelaskan perubahan secara singkat.
3. Pertahankan fitur existing.
4. Hindari rewrite seluruh aplikasi kecuali diminta.
5. Jangan menghapus data.
6. Jangan mengubah struktur database tanpa migration.
7. Setelah perubahan, cek regresi.

---

## 25. Format Output AI Coding

Untuk perubahan kode yang cukup besar, AI sebaiknya memberikan:

```text
1. Tujuan perubahan
2. File yang dibuat/diubah
3. Migration
4. Backend/service
5. Frontend
6. Test
7. Cara menjalankan
8. Checklist hasil
```

Jika user meminta "kode lengkap", berikan file lengkap yang dapat langsung dicopy, bukan potongan yang kehilangan konteks.

---

## 26. Roadmap Teknis

### Sprint 1
- Project setup
- Auth
- Role
- Member registration
- Member profile

### Sprint 2
- Product
- Service
- Inventory
- POS

### Sprint 3
- Promotion
- Point ledger
- Wallet ledger
- Deposit

### Sprint 4
- WhatsApp
- Reports
- Audit
- Testing
- Security hardening

### Sprint 5
- UAT
- Training kasir/admin
- Backup/restore test
- Grand opening configuration
- Production deployment

---

## 27. Catatan Penting untuk Grand Opening

Karena aplikasi akan diluncurkan bersamaan dengan Grand Opening, sebelum production wajib dilakukan:

- test promo 15%;
- test tanggal mulai dan berakhir;
- test transaksi ramai;
- test registrasi banyak member;
- test WhatsApp;
- test top up;
- test approval;
- test pembayaran saldo;
- test printer/invoice jika digunakan;
- backup database;
- uji restore;
- siapkan akun admin cadangan;
- siapkan prosedur manual jika internet/provider WhatsApp bermasalah.

Aplikasi harus tetap dapat diaudit jika terjadi transaksi manual saat gangguan.

---

## 28. Prinsip Final

**Jangan mengejar banyak fitur sebelum transaksi inti stabil.**

Urutan prioritas:

```text
Member
  ↓
POS
  ↓
Promo
  ↓
Point
  ↓
Saldo
  ↓
Deposit
  ↓
WhatsApp
  ↓
Laporan
  ↓
Fitur lanjutan
```

Keamanan dan ketepatan transaksi finansial lebih penting daripada banyaknya fitur.
