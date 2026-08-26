# Dashboard V2.1 Batch API Package

Paket ini merupakan milestone V2 pertama setelah baseline V2.0. Fitur utamanya adalah ingest production batch dan batch process run dari aplikasi eksternal melalui NestJS API.

## Menjalankan

1. Ekstrak ZIP ke folder terpisah.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env` dan isi koneksi PostgreSQL.
4. Isi `INGEST_API_KEY` untuk mengamankan endpoint POST.
5. Jalankan `npm run start:postgres`.

Kontrak request tersedia pada `docs/backend/External_Batch_Ingestion_API_v1.0.md`.

File credential, `.env`, `node_modules`, Git repository, dan data import mentah tidak disertakan.

