# 02 — Architecture
## Bengkel POS — Syuhada Motor

**Versi:** 1.0

---

## 1. Prinsip Arsitektur

Aplikasi dibangun sebagai sistem web responsive dengan pemisahan:
- Presentation
- Application/Business Logic
- Data Access
- Database
- Integration

Prioritas arsitektur:
1. Aman.
2. Mudah dirawat.
3. Mudah dikembangkan.
4. Cocok untuk mobile.
5. Siap dikembangkan menjadi multi-cabang.
6. Transaksi finansial dapat diaudit.

---

## 2. Arsitektur Logis

```text
                    ┌──────────────────────┐
                    │     Member / Kasir   │
                    │     Admin / Owner    │
                    └──────────┬───────────┘
                               │ HTTPS
                               ▼
                    ┌──────────────────────┐
                    │    Web Application   │
                    │ UI + API + Auth      │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      ┌─────────────┐   ┌─────────────┐   ┌──────────────┐
      │ POS Service │   │ Member/     │   │ Notification │
      │             │   │ Loyalty     │   │ Service      │
      └──────┬──────┘   └──────┬──────┘   └──────┬───────┘
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │ or MySQL/MariaDB     │
                    └──────────────────────┘
                               │
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
      ┌───────────────┐                   ┌───────────────┐
      │ File Storage  │                   │ WhatsApp API  │
      │ Bukti Transfer│                   │ Provider      │
      └───────────────┘                   └───────────────┘
```

---

## 3. Rekomendasi Stack

Stack dapat disesuaikan dengan kemampuan developer/hosting.

### Opsi utama
- Backend: Laravel
- Frontend: Blade + Tailwind/Bootstrap
- Database: MySQL/MariaDB atau PostgreSQL
- Cache/queue: Redis bila tersedia
- Web server: Nginx/Apache
- Storage: local/private storage atau object storage
- WhatsApp: API/provider resmi yang sesuai kebutuhan bisnis

Untuk MVP, jangan menggunakan microservices. Gunakan **modular monolith**.

---

## 4. Modul Backend

```text
Modules/
├── Auth
├── Member
├── Vehicle
├── Product
├── Service
├── Inventory
├── POS
├── Promotion
├── Loyalty
├── Wallet
├── Deposit
├── Employee
├── Commission
├── Notification
├── Reporting
├── Settings
└── Audit
```

---

## 5. Model Data Utama

### users
- id
- role_id
- phone
- password_hash nullable untuk member
- status
- last_login_at
- created_at
- updated_at

### member_profiles
- id
- user_id
- owner_name
- gender
- birth_day
- birth_month
- profile_completed_at

### vehicles
- id
- member_id
- plate_number
- vehicle_type
- brand
- model
- year nullable
- status

Walaupun kebutuhan awal hanya satu motor, gunakan tabel kendaraan terpisah agar kelak satu member dapat memiliki lebih dari satu kendaraan.

### employees
- id
- user_id
- name
- commission_type
- commission_value
- status

### products
- id
- sku
- barcode nullable
- name
- category_id
- unit
- purchase_price
- selling_price
- stock
- minimum_stock
- status

### services
- id
- code
- name
- category_id
- price
- estimated_minutes
- status

### transactions
- id
- invoice_number
- member_id nullable
- cashier_id
- subtotal
- discount_amount
- total
- payment_status
- transaction_status
- occurred_at

### transaction_items
- id
- transaction_id
- item_type (`PRODUCT`/`SERVICE`)
- product_id nullable
- service_id nullable
- name_snapshot
- qty
- unit_price
- discount
- subtotal

Simpan snapshot nama dan harga agar histori tidak berubah ketika master barang/jasa diedit.

### promotions
- id
- name
- discount_type
- discount_value
- start_at
- end_at
- scope
- conditions
- status

### points_ledger
- id
- member_id
- type (`EARN`, `REDEEM`, `ADJUSTMENT`, `EXPIRE`, `REVERSAL`)
- points
- reference_type
- reference_id
- description
- created_by
- created_at

Jangan hanya menyimpan `point_balance`. Saldo point dapat dihitung dari ledger atau menggunakan balance yang selalu direkonsiliasi.

### wallets
- id
- member_id
- wallet_type (`TOPUP`, `POINT_CONVERSION`)
- currency
- status

Untuk desain yang lebih aman, satu member dapat memiliki satu wallet ledger tetapi setiap entry memiliki `source_type`.

### wallet_ledger
- id
- member_id
- direction (`CREDIT`/`DEBIT`)
- amount
- source_type (`TOPUP`, `POINT_CONVERSION`, `PAYMENT`, `REFUND`, `ADJUSTMENT`)
- reference_type
- reference_id
- description
- created_by
- created_at

### deposits
- id
- member_id
- amount
- method (`TRANSFER`, `DIRECT_ADMIN`)
- bank_account_id nullable
- proof_file nullable
- status (`PENDING`, `APPROVED`, `REJECTED`)
- submitted_at
- reviewed_at
- reviewed_by
- rejection_reason

### bank_accounts
- id
- bank_name
- account_name
- account_number
- status

### employee_commissions
- id
- employee_id
- transaction_id
- base_amount
- percentage
- commission_amount
- status

### notifications
- id
- user_id nullable
- channel
- event_type
- destination
- message_reference
- provider_message_id nullable
- status
- sent_at

### audit_logs
- id
- user_id
- action
- entity_type
- entity_id
- old_values
- new_values
- ip_address
- user_agent
- created_at

---

## 6. Aturan Saldo yang Wajib

Jangan membuat fitur seperti:

```text
member.saldo = member.saldo + 100000
```

sebagai satu-satunya sumber kebenaran.

Gunakan ledger:

```text
Deposit Approved
        │
        ▼
Wallet Ledger CREDIT 100000
        │
        ▼
Available Balance
```

Saat saldo digunakan:

```text
POS Payment
    │
    ▼
Wallet Ledger DEBIT
    │
    ▼
Available Balance berkurang
```

Konversi point:

```text
Point Ledger DEBIT
       │
       ▼
Wallet Ledger CREDIT
source = POINT_CONVERSION
```

Dengan desain ini, histori dan audit dapat diperiksa.

---

## 7. Transaksi Atomik

Approval deposit wajib menggunakan database transaction:

```text
BEGIN
  lock deposit
  verify status = PENDING
  change deposit → APPROVED
  create wallet ledger CREDIT
  create audit log
COMMIT
```

Jika salah satu langkah gagal, semuanya rollback.

Untuk pembayaran menggunakan saldo:
```text
BEGIN
  lock member wallet/ledger
  calculate available balance
  verify sufficient balance
  create POS transaction
  create wallet DEBIT
  create audit log
COMMIT
```

---

## 8. Keamanan

Wajib:
- HTTPS.
- CSRF protection.
- Input validation.
- Authorization di server.
- Password hashing.
- Rate limit untuk login/OTP.
- Audit log.
- Private storage untuk bukti transfer.
- Signed/authorized download untuk file bukti.
- MIME validation dan ukuran upload.
- SQL parameter binding/ORM.
- XSS protection.
- Backup.
- Database transaction untuk saldo/point.

Nomor WhatsApp adalah data pribadi dan harus diperlakukan sebagai data customer.

---

## 9. WhatsApp Integration

Gunakan service abstraction:

```text
NotificationService
      │
      ├── WhatsAppProvider
      └── FutureProvider
```

Aplikasi tidak boleh mengikat seluruh business logic langsung ke provider WhatsApp.

Contoh event:
- MemberRegistered
- DepositSubmitted
- DepositApproved
- DepositRejected
- TransactionCompleted
- PromotionStarted

Gunakan queue jika provider mendukung dan volume mulai meningkat.

---

## 10. Deployment

Minimal production:

```text
Internet
   │
HTTPS
   │
Web Server
   │
Application
   ├── Database
   ├── Storage
   ├── Queue
   └── WhatsApp API
```

Backup:
- database harian;
- backup off-server;
- retensi minimal beberapa minggu;
- uji restore secara berkala.

---

## 11. Kesiapan Multi-Cabang

Walaupun awalnya satu bengkel, struktur sebaiknya menyediakan:

`branches`

Kemudian entitas operasional dapat memiliki `branch_id`.

Ini memudahkan pengembangan:
- Syuhada Motor Cabang A
- Syuhada Motor Cabang B

Jangan memaksakan multi-cabang pada UI MVP jika belum diperlukan; cukup siapkan struktur datanya.

---

## 12. State Machine Deposit

```text
PENDING
 ├── APPROVED → saldo bertambah
 └── REJECTED → saldo tidak bertambah
```

Tidak boleh:

```text
REJECTED → APPROVED
```

tanpa mekanisme admin khusus/review dan audit jika aturan bisnis nanti mengizinkannya.

---

## 13. State Transaksi

```text
DRAFT
  ↓
COMPLETED
  ├── PAID
  └── CANCELLED / REFUNDED
```

Jangan menghapus transaksi finansial. Gunakan reversal/refund.

---

## 14. Prinsip Source of Truth

- Master harga → products/services.
- Histori transaksi → transactions + transaction_items.
- Histori point → points_ledger.
- Histori saldo → wallet_ledger.
- Ajuan deposit → deposits.
- Aktivitas admin → audit_logs.
- Status pengiriman WA → notifications.
