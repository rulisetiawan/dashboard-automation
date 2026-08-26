# NestJS PostgreSQL Integration v1.10

**Tanggal:** 21 Agustus 2026

**Status:** Server-side batch export

## Endpoint Baru

```http
GET /api/v1/batch/process-runs/{processRunId}/export?format=pdf
GET /api/v1/batch/process-runs/{processRunId}/export?format=xlsx
```

Endpoint membaca data berdasarkan `process_run_id`, kemudian mengikat:

- `production_batch` dan `batch_process_run`;
- `process_step_execution`;
- `process_transition_event`;
- `telemetry_sample` dan `tag_definition`;
- `machine_state_event`;
- `alarm_event`.

## Prinsip

- File dibuat oleh NestJS dari data PostgreSQL aktual.
- Browser hanya meminta dan mengunduh hasil; data laporan tidak dibangun dari card HTML.
- PDF berisi laporan proses yang ringkas.
- Excel berisi dataset detail dan telemetry aktual sampai batas 200.000 row.
- Interval data mengikuti `started_at` sampai `ended_at` process run. Untuk batch aktif, waktu akhir memakai waktu export.
