# NestJS PostgreSQL Integration v1.11

**Tanggal:** 22 Agustus 2026

**Status:** Complete active-alarm response and non-blocking startup

## Alarm API

Endpoint `GET /api/v1/alarms/recent` sekarang mengembalikan:

- `alarms`: histori terbaru mengikuti parameter `limit`;
- `active_alarms`: seluruh event dengan `event_state` selain `CLEARED`, tanpa terpotong batas histori;
- `active_count`: jumlah kondisi aktif yang digunakan badge dashboard.

Pemisahan ini mencegah alarm aktif lama hilang dari indikator hanya karena lebih dari 100 event baru sudah tercatat.

## Startup Historian

Refresh rollup historian tidak lagi dijalankan secara blocking saat NestJS mulai. Server menyelesaikan koneksi dan migrasi terlebih dahulu, lalu refresh berkala dijalankan setiap lima menit. Perubahan ini mencegah refresh telemetry menahan relation lock dan membuat HTTP/WebSocket belum tersedia saat restart.
