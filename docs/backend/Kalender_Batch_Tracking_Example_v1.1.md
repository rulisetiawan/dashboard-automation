# Kalender Batch Tracking Example v1.1

**Tanggal:** 21 Agustus 2026

**Status:** Contoh metadata batch dengan telemetry aktual

## Tujuan

Mengikat satu contoh batch pada Kalender Depan 05 ke data sensor aktual yang sudah tersimpan, tanpa membuat telemetry dummy.

## Relasi Data

```text
production_batch
  └─ batch_process_run (KL-DPN-05, 10.00–12.00 WIB)
       ├─ process_step_execution (setting + actual summary)
       ├─ telemetry_sample (dibaca berdasarkan asset_id + interval waktu)
       └─ alarm_event (batch_no langsung atau korelasi asset + waktu)
```

## Isi yang Diinject

- Satu `production_batch` contoh.
- Satu `batch_process_run` untuk `KL-DPN-05`.
- Tiga `process_step_execution`.
- Satu `machine_state_event` sebagai konteks runtime batch.
- Parameter setting dalam `setpoint_json`.
- Ringkasan min/max/avg dari telemetry aktual dalam `actual_json`.

## Isi yang Tidak Diinject

- Tidak ada row baru pada `telemetry_sample`.
- Tidak ada nilai PV buatan.
- Tidak ada output produksi aktual buatan; field output run dibiarkan kosong jika meter output belum mengirim data.

## Sumber Trend

Trend membaca `telemetry_aggregate_1m` atau aggregate lain yang dibangun dari `telemetry_sample`. Filter utamanya adalah:

```text
asset_id = KL-DPN-05
source_ts >= batch.started_at
source_ts <= batch.ended_at
tag_code = parameter yang dipilih
```

Jika tag SV belum memiliki telemetry, UI dapat membentuk garis referensi dari `process_step_execution.setpoint_json`. Garis tersebut diberi label sebagai process setting agar tidak disalahartikan sebagai telemetry.

## Menjalankan Ulang

`npm run seed:kalender-batch` bersifat idempotent. Script juga membersihkan hanya telemetry contoh lama dengan gateway `LOCAL-BATCH-TRACKING`, menyegarkan aggregate pada interval terkait, lalu menulis ulang metadata dan ringkasan batch.
