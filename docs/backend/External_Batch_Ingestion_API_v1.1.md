# External Batch Ingestion API v1.1

**Dashboard:** V2.1  
**Tanggal:** 22 Agustus 2026  
**Base URL lokal:** `http://localhost:8787/api/v1/batch`

Dokumen ini melengkapi kontrak v1.0 dengan pembakuan identifier dan perbaikan dukungan nilai progress desimal.

## Identifier Process Run

| Field | Tipe | Pemilik | Aturan |
|---|---|---|---|
| `external_run_id` | text | ERP, Node-RED, atau aplikasi sumber | ID idempotensi eksternal; tidak harus UUID |
| `process_run_id` | UUID | Backend MES | Primary key internal; otomatis dibuat jika tidak dikirim |
| `batch_no` | text | Sistem produksi/planning | Harus sudah terdaftar pada `production_batch` |

Integrasi normal cukup mengirim `external_run_id`. Jangan menyalin nilai seperti `ERP-RUN-000991` ke `process_run_id`.

## Payload Process Run

```json
{
  "external_run_id": "ERP-RUN-000991",
  "batch_no": "BATCH-20260822-001",
  "asset_id": "KL-DPN-05",
  "process_type": "kalender",
  "run_status": "RUNNING",
  "started_at": "2026-08-22T10:00:00+07:00",
  "progress_percent": 42.5,
  "source_system": "ERP_PRODUCTION",
  "source_updated_at": "2026-08-22T10:01:00+07:00"
}
```

`progress_percent` menerima angka desimal dari `0` sampai `100`. Query snapshot memakai cast `numeric` secara eksplisit agar nilai seperti `42.5` tidak diinferensikan PostgreSQL sebagai integer.

## Hasil Validasi

Payload contoh di atas telah diuji pada backend lokal dan menghasilkan HTTP `201` dengan:

- `external_run_id`: `ERP-RUN-000991`;
- `process_run_id`: UUID yang dibuat backend;
- `run_status`: `RUNNING`;
- penyimpanan pada `batch_process_run` berhasil.

Response error lokal memuat `request_id`, `database_code`, dan `diagnostic`. Gunakan `diagnostic` untuk membedakan kegagalan UUID, numeric, dan timestamp.

