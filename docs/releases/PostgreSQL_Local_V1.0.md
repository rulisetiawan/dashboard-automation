# PostgreSQL Local v1.0

**Tanggal:** 18 Agustus 2026  
**Status:** Local integration running

## Ditambahkan

- PGlite sebagai PostgreSQL lokal persistent tanpa Docker atau PostgreSQL native.
- Local API server dan perintah `npm run dev:postgres`.
- Migration PostgreSQL untuk asset, snapshot, tag, telemetry, chemical, dan utility.
- Seed dan endpoint API non-Jetflow yang tervalidasi secara lokal.

## Batasan

- Data awal masih `SIMULATED_SEED`.
- PGlite adalah environment development; production tetap membutuhkan PostgreSQL + TimescaleDB server yang dapat diakses backend.
