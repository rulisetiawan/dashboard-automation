# NestJS + PostgreSQL Local Integration v1.7

**Tanggal:** 18 Agustus 2026  
**Status:** Motor historian dan Jetflow program execution versioned

## Contoh data trend yang diinjeksikan

Script manual berikut menyediakan contoh yang nyata di PostgreSQL lokal, dengan marker `TEST_SAMPLE`:

```powershell
node --env-file=.env scripts/inject-test-samples.mjs
```

| Area | Contoh trend | Struktur penyimpanan |
|---|---|---|
| Motor 3-phase | Ampere R/S/T, voltage RS/ST/TR, kW, Hz, runtime, counter energy | `equipment_telemetry_sample` + aggregate 1m/15m/daily |
| Jetflow | Main tank temperature PV/SV, level PV/SV, flow water, dosing tank, level tank | `telemetry_sample` + aggregate 1m/15m/daily |
| Calator | Feeding speed, overfeed out, dancer, output, water | `telemetry_sample` |
| Dryer | Line speed, chamber temperature, thermal-oil temperature, output | `telemetry_sample` |
| Kalender | Loadcell, temperature upper/lower, dancer, width, overfeed, output | `telemetry_sample` |
| Utility | Energy, water, steam totalizer | `utility_sample` + aggregate daily |

Untuk setiap motor contoh, tersedia 25 titik per jam selama 24 jam. Sebanyak 37 motor/drive pada Jetflow, Calator, Dryer, Kalender, dan Dispensing ikut memiliki data trend. Contoh ini untuk menguji grafik dan query, bukan baseline operasi pabrik.

Endpoint trend motor:

```text
GET /api/v1/equipment/{equipmentId}/trend?granularity=1m|15m|daily&from={ISO}&to={ISO}
```

Contoh ID: `CL-DPN-01-MTR-FEED`.

## Program Jetflow: versi tidak boleh diubah di tengah batch

Program Jetflow dimodelkan sebagai master versioned:

```text
process_program_version (TEST-JF-DYE v1, RELEASED)
        │
        └── process_program_step (urutan, rule selesai, SV, expected duration)
                    │ saat batch dimulai, dikunci ke versi tersebut
                    ▼
batch_process_run.program_version_id
        │
        └── process_step_execution (status/start/end, SV dan PV aktual)
                    │
                    └── process_transition_event (jejak perpindahan step)
```

Contoh batch `TEST-JF-0001` menggunakan `TEST-JF-DYE v1` dengan 12 step: Filling, Drain, Rinse Cooling, Check PH, Temperature Control, Inject/Dosing DT 1–2, Load, Unload, dan ST To MT Filling. Tiga transition otomatis contoh tercatat dengan sumber tag PLC `...BATCH.PROCESS_STEP_CODE`.

Endpoint pembacaan lengkap:

```text
GET /api/v1/batch/process-runs/{processRunId}/program
```

Contoh process run: `00000000-0000-4000-8000-000000020001`.

## Alur update dan pindah proses

1. Engineering membuat versi baru dalam status `DRAFT`; step, SV, completion rule, dan expected duration dapat berubah hanya pada versi ini.
2. QA/Process Engineer memeriksa, lalu approver mengubahnya menjadi `RELEASED`. Versi released bersifat immutable.
3. Saat batch baru dimulai, MES/gateway menautkan `batch_process_run.program_version_id` ke satu versi released. Batch tersebut tidak otomatis mengikuti versi baru yang terbit setelahnya.
4. PLC/gateway mengirim `PROCESS_STEP_CODE`, sequence counter, dan timestamp sumber. Ingestion membuat/menutup `process_step_execution` serta mencatat `process_transition_event` bertipe `AUTOMATIC`.
5. Jika operator harus hold, retry, skip, atau manual advance, sistem menulis transition baru dengan `transition_type`, `reason_code`, user, dan timestamp. Perintah PLC tetap berada di jalur OT yang terkontrol; dashboard V1 hanya menampilkan dan mengauditnya.
6. Bila PV tidak mencapai SV sesuai completion rule atau time limit, buat `alarm_event` yang mengarah ke `batch_no`, `tag_code`, dan process run. Trend menampilkan band step dari execution, bukan perkiraan frontend.

## Aturan keselamatan data

- Jangan mengganti `setpoint_json` atau urutan step pada versi `RELEASED` yang sudah dipakai batch.
- Buat versi baru (`v2`, `v3`, dan seterusnya) untuk perubahan resep/program berikutnya.
- Timestamp authoritative adalah `source_ts` dari PLC/gateway, bukan waktu browser/API.
- Pindah step harus idempotent menggunakan event ID/message ID gateway agar replay koneksi tidak membuat transition ganda.
- Command perubahan proses tidak diberikan melalui dashboard sampai interlock, role approval, dan uji HAZOP/OT disetujui.
