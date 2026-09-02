# Solar Fueling Backend Integration v1.0

## Endpoint

- `POST /api/v1/ingestion/solar-fueling` — upsert transaksi dari sistem solar; gunakan header `X-API-Key`.
- `GET /api/v1/solar/overview?from=&to=` — KPI, trend, reconciliation, requester, dan exception.
- `GET /api/v1/solar/transactions?from=&to=&search=&status=&page=&page_size=` — log dan pencarian server-side.
- `GET|POST /api/v1/solar/stock/movements` — log dan pencatatan receipt/adjustment/transfer.
- `GET|POST /api/v1/solar/stock-opnames` — histori dan pembuatan opname.
- `PATCH /api/v1/solar/stock-opnames/:id` — aksi `VERIFY`, `POST`, atau `REJECT`.

Endpoint baca dan inventory menggunakan session dashboard. Ingestion mesin berada pada kelompok endpoint OT dan divalidasi dengan `INGEST_API_KEY`. Role OPERATOR ke atas dapat mencatat movement/opname; verifikasi memerlukan ADMIN, ENGINEER, atau SUPERVISOR.

## Contoh payload sumber

```json
{
  "source_system": "SOLAR_MACHINE_01",
  "transactions": [{
    "id": 10231,
    "code": "QR-SOLAR-20260902-001",
    "jumlah": 120,
    "actual_solar": 119.8,
    "calculated_volume": 120,
    "total_solar_IN": 45821.4,
    "date_created": "2026-09-02T01:10:00.000Z",
    "date_activated": "2026-09-02T01:18:24.000Z",
    "nama_pembuat": "User QR",
    "nama_pemesan": "Requester",
    "process_by": "Operator",
    "status": "COMPLETED",
    "keterangan": "Pengisian normal"
  }]
}
```

## Penyimpanan

PostgreSQL menggunakan migration `0021_solar_fueling_system.sql`. Hosted private site menggunakan tabel D1 dengan field canonical yang sama. Record mentah tetap disimpan pada `raw_payload` untuk audit mapping.
