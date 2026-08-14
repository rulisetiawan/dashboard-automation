# Frontend Dashboard V1.13

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Pemisahan informasi live dan historical pada Plant Overview

## Ringkasan

Plant Overview disusun ulang agar informasi aktual selalu berada di bagian atas. Seluruh KPI agregat dan grafik yang dipengaruhi pilihan periode ditempatkan di bagian Historical Performance di bawah informasi live.

## Struktur Plant Overview

### Live Now

- Machines Running.
- Machines Stopped.
- Electrical Demand.
- Active Exceptions dan alarm yang belum di-acknowledge.
- Requires Attention.
- Utility Snapshot aktual.
- Textile Process Flow.
- Active Process Runs.

Nilai pada bagian ini tidak berubah saat pengguna mengganti time range historical.

### Selected Range

- Good Production Output.
- Water Consumption.
- Energy Consumption.
- Total Machine Runtime.
- Machine Downtime.
- Production Output by Interval dalam grafik batang.

Seluruh nilai pada bagian ini mengikuti pilihan `1H`, `8H`, `24H`, atau `7D`.

## Perubahan Tampilan

- Label `LIVE NOW` ditempatkan sebelum seluruh kartu dan panel aktual.
- Label `SELECTED RANGE` ditempatkan setelah seluruh informasi live.
- Pemilih time range dipindahkan ke header bagian historical.
- Production Output tidak lagi ditampilkan di deretan KPI live.
- Water Consumption dan Chemical Today tidak lagi dicampur ke Utility Snapshot aktual.

## Batasan

- Nilai historical masih simulated.
- Definisi downtime, runtime, good output, dan energy aggregation harus dikunci saat integrasi tag aktual.
