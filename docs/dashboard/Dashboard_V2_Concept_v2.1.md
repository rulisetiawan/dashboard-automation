# Dashboard V2 Concept v2.1

**Tanggal:** 22 Agustus 2026

**Status:** External production batch ingestion

## Ditambahkan

- Production batch dapat dibuat atau diperbarui oleh aplikasi eksternal melalui REST API.
- Batch process run dapat dibuat atau diperbarui setelah batch dan master asset tervalidasi.
- Idempotency memakai `batch_no` untuk production batch dan `source_system + external_run_id` untuk process run.
- Payload dengan `source_updated_at` lebih lama tidak menimpa record yang lebih baru.
- Active process run memperbarui batch/progress pada `asset_snapshot` tanpa menimpa nilai sensor aktual.
- Perubahan batch dipublikasikan melalui WebSocket `dashboard:refresh`.
- Header dashboard menampilkan versi `V2.1`.

Dokumen kontrak lengkap tersedia pada `backend/External_Batch_Ingestion_API_v1.0.md`.

