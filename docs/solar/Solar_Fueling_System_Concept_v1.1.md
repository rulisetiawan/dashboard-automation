# Solar Fueling & Inventory Reconciliation v1.1

**Status:** Aktif
**Tanggal:** 2 September 2026
**Dashboard:** V2.28
**Baseline:** Melanjutkan `Solar_Fueling_System_Concept_v1.0.md`

## Integrasi sumber aktual

Sumber aktual berasal dari koneksi Navicat `SMM_Mysql`, MySQL `192.168.100.82:3306`, database `qr_code_db`.

| Tabel sumber | Tujuan PostgreSQL | Fungsi |
|---|---|---|
| `qr_codes` | `solar_fueling_transaction` | QR, requester, volume diminta, flow meter, calculated stock, totalizer, status, dan waktu fueling |
| `qr_solar_level` | `solar_level_sample` | Historian sensor stok/level tangki dalam liter |

## Mapping yang divalidasi dari data

- `actual_solar` adalah volume aktual dispensing dari flow meter.
- `calculated_volume` adalah calculated stock/volume tangki dari sistem sumber, bukan volume transaksi.
- `total_solar_out` adalah totalizer utama untuk transaksi kategori `out`.
- `total_solar_IN` tetap disimpan sebagai totalizer masuk jika tersedia.
- `TERPAKAI` menjadi `COMPLETED`.
- `AKTIF` menjadi `READY`.
- `TIDAK AKTIF` menjadi `CANCELLED`.
- `process_type=manual` menjadi execution mode `MANUAL`; nilai lain menjadi `QR`.
- Timestamp MySQL tanpa timezone diinterpretasikan sebagai waktu `Asia/Jakarta` lalu disimpan sebagai `TIMESTAMPTZ`.

## Live tank level

Overview menampilkan `Live Tank Level`, waktu sampel terakhir, dan kualitas data. Sampel dianggap `STALE` jika tidak diperbarui lebih dari tiga menit. Historian level ditampilkan terpisah dari trend konsumsi.

Nilai di luar sanity range `0–100000 liter` tetap disimpan tetapi berkualitas `BAD`. Dengan cara ini sumber dapat diaudit tanpa mencemari latest value dan agregasi trend berkualitas baik.

## Rekonsiliasi inventory

Calculated stock dari `calculated_volume` menjadi system stock utama pada waktu transaksi. Sensor `qr_solar_level.stock` menjadi pembanding live independen. Stock opname fisik tetap menjadi validasi final.
