# NestJS PostgreSQL Integration v1.13

**Tanggal:** 27 Agustus 2026  
**Status:** Latest-only live value ingestion

## Endpoint baru

`POST /api/v1/ingestion/live-values` menerima maksimal 200 nilai aktual per request. Endpoint memvalidasi master tag/asset, quality, timestamp, UUID, dan API key opsional sebelum melakukan UPSERT ke `tag_latest`.

Endpoint sengaja tidak menulis `telemetry_sample`. Timestamp lama dan pengiriman ulang dengan `message_id` yang sama tidak mengubah nilai terbaru.

Setelah nilai diterapkan, `RealtimeGateway` mengirim `instrument:delta` ke room asset terkait. `GET /api/v1/integration/status` melaporkan `live_value_ingestion: true`.

## Source of truth

- Live value tanpa histori: `tag_latest`.
- Projection P&ID: `instrument_state`.
- Histori opsional: `telemetry_sample` melalui jalur ingestion historian yang terpisah.
- Hasil transaksi Chemical Dispensing: `chemical_transaction`.

