# NestJS PostgreSQL Integration v1.8

**Tanggal:** 21 Agustus 2026

**Status:** Machine performance summary API

## Endpoint

```text
GET /api/v1/assets/{assetId}/performance-summary
    ?scope=batch|shift|today
    &process_run_id={optional UUID}
```

Endpoint menghitung summary langsung dari PostgreSQL dan tidak menerima nilai hasil kalkulasi dari frontend.

## Response Utama

```json
{
  "asset_id": "KL-DPN-05",
  "scope": "batch",
  "range": {
    "from": "2026-08-21T03:00:00.000Z",
    "to": "2026-08-21T05:00:00.000Z"
  },
  "runtime": {
    "seconds": 7200,
    "stop_count": 0,
    "availability_percent": 100,
    "state_coverage_percent": 100
  },
  "output": {
    "value": 1028.5,
    "unit": "m",
    "estimated": true
  },
  "peaks": [],
  "stability": {},
  "completed_batches": 1
}
```

Nilai pada contoh response hanya menunjukkan bentuk kontrak. Response aktual selalu berasal dari query database.

## Prioritas Output

1. `batch_process_run.output_quantity` untuk scope batch jika tersedia.
2. Delta tag `OUTPUT_TOTAL` jika totalizer memiliki minimal dua sample.
3. Integrasi aggregate tag speed dengan unit `m/min`; hasil diberi `estimated: true`.
4. `null` jika tidak ada sumber yang dapat dihitung.

## Runtime

Runtime tidak dibaca dari snapshot sensor. Backend menghitung overlap event state pada range terpilih agar event yang melewati boundary shift, hari, atau batch tetap dihitung dengan benar.

`availability_percent` dihitung hanya dari state yang tercatat. `state_coverage_percent` ikut dikirim agar availability tidak disalahartikan ketika event state belum mencakup seluruh range.
