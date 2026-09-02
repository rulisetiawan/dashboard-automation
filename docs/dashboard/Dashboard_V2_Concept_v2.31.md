# Dashboard V2 Concept v2.31

**Versi:** 2.31
**Tanggal:** 2 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.30.md`

## Fokus perubahan

Solar Fueling Overview menampilkan kondisi lifecycle QR secara langsung dan membuat trend konsumsi lebih ringan untuk dibaca.

## QR status summary

| Card | Definisi |
|---|---|
| QR Pending | `QR_CREATED`, `READY`, atau `DISPENSING` |
| Completed | `COMPLETED` dan `PARTIAL` |
| Cancelled | `CANCELLED` |
| Not Match | Transaksi final dengan gap actual terhadap request lebih dari 2% |
| Failed / Review | `FAILED` atau `MANUAL_REVIEW` |

Semua nilai mengikuti time range aktif dan menggunakan event-time canonical yang sama dengan transaction log.

## Consumption trend

- Label angka per batang dihapus agar grafik tidak padat.
- Nilai skala liter hanya ditampilkan pada sumbu Y dan garis grid.
- Gap antarbatang diperbesar sehingga interval mudah dipisahkan secara visual.
- Hover cursor menampilkan period, actual output, requested volume, dan gap.
- Batang dapat menerima keyboard focus untuk aksesibilitas tanpa mouse.
