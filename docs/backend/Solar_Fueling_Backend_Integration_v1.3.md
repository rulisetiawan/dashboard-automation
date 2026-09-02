# Solar Fueling Backend Integration v1.3

**Status:** Aktif
**Tanggal:** 2 September 2026
**Baseline:** Melanjutkan `Solar_Fueling_Backend_Integration_v1.2.md`

## Query boundary totalizer

PostgreSQL memberi ranking ascending dan descending pada transaksi final berdasarkan `fueling_completed_at, transaction_id`. Rank pertama masing-masing arah menjadi nilai awal dan akhir.

API Overview mengembalikan:

- `first_totalizer_liters`;
- `latest_totalizer_liters`;
- `machine_delta_liters`;
- `totalizer_variance_liters`;
- `metering_match_percent`;
- `totalizer_reset_count`.

`machine_delta_liters` hanya tersedia jika terdapat minimal dua sampel. Implementasi hosted D1 memakai dua scalar boundary query dengan urutan timestamp yang sama.

## Rumus API

```text
machine_delta_liters = latest_totalizer_liters - first_totalizer_liters
totalizer_variance_liters = machine_delta_liters - metered_liters
```

Persentase match tetap membandingkan jarak absolut antara backend flow-meter sum dan totalizer delta.
