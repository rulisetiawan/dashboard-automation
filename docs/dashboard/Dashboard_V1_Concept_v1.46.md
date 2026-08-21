# Dashboard V1 Concept v1.46

**Tanggal:** 21 Agustus 2026

**Status:** Batch investigation lengkap berbasis PostgreSQL aktual

## Perubahan

- Detail mesin kembali memakai alur `Search/Recent Batch → Load Batch`.
- Load Batch membuka production context, parameter configuration, trend PV/SV, process sequence, dan abnormality log.
- Recent batch hanya berasal dari `batch_process_run`; tidak dibentuk di frontend.
- Time range historian otomatis memakai `started_at` sampai `ended_at` milik process run.
- Parameter setting berasal dari `process_step_execution.setpoint_json`.
- PV berasal dari aggregate `telemetry_sample` aktual pada asset dan interval batch.
- SV mengutamakan telemetry SV. Jika telemetry SV belum dikirim, dashboard memakai setting proses yang tersimpan sebagai garis referensi dan memberi label `SV · Process setting`.
- Process sequence memakai `process_step_execution`, termasuk start/end time, status, setpoint, dan actual summary.
- Abnormality log memakai `alarm_event` yang terhubung langsung dengan batch atau berkorelasi dengan asset dan interval batch.

## Prinsip Data

Batch contoh hanya menyediakan identitas batch, target, recipe, waktu proses, dan setting program. Script tidak menginject telemetry sensor. Nilai trend tetap membaca data aktual yang sudah berada di PostgreSQL.

## Contoh Aktif

| Field | Nilai |
|---|---|
| Batch | `BATCH-KL5-20260821-001` |
| Asset | `KL-DPN-05` |
| Start | 21 Agustus 2026, 10.00 WIB |
| End | 21 Agustus 2026, 12.00 WIB |
| Actual telemetry yang direferensikan saat seed | 21.306 sample |
| Telemetry yang diinject script | 0 sample |

## Empty State

Tag yang terdaftar tetapi belum memiliki data pada interval batch tetap tampil sebagai pilihan parameter dengan kondisi `belum ada data`. Dashboard tidak membuat nilai pengganti.
