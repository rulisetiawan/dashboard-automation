# Dashboard V2 Concept v2.28

**Versi:** 2.28
**Tanggal:** 2 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.27.md`

## Fokus perubahan

Solar Fueling menggunakan histori aktual `qr_code_db` serta sensor level tangki realtime dari `qr_solar_level`.

## Perubahan utama

- KPI `Live Tank Level` dengan status GOOD, STALE, BAD, atau NO DATA.
- System Stock menggunakan calculated stock dari sistem sumber jika tersedia.
- Reconciliation inventory membandingkan sensor level dan calculated system stock.
- Tank Level Trend ditampilkan berdampingan dengan Consumption Trend dan Top Requesters.
- Transaksi QR lama dan historian level dimigrasikan secara idempotent ke PostgreSQL.
- Sinkronisasi incremental berjalan setiap 15 detik tanpa mengganggu interaksi atau posisi scroll dashboard.
