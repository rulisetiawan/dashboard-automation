# NestJS + PostgreSQL Local Integration v1.2

**Tanggal:** 18 Agustus 2026  
**Status:** Aktif — struktur operational MES tersedia

## Tabel yang dibuat

### Real-time dan historian

- `asset` — master mesin, area, dan konfigurasi.
- `asset_snapshot` — kondisi terakhir: running/stop, batch, progress, koneksi, quality.
- `tag_definition` — canonical tag dan satuan.
- `telemetry_sample` — data sensor historis dengan timestamp sumber dan quality.
- `utility_snapshot` — nilai terakhir utilitas.
- `utility_meter` — master meter, hirarki Cubical/MDP/SDP/area/mesin.

### MES dan traceability

- `production_batch` — batch, customer, kain, gramasi, target lebar/output, delivery target.
- `batch_process_run` — batch yang berjalan pada mesin tertentu, recipe, waktu, dan output.
- `process_step_execution` — langkah proses per batch; menyimpan status, start/end, SV dan PV dalam JSON.

### Reliability

- `alarm_event` — event alarm per asset/tag/batch, severity, acknowledgement, dan clear time.
- `maintenance_plan` — rencana dan realisasi maintenance per mesin/equipment.
- `chemical_transaction` — request, timbang, dan transfer chemical dispenser ke Calator.

## Prinsip input

Semua tabel kosong setelah dibuat. API dan dashboard tidak memasukkan record demo. Collector/gateway atau proses MES harus memasukkan record aktual dengan waktu sumber (`source_ts`) dan quality yang benar.

## Urutan minimal agar dashboard mulai berisi

1. Masukkan mesin aktual ke `asset`.
2. Masukkan status terbaru setiap mesin ke `asset_snapshot`.
3. Tambahkan tag terpetakan ke `tag_definition`.
4. Tulis sample aktual ke `telemetry_sample`.
5. Tambahkan batch, run, alarm, chemical, dan meter sesuai proses yang sudah aktif.
