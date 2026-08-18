# NestJS PostgreSQL Integration v1.0

**Tanggal:** 18 Agustus 2026  
**Status:** Active local backend

## Keputusan teknologi

Backend lokal PT.SMM sekarang menggunakan **NestJS 11 + TypeScript + PostgreSQL**. Server HTTP native sebelumnya tidak lagi dijalankan melalui script project.

| Layer aplikasi | Teknologi | Tanggung jawab |
|---|---|---|
| API framework | NestJS 11 | Routing, controller, dependency injection, lifecycle aplikasi, standardisasi error dan pengembangan module berikutnya. |
| Service data | `DatabaseService` | Koneksi PostgreSQL, migration awal, seed demo, dan lifecycle pool koneksi. |
| Database driver | `pg` | Koneksi PostgreSQL native melalui `.env`. |
| Database | PostgreSQL service lokal | Master asset, live snapshot, tag registry, telemetry schema, chemical transaction, dan utility snapshot. |
| Frontend serving | Express adapter bawaan NestJS | Menyajikan dashboard lokal dan endpoint API pada origin yang sama. |

## Struktur module awal

```text
server/nest/
├── main.ts                 # Bootstrap NestJS, CORS, static dashboard, port
├── app.module.ts           # Root module
├── api.controller.ts       # REST API /api/v1
└── database.service.ts     # PostgreSQL pool, migration, seed, lifecycle
```

## Endpoint yang dipertahankan

```text
GET /api/v1/integration/status
GET /api/v1/assets?process=calator&area=BLK
GET /api/v1/assets/:assetId/snapshot
GET /api/v1/dispensing/transactions?asset_id=DSP-BLK-01
GET /api/v1/utilities/snapshot
```

Endpoint mempertahankan kontrak frontend agar perubahan framework backend tidak mengubah halaman dashboard yang sudah dibuat.

## Menjalankan lokal

```powershell
npm run dev:postgres
```

Perintah tersebut:

1. Mengompilasi backend TypeScript.
2. Membaca konfigurasi PostgreSQL dari `.env`.
3. Menjalankan NestJS pada `http://localhost:8787`.
4. Memastikan migration dan seed non-Jetflow tersedia bila database masih kosong.

## Tahap module berikutnya

- `TelemetryModule`: ingestion OPC UA/Modbus gateway dan store-and-forward.
- `AlarmModule`: reason code, alarm lifecycle, acknowledgement, dan downtime aggregation.
- `BatchModule`: process run, recipe, sequence, SV/PV historian Jetflow.
- `MaintenanceModule`: motor diagnostic, work order, dan maintenance plan.
- `AuthModule`: user, role, area access, serta audit log.

## Batasan

- Scope backend masih non-Jetflow untuk data database/API awal.
- Data awal masih `SIMULATED_SEED`.
- NestJS lokal belum menggantikan backend cloud D1; pemindahan production memerlukan konfigurasi PostgreSQL/TimescaleDB dan secret terkelola.
