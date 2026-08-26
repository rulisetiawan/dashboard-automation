# Alarm Rule Engine v1.0

**Tanggal:** 21 Agustus 2026

**Status:** Implementasi lokal aktif

## Alur

```text
Frontend configuration
        ↓
alarm_rule + alarm_rule_audit
        ↓
NestJS AlarmEngineService
        ↓ membaca telemetry_sample baru
alarm_rule_state
        ↓ transition
alarm_event
        ↓
WebSocket alarm:active / alarm:cleared
        ↓
Popup dan Alarm Event Log
```

## Tabel

- `alarm_rule`: source of truth rule per tag.
- `alarm_rule_state`: state evaluasi terakhir, pending timer, dan active event reference.
- `alarm_rule_audit`: histori create/update beserta actor dan before/after JSON.
- `alarm_event`: lifecycle alarm aktual, trigger, threshold, recommendation, acknowledgement, dan clear time.
- `backend_meta`: cursor telemetry terakhir agar restart backend tidak mengulang event lama.

## Evaluasi

- `HIGH/HIGH_HIGH` aktif ketika nilai lebih besar atau sama dengan threshold.
- `LOW/LOW_LOW` aktif ketika nilai lebih kecil atau sama dengan threshold.
- Delay harus terpenuhi sebelum `PENDING` berubah menjadi `ACTIVE`.
- HIGH clear pada `threshold - hysteresis`.
- LOW clear pada `threshold + hysteresis`.
- Sampel selain quality `GOOD` tidak digunakan untuk threshold evaluation.
- Satu rule hanya dapat memiliki satu `alarm_event` yang belum `CLEARED`.

## Endpoint

```http
GET   /api/v1/alarm-rules
GET   /api/v1/alarm-rules/tags?asset_id={assetId}
POST  /api/v1/alarm-rules
PATCH /api/v1/alarm-rules/{ruleId}
PATCH /api/v1/alarm-events/{alarmEventId}/acknowledge
```

## Validasi Lifecycle

Pengujian otomatis sementara menggunakan rule HIGH 999 dan hysteresis 10 menghasilkan:

```text
1000 → ACTIVE
980  → CLEARED
engine state → NORMAL
```

Seluruh record validasi sementara dibersihkan setelah pengujian.
