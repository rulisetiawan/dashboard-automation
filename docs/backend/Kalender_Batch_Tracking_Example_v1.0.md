# Kalender Batch Tracking Example v1.0

**Tanggal:** 21 Agustus 2026

**Status:** Contoh integrasi lokal PostgreSQL

## Identitas Batch

| Field | Nilai |
|---|---|
| `batch_no` | `BATCH-KL5-20260821-001` |
| `asset_id` | `KL-DPN-05` |
| `process_type` | `kalender` |
| `recipe_code` | `KAL-FIN-181-180GSM` |
| Start | `2026-08-21 10:00:00+07` |
| End | `2026-08-21 12:00:00+07` |
| Output | `1150 m` |
| Source telemetry | `LOCAL-BATCH-TRACKING` |

## Relasi Data

```text
production_batch
  BATCH-KL5-20260821-001
          |
          v
batch_process_run
  KL-DPN-05 · 10.00–12.00 WIB
          |
          +--> process_step_execution (3 step)
          |
          +--> telemetry_sample (13 tag, 1.573 sample)
                         |
                         v
               telemetry_aggregate_1m / 15m / daily
                         |
                         v
                  Historian PV/SV
```

## Process Step

| Step | Code | Waktu | Status |
|---:|---|---|---|
| 1 | `SETUP_PREHEAT` | 10.00–10.10 | Completed |
| 2 | `FINISHING_RUN` | 10.10–11.50 | Completed |
| 3 | `UNLOAD_QC_HANDOFF` | 11.50–12.00 | Completed |

## Tag yang Diisi

- Temperature upper PV/SV.
- Temperature lower PV/SV.
- Loadcell upper PV/SV.
- Loadcell lower PV/SV.
- Dancing roller position PV.
- Fabric width PV.
- Overfeed speed PV.
- Upper felt speed PV.
- Production output total meter.

## Menjalankan Ulang

```text
npm run seed:kalender-batch
```

Script bersifat idempotent. Identitas process run dan message ID telemetry stabil sehingga menjalankan script kembali akan memperbarui contoh yang sama dan tidak menggandakan data.

## Cara Tracking di Dashboard

1. Buka Plant Overview.
2. Cari dan buka `KL-DPN-05`.
3. Pada Process run history, pilih `Track batch` untuk `BATCH-KL5-20260821-001`.
4. Dashboard menerapkan custom range 10.00–12.00 WIB dan membuka historian.
5. Pilih parameter untuk melihat pasangan PV/SV pada interval batch.
