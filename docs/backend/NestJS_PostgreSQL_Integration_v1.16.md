# NestJS PostgreSQL Integration v1.16

**Tanggal:** 28 Agustus 2026  
**Status:** Production output per batch aktif

## Endpoint baru

`GET /api/v1/production/output-by-batch`

Query parameter:

| Parameter | Nilai |
|---|---|
| `production_date` | Tanggal produksi `YYYY-MM-DD` |
| `shift_code` | `A`, `B`, atau `C` |
| `process_type` | `jetflow`, `calator`, `dryer`, atau `kalender`; default `kalender` |

Response mengembalikan range shift Asia/Jakarta, daftar output per `batch_no`, source actual/estimated, aset yang berkontribusi, jumlah process run, unit, dan coverage summary.

## Prioritas output

Untuk setiap process run:

1. `batch_process_run.output_quantity` digunakan sebagai actual jika bernilai positif dan run dimulai di dalam shift terpilih.
2. Bila nilai tersebut tidak tersedia, delta tag dengan `signal_role` mengandung `OUTPUT_TOTAL` digunakan sebagai actual.
3. Bila actual tidak tersedia, estimate dihitung dari penjumlahan `avg_value` speed berunit `m/min` pada `telemetry_cagg_1m`.
4. Bucket estimate hanya digunakan bila memiliki good sample, tidak memiliki bad sample, dan speed lebih besar dari nol.

Process run duplikat untuk kombinasi asset dan batch dideduplikasi berdasarkan `source_updated_at`, `updated_at`, lalu `started_at` terbaru.

## Effective output

`effective_value` memilih actual atau estimated pada level process run, bukan menjumlahkan keduanya. Hasil process run kemudian dijumlahkan per batch. Source batch menjadi:

- `ACTUAL` bila seluruh effective output berasal dari actual;
- `ESTIMATED` bila seluruhnya merupakan fallback estimate;
- `MIXED` bila batch memiliki beberapa run dengan kombinasi sumber;
- `NO_DATA` bila tidak ada nilai valid.

Default Kalender digunakan pada Plant Overview untuk mencegah double counting lintas proses. Pemilihan proses lain merupakan breakdown proses, bukan total plant gabungan.
