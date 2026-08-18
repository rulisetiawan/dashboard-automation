# NestJS + PostgreSQL Local Integration v1.1

**Tanggal:** 18 Agustus 2026  
**Status:** Aktif — actual database only

## Tujuan

Dashboard membaca data langsung dari PostgreSQL lokal yang dikonfigurasi pada `.env`. Seed dan fallback data simulasi telah dihapus. Saat tabel masih kosong, UI menampilkan status integrasi kosong; angka demo tidak ditampilkan.

## Alur data aktif

```text
PostgreSQL lokal
  ├─ asset + asset_snapshot ───────► GET /api/v1/assets?process={process}
  ├─ tag_definition ───────────────► GET /api/v1/assets/{assetId}/snapshot
  ├─ chemical_transaction ─────────► GET /api/v1/dispensing/transactions
  └─ utility_snapshot ─────────────► GET /api/v1/utilities/snapshot
                                      │
                                      ▼
                              NestJS REST API
                                      │
                                      ▼
                        PT.SMM Smart Manufacturing Dashboard
```

## Kontrak database

| Kebutuhan dashboard | Tabel sumber | Catatan minimum |
|---|---|---|
| Master mesin | `asset` | `asset_id`, `process_type`, area, nama, config JSON |
| Status real-time | `asset_snapshot` | state, batch, progress, connected, source timestamp, quality |
| Mapping tag | `tag_definition` | tag code, asset, role, unit, source status |
| Historian | `telemetry_sample` | timestamp sumber, nilai, quality, gateway dan message ID |
| Chemical Calator | `chemical_transaction` | dispenser, Calator tujuan, varian, target/actual, mode, status |
| Utilitas | `utility_snapshot` | nilai terakhir per meter/utility |

`asset_snapshot` bersifat opsional secara relasi baca: asset yang baru didaftarkan tetap dikembalikan API sebagai `offline`, `NO_DATA`, progress `0`, sampai snapshot aktual masuk.

## Endpoint

- `GET /api/v1/integration/status` — status NestJS/PostgreSQL dan jumlah asset per proses.
- `GET /api/v1/assets?process=jetflow|calator|dryer|kalender|chemical` — asset dan snapshot aktual.
- `GET /api/v1/assets/{assetId}/snapshot` — detail snapshot dan daftar tag aktif.
- `GET /api/v1/dispensing/transactions` — log chemical aktual.
- `GET /api/v1/utilities/snapshot` — nilai utilitas aktual.

Seluruh respons kini memakai `data_mode: ACTUAL_DATABASE` dan cakupan proses `ALL_PROCESSES`.

## Operasional lokal

1. Isi kredensial PostgreSQL lokal di `.env` (file tidak masuk Git).
2. Jalankan `npm run dev:postgres`.
3. Daftarkan asset dan tag aktual terlebih dahulu.
4. Tulis snapshot dari collector/gateway ke tabel sesuai kontrak di atas.

Migration `postgres/migrations/0001_non_jetflow_local.sql` tetap idempoten: hanya memastikan struktur tabel tersedia dan tidak memasukkan data contoh.

## Penghapusan dataset demo

Dataset demo dibersihkan setelah diverifikasi memiliki signature seed aplikasi: 50 asset, 50 snapshot, 284 tag, 6 transaksi chemical, dan 4 snapshot utilitas. Penghapusan dilakukan dalam satu transaksi PostgreSQL dan marker seed dihapus. Data aktual operator tidak menjadi target penghapusan.

## Batasan tahap ini

Dashboard telah tidak memakai data dummy, namun collector PLC/OPC UA/Modbus belum ditambahkan. Agar halaman analitik mesin tampil penuh, collector harus memasukkan mapping tag dan historian aktual ke tabel di atas. Nilai UI yang belum memiliki tag registry tidak akan ditampilkan sampai mapping tersebut tersedia.
