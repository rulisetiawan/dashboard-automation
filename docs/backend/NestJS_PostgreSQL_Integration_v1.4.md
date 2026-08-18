# NestJS + PostgreSQL Local Integration v1.4

**Tanggal:** 18 Agustus 2026  
**Status:** API actual-data coverage

## Endpoint tambahan

- `GET /api/v1/telemetry/recent?limit=100` — historian terbaru, bergabung dengan `tag_definition` untuk role dan engineering unit.
- `GET /api/v1/alarms/recent?limit=100` — event dari `alarm_event`.

Endpoint asset kini juga mengembalikan `values` dari `asset_snapshot.values_json`. Frontend menggunakan nilai tersebut untuk live sensor cards tanpa generator nilai.

## Dataset test yang diinjeksi

| Data | Nilai test |
|---|---|
| Asset | `CL-DPN-01`, `DSP-DPN-01` |
| Batch | `TEST-CL-0001` |
| Tag / historian | 3 tag, 18 sample |
| Chemical | 1 transaksi `TEST-REQ-0001` |
| Utilitas | 4 snapshot `TEST_*` |
| Alarm | 1 event `TEST-OVERFEED` |

Dataset adalah data uji integrasi, bukan data produksi. Semua record ditandai `TEST_SAMPLE` atau `TEST-`.
