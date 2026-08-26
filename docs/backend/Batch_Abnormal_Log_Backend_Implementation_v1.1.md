# Batch Abnormal Log Backend Implementation v1.1

**Tanggal:** 26 Agustus 2026  
**Status:** Implemented foundation  
**Melanjutkan:** `Batch_Abnormal_Log_Backend_Flow_v1.0.md`

## Ringkasan implementasi

Versi ini mengimplementasikan fondasi Process Deviation Engine tanpa mengganti Alarm Engine statis yang sudah berjalan.

Hasil implementasi:

- Jetflow tetap dapat memakai scope `step_code` dan process sequence.
- Kalender, Calator, dan Dryer dapat memakai continuous target tracking tanpa sequence.
- Status `RAMPING` tidak dianggap abnormal.
- Kegagalan mencapai target menghasilkan `TIME_TO_TARGET`.
- Nilai keluar dari target setelah stabil menghasilkan `HOLD_TARGET`.
- Perubahan SV membuat target revision baru dan Setpoint Change Log.
- Event lama tetap tersimpan setelah kondisi clear atau target berubah.
- WARNING/CRITICAL diproyeksikan ke `alarm_event` agar dapat tampil pada header alarm.
- INFO tetap masuk Batch Abnormal Log tanpa membuat popup alarm.

## File implementasi

| File | Fungsi |
|---|---|
| `postgres/migrations/0013_process_deviation_engine.sql` | Tabel, constraint, index, state, dan relasi alarm |
| `server/nest/process-deviation-engine.service.ts` | Evaluasi telemetry PV/SV dan lifecycle target/deviation |
| `server/nest/process-deviation.controller.ts` | CRUD rule, target log, setpoint log, abnormalities, acknowledgement |
| `server/nest/batch.controller.ts` | Menambahkan target, setpoint change, dan deviation ke batch context |
| `server/nest/batch-export.controller.ts` | Menambahkan worksheet/section target, SV change, dan process deviation |
| `server/nest/alarm-engine.service.ts` | Korelasi alarm statis langsung ke process run dan step aktif |
| `server/nest/realtime.gateway.ts` | Sumber refresh WebSocket untuk tabel deviation baru |
| `app.js` | Form konfigurasi, Target Achievement Log, Setpoint Change Log, dan abnormal log aktual |
| `styles.css` | Layout konfigurasi dynamic deviation |

## Tabel baru

### `process_deviation_rule`

Konfigurasi rule dinamis, mencakup:

- scope asset/process type dan optional Jetflow `step_code`;
- pasangan PV dan SV;
- absolute/percent tolerance;
- startup grace dan expected reach time;
- stable, deviation, clear, dan SV-change confirmation;
- hysteresis dan minimum perubahan SV;
- monitor reach/hold dan pause ketika HOLD;
- severity, impact, message, recommendation, dan calculation version.

### `process_target_execution`

Menyimpan satu revision target parameter. Revision ditutup sebagai `SUPERSEDED` ketika SV berubah.

### `process_setpoint_change_event`

Menyimpan SV lama, SV baru, timestamp, source, gateway/actor, reason, message ID, process run, dan target revision.

### `process_deviation_event`

Menyimpan event `TIME_TO_TARGET` atau `HOLD_TARGET`, termasuk:

- trigger PV dan worst PV;
- SV dan tolerance snapshot;
- maximum absolute/percent deviation;
- start, end, duration, end reason;
- batch, process run, step, severity, impact, dan acknowledgement.

### `process_deviation_rule_state`

State durable engine per rule, process run, dan PV tag. State ini boleh dihapus setelah process run selesai karena histori permanen berada pada target/deviation event.

## State machine yang aktif

```text
WAITING/RAMPING
  ├─ target masuk tolerance → STABILIZING → STABLE
  └─ reach deadline lewat  → DEVIATING (TIME_TO_TARGET)

STABLE
  └─ keluar tolerance → PENDING → DEVIATING (HOLD_TARGET)

DEVIATING
  └─ kembali tolerance → CLEARING → STABLE

Semua state
  ├─ run HOLD dan pause enabled → PAUSED
  ├─ SV berubah                → target lama SUPERSEDED, revision baru RAMPING
  └─ run selesai              → target COMPLETED/CANCELLED
```

## Prioritas sumber SV

1. `sv_tag_code` atau tag yang ditemukan melalui `sv_signal_role`.
2. `process_step_execution.setpoint_json[setpoint_key]` untuk Jetflow atau proses yang memiliki step record.

Rule tidak dievaluasi jika SV valid belum tersedia. Telemetry dengan quality selain `GOOD` memperbarui informasi quality, tetapi tidak mengubah lifecycle deviation.

## API konfigurasi

### Membaca rule

```http
GET /api/v1/process-deviation-rules
GET /api/v1/process-deviation-rules?asset_id=KL-DPN-05
GET /api/v1/process-deviation-rules/tags?asset_id=KL-DPN-05
```

### Membuat rule

```http
POST /api/v1/process-deviation-rules
Content-Type: application/json
X-Operator-Name: Automation Engineer
```

```json
{
  "rule_code": "KL_DPN_05_TEMP_UPPER_TARGET",
  "rule_name": "Kalender 05 upper temperature target",
  "asset_id": "KL-DPN-05",
  "process_type": "kalender",
  "pv_tag_code": "SMM.KL-DPN-05.UPPER_FELT.TEMPERATURE_PV",
  "sv_signal_role": "TEMPERATURE_UPPER_SV",
  "deviation_mode": "ABSOLUTE",
  "tolerance_low": 2,
  "tolerance_high": 2,
  "startup_grace_seconds": 30,
  "expected_reach_time_seconds": 900,
  "stable_confirmation_seconds": 60,
  "deviation_delay_seconds": 30,
  "clear_confirmation_seconds": 30,
  "hysteresis_value": 0.5,
  "minimum_sv_change": 0.5,
  "change_confirmation_seconds": 5,
  "monitor_reach": true,
  "monitor_hold": true,
  "pause_on_machine_hold": true,
  "severity": "WARNING",
  "impact_code": "QUALITY",
  "alarm_message": "Upper temperature tidak mengikuti target batch",
  "recommendation": "Periksa steam valve, pressure, RTD, dan load kain.",
  "enabled": true
}
```

### Mengubah atau menonaktifkan rule

```http
PATCH /api/v1/process-deviation-rules/{ruleId}
```

Perubahan konfigurasi menutup tracker lama sebagai `RULE_UPDATED`. Menonaktifkan rule menutupnya sebagai `RULE_DISABLED`. Telemetry berikutnya membuat tracker baru menggunakan konfigurasi terbaru.

## API log batch

```http
GET /api/v1/batch/process-runs/{processRunId}/target-achievements
GET /api/v1/batch/process-runs/{processRunId}/setpoint-changes
GET /api/v1/batch/process-runs/{processRunId}/abnormalities?page=1&page_size=25
PATCH /api/v1/batch/process-deviations/{deviationEventId}/acknowledge
```

Endpoint context yang sudah ada sekarang juga mengembalikan:

```json
{
  "run": {},
  "steps": [],
  "transitions": [],
  "alarms": [],
  "targets": [],
  "setpoint_changes": [],
  "deviations": []
}
```

## Export

Export XLSX batch sekarang menambahkan:

- `Target Achievement`;
- `Setpoint Changes`;
- `Process Deviations`.

PDF menambahkan section ringkas dengan sumber data yang sama.

## Konfigurasi frontend

Pada bagian paling bawah halaman Alarms & Events tersedia panel **PV / SV Target Achievement Rules**.

Form dapat mengatur:

- mesin, PV, SV, setpoint key, dan optional Jetflow step;
- tolerance dan mode absolute/percent;
- startup grace, expected reach, stable, deviation, dan clear time;
- hysteresis, minimum SV change, dan SV-change confirmation;
- monitor time-to-target, monitor hold-target, dan pause saat HOLD;
- severity, production impact, message, dan recommendation.

## Perilaku WebSocket

Engine mengirim refresh source spesifik:

- `process_deviation_rule`;
- `process_target_execution`;
- `process_setpoint_change_event`;
- `process_deviation_event`;
- `alarm_event` jika severity memerlukan alarm header.

Frontend menunda render struktural ketika input/select sedang aktif. Perubahan engine tidak boleh menutup dropdown konfigurasi yang sedang digunakan.

## Verifikasi yang dilakukan

- Migration diterapkan pada PostgreSQL/TimescaleDB lokal.
- NestJS dan frontend build berhasil.
- Endpoint rule dan batch context merespons `ACTUAL_DATABASE`.
- Uji lifecycle memakai telemetry sementara menghasilkan dua target revision, dua setpoint-change event, serta deviation ACTIVE/CLEARED.
- Seluruh rule, event, dan telemetry uji dihapus setelah verifikasi.
- Server utama aktif pada `http://localhost:8787` menggunakan build terbaru.

## Status commissioning

Migration dan engine sudah aktif, tetapi belum ada rule produksi yang dibuat otomatis. Ini disengaja agar tidak ada alarm dummy atau asumsi tolerance yang belum disetujui process owner.

Langkah commissioning berikutnya:

1. pilih satu mesin pilot;
2. validasi tag PV/SV aktual;
3. tetapkan tolerance dan waktu bersama Production/Quality/Automation;
4. buat rule dari frontend;
5. jalankan batch aktual dan cocokkan event dengan trend;
6. lanjutkan rollout memakai template setelah pilot disetujui.

