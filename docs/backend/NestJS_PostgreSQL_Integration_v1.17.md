# NestJS PostgreSQL Integration v1.17

**Tanggal:** 28 Agustus 2026  
**Status:** Cross-process output comparison aktif

## Perluasan endpoint

`GET /api/v1/production/output-by-batch` sekarang menghitung seluruh proses produksi dalam satu query untuk production date dan shift yang sama.

Response tetap mengembalikan `batches` yang terfilter oleh `process_type` untuk donut batch. Field tambahan `process_totals` mengembalikan Jetflow, Calator, Dryer, dan Kalender dengan:

- `actual_value`;
- `estimated_value`;
- `effective_value`;
- jumlah batch;
- coverage actual, estimated, dan no data.

## Konsistensi filter

Satu response dipakai oleh:

- donut Production Output by Batch;
- KPI Production Output;
- bar chart Production Output by Process.

Dengan demikian ketiga tampilan selalu memakai production date, shift, unit, serta aturan actual/estimated yang sama. Pergantian mode dilakukan pada frontend terhadap ketiga nilai yang sudah disediakan backend tanpa membuat formula kedua.

## Aturan interpretasi

- `process_totals` adalah perbandingan stage dan tidak boleh dijumlahkan sebagai plant output.
- Default total plant tetap menggunakan Kalender sebagai final process.
- Nilai nol/no data dipisahkan dari proses terendah yang memiliki data ketika menghitung process gap.
