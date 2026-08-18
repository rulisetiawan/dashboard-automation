# PostgreSQL Local Integration v1.0

**Tanggal:** 18 Agustus 2026  
**Status:** Local development running  
**Scope:** Backend non-Jetflow menggunakan PostgreSQL lokal melalui PGlite.

## Tujuan

Dokumen ini mencatat koneksi database PostgreSQL lokal untuk pengembangan sebelum dipindahkan ke PostgreSQL server production. Implementasi ini tidak membutuhkan Docker atau instalasi PostgreSQL native pada komputer developer.

## Teknologi lokal

- **PGlite**: engine PostgreSQL embedded yang persistent pada folder `.data/pt-smm-postgres`.
- **Node local API**: melayani dashboard dan endpoint `/api/v1` pada satu origin.
- **Migration PostgreSQL**: `postgres/migrations/0001_non_jetflow_local.sql`.

PGlite menggunakan SQL dan tipe PostgreSQL (`JSONB`, `TIMESTAMPTZ`, `BIGSERIAL`, `UUID`), sehingga struktur database lokal tetap dekat dengan target PostgreSQL production.

## Menjalankan lokal

```text
npm run dev:postgres
```

Dashboard dan API tersedia di `http://localhost:8787`.

Database dibuat dan di-seed otomatis pada startup pertama. Folder `.data/` tidak masuk Git karena merupakan data lokal developer.

## Endpoint yang tervalidasi

| Endpoint | Hasil lokal |
|---|---|
| `/api/v1/integration/status` | PostgreSQL local status dan jumlah asset non-Jetflow |
| `/api/v1/assets?process=calator` | 18 Calator |
| `/api/v1/assets?process=dryer` | 6 Dryer |
| `/api/v1/assets?process=kalender` | 21 Kalender |
| `/api/v1/assets?process=chemical` | 5 Dispensing Calator |
| `/api/v1/dispensing/transactions` | Chemical transaction log |
| `/api/v1/utilities/snapshot` | Electrical, water, steam, thermal oil snapshot |

## Schema

- `asset`, `asset_snapshot`, `tag_definition`
- `telemetry_sample`
- `chemical_transaction`
- `utility_snapshot`
- `backend_meta`

Data awal tetap `SIMULATED_SEED`. Penggantian ke data PLC cukup dilakukan melalui collector/API tanpa mengubah struktur dashboard.

## Perbedaan dengan target production

| Local | Production |
|---|---|
| PGlite dalam folder proyek | PostgreSQL / TimescaleDB server terkelola atau on-premise |
| API Node lokal | Backend service/Worker dengan koneksi aman ke PostgreSQL |
| Data seed | Gateway OT, telemetry aktual, batch MES, dan historian |
| Hanya untuk development | Backup, HA, retention, RBAC, audit, dan network segmentation |

## Keputusan v1.0

- Pengembangan backend non-Jetflow dapat diuji lokal menggunakan PostgreSQL semantics tanpa menunggu server production.
- Cloud dashboard tidak diubah oleh setup ini; backend D1 cloud tetap terpisah sampai PostgreSQL production tersedia.
- Jetflow masih di luar scope integrasi database lokal tahap ini.
