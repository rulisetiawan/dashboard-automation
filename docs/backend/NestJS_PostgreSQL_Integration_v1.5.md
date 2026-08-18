# NestJS + PostgreSQL Local Integration v1.5

**Tanggal:** 18 Agustus 2026  
**Status:** Database-driven dashboard dan equipment 3-phase

## Prinsip tampilan

Seluruh halaman yang dirender dashboard mengambil data dari API PostgreSQL. Nilai sensor, status, batch, process run, utility, chemical, alarm, dan motor tidak memakai angka generator frontend. Jika sebuah field belum ditulis collector, UI menampilkan `—` atau `No data`.

## Equipment motor / drive

Tabel baru:

- `equipment` — master motor/drive dan hubungan ke asset mesin.
- `equipment_snapshot` — state, current R/S/T, voltage RS/ST/TR, active power, frequency, runtime, energy, due maintenance, quality, dan timestamp.

Endpoint `GET /api/v1/equipment?asset_id={assetId}` menyediakan snapshot equipment untuk halaman detail mesin.

## Dataset contoh eksplisit

Script `scripts/inject-test-samples.mjs` hanya dijalankan manual dan menggunakan marker `TEST_SAMPLE`. Dataset mencakup:

| Proses | Asset contoh | Equipment 3-phase |
|---|---|---:|
| Jetflow | `JF-LA-01` | 9 |
| Calator | `CL-DPN-01` | 6 |
| Dryer | `DR-DPN-01` | 9 |
| Kalender | `KL-DPN-01` | 10 |
| Dispensing Calator | `DSP-DPN-01` | 3 |

Total 5 asset dan 37 motor/drive contoh. Setiap asset mempunyai snapshot, tag definition, telemetry sample, batch process run, serta nilai sensor sesuai prosesnya. Chemical, utilitas, dan alarm test juga diberi marker yang sama.

## Penggantian dengan data produksi

Collector aktual harus mengirimkan data ke tabel yang sama. Dataset test dapat ditemukan dengan `TEST_SAMPLE`, prefix `TEST-`, atau asset ID di atas, sehingga dapat dihapus secara terarah setelah commissioning.
