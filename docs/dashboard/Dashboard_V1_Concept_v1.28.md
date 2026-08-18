# Dashboard V1 Concept v1.28

**Tanggal:** 18 Agustus 2026  
**Status:** Actual database rendering

## Prinsip tampilan

Dashboard tidak lagi menampilkan nilai prototype ketika data operasional belum tersedia. Seluruh halaman membaca endpoint NestJS yang berasal dari PostgreSQL.

| Halaman | Sumber data aktual |
|---|---|
| Plant Overview | `asset`, `asset_snapshot`, `utility_snapshot` |
| Jetflow / Calator / Dryer / Kalender | `asset`, `asset_snapshot.values_json` |
| Chemical | `chemical_transaction` |
| Alarms | `alarm_event` |
| Historical Trends | `telemetry_sample` + `tag_definition` |
| Data Health | status REST/WebSocket dan record yang telah termuat |

Jika suatu data belum masuk ke PostgreSQL, dashboard menampilkan `Belum ada data aktual` atau `—`. Angka hasil generator prototype tidak digunakan sebagai fallback.

## Dataset uji integrasi

Dataset berlabel `TEST_SAMPLE` digunakan untuk memvalidasi alur database, REST API, dan WebSocket:

- `CL-DPN-01` dan `DSP-DPN-01` sebagai asset uji.
- Batch `TEST-CL-0001` dengan process run dan tiga step proses.
- Tiga tag Calator dan 18 sample historian.
- Satu transaksi chemical, empat snapshot utilitas, dan satu alarm test.

Semua record test diberi penanda `TEST_SAMPLE` atau prefix `TEST-` agar dapat dihapus tanpa mengenai data produksi.
