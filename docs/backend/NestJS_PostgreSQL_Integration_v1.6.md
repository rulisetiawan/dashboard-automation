# NestJS + PostgreSQL Local Integration v1.6

**Tanggal:** 18 Agustus 2026  
**Status:** Historian rollup untuk query harian, mingguan, dan bulanan

## Tujuan

Telemetry mentah harus tetap tersedia untuk audit, alarm investigation, dan analisis batch. Namun Plant Overview tidak boleh menghitung jutaan row mentah setiap kali management memilih `7D`, `30D`, atau custom range. Versi ini menambahkan lapisan historian query-ready pada PostgreSQL native tanpa mengubah data raw.

```text
PLC / gateway
   -> telemetry_sample (raw, immutable)
   -> asset_snapshot / equipment_snapshot (nilai live terbaru)
   -> aggregate 1m / 15m / daily (query historical dashboard)
   -> NestJS API -> dashboard
```

## Struktur penyimpanan

| Kebutuhan | Tabel | Cara pakai |
|---|---|---|
| Live sekarang | `asset_snapshot`, `equipment_snapshot`, `utility_snapshot` | Satu row terbaru per asset/equipment/utility. Tidak dipakai untuk trend. |
| Detail troubleshooting | `telemetry_sample` | Nilai raw bertimestamp, quality, gateway, dan `message_id` unik. |
| Trend pendek | `telemetry_aggregate_1m` | Tampilan 1–24 jam dan investigasi detail. |
| Trend operasional | `telemetry_aggregate_15m` | Tampilan 1–14 hari dengan jumlah titik yang ringan. |
| KPI / laporan | `telemetry_aggregate_daily` | 15 hari, bulanan, dan perbandingan periode. |
| Total counter utility | `utility_sample`, `utility_aggregate_daily` | Konsumsi dihitung `last_value - first_value`, bukan penjumlahan counter. |
| Runtime/downtime | `machine_state_event`, `machine_state_aggregate_daily` | Durasi event dibagi tepat saat melewati tengah malam. |

Setiap aggregate menyimpan `sample_count`, jumlah data GOOD/BAD, minimum, maksimum, rata-rata, awal, akhir, delta, timestamp sumber terakhir, dan waktu refresh. Karena itu dashboard dapat menunjukkan coverage/quality dan tidak menyamarkan data yang hilang.

## Pemilihan tabel berdasarkan time range

| Rentang dipilih | Granularitas | Alasan |
|---|---|---|
| ≤ 24 jam | `1m` | Detail perubahan proses masih terbaca. |
| > 24 jam sampai 14 hari | `15m` | Cepat, tetapi pola shift/harian tetap terlihat. |
| > 14 hari | `daily` | Efisien untuk monthly KPI, cost, dan perbandingan area. |
| Troubleshooting waktu spesifik | raw `telemetry_sample` | Dipakai terbatas pada tag + asset + jendela waktu sempit. |

Frontend tidak boleh meminta semua raw data untuk range bulanan. Server menentukan query/range dan hanya mengirim titik yang relevan.

## Refresh dan konsistensi

`HistorianAggregationService` NestJS melakukan refresh rolling 48 jam pada startup lalu setiap lima menit. Jendela overlap menangani data gateway yang terlambat atau store-and-forward. Raw data tidak dihapus atau diubah oleh proses ini; bucket aggregate pada jendela tersebut dihapus lalu dihitung ulang secara idempotent.

Untuk produksi dengan gateway berkapasitas tinggi, collector sebaiknya memanggil worker refresh per asset/tag setelah batch ingest, dan job malam hari melakukan rekonsiliasi ulang 2–7 hari terakhir. Interval lima menit di local environment adalah baseline yang mudah dioperasikan, bukan batas permanen.

## Endpoint query historian

| Endpoint | Fungsi |
|---|---|
| `GET /api/v1/telemetry/aggregate?asset_id={id}&tag_code={tag}&granularity=1m|15m|daily&from={ISO}&to={ISO}` | Trend sensor yang sudah diringkas. |
| `GET /api/v1/utilities/aggregate?utility_code={code}&from={ISO}&to={ISO}` | Consumption harian berdasarkan delta totalizer utility. |
| `GET /api/v1/machine-states/aggregate?asset_id={id}&from={ISO}&to={ISO}` | Durasi state `running`, `stop`, `maintenance`, dan lainnya per hari. |

Semua endpoint tetap read-only dan memberi penanda `ACTUAL_DATABASE`.

## Aturan desain penting

1. `tag_code` canonical dan `asset_id` adalah identitas query; alamat PLC tidak digunakan sebagai key dashboard.
2. Totalizer energy/water/steam disimpan sebagai nilai counter. Consumption periode adalah delta setelah validasi reset/rollover meter.
3. Jika counter turun, gateway harus menulis event meter reset/rollover; aggregate tidak boleh dianggap konsumsi negatif tanpa aturan tersebut.
4. State event memiliki `started_at` dan `ended_at`, sehingga downtime dihitung berdasarkan durasi, bukan jumlah poll status.
5. Gunakan UTC untuk seluruh timestamp database. UI yang menampilkan WIB mengonversi saat rendering.
6. Retensi raw dan aggregate harus menjadi kebijakan terpisah: contoh awal raw 90–180 hari online, aggregate 1m 12 bulan, 15m 24 bulan, daily minimum 5 tahun. Angka final diset setelah volume tag dan kebutuhan QC ditetapkan.

## Contoh lokal yang tersedia

Jalankan manual:

```powershell
node --env-file=.env scripts/inject-test-samples.mjs
```

Script memasukkan telemetry contoh ke lima proses, 37 equipment motor/drive, totalizer utility (`TEST_ELECTRICAL_ENERGY`, `TEST_WATER_TOTAL`, `TEST_STEAM_TOTAL`), serta event state mesin. Semua record memiliki marker `TEST_SAMPLE` agar tidak tercampur dengan commissioning produksi.

## Lanjutan sebelum commissioning

- Tambahkan partitioning bulanan pada raw table saat volume sample aktual sudah diukur.
- Terapkan downsampling/max-point limit API dan export asynchronous untuk range besar.
- Definisikan handling resmi meter reset, timezone shift, dan retention policy bersama operation/IT.
- Tambahkan job queue/worker terpisah dari API untuk refresh skala 138 mesin dan ratusan tag.
