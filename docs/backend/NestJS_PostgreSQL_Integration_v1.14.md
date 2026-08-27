# NestJS PostgreSQL Integration v1.14

**Tanggal:** 27 Agustus 2026  
**Status:** Historical shift selection

## Endpoint

```http
GET /api/v1/assets/{assetId}/performance-summary?scope=shift&production_date=2026-08-27&shift_code=B
```

`production_date` dan `shift_code` harus dikirim bersama. Kode yang berlaku:

| Kode | Waktu WIB |
|---|---|
| A | 07.00–15.00 |
| B | 15.00–23.00 |
| C | 23.00–07.00 hari berikutnya |

Tanpa kedua parameter tersebut, endpoint tetap memilih shift aktif untuk kompatibilitas client lama.

## Aturan waktu

- Zona waktu operasional adalah `Asia/Jakarta`.
- Shift C memakai tanggal saat mulai sebagai `production_date`.
- Shift historis memakai range delapan jam penuh.
- Shift aktif memakai waktu mulai sampai waktu server sekarang.
- Shift yang belum dimulai ditolak.
- Query event menggunakan overlap range agar event yang melewati pergantian shift tetap dihitung pada bagian waktunya masing-masing.

Response `range` menambahkan `production_date`, `shift_code`, `timezone`, dan `complete` untuk scope shift.
