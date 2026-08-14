# Frontend Dashboard V1.4

**Tanggal:** 14 Agustus 2026  
**Status:** Management cockpit dan consumption drill-down selesai

## Tujuan update

Membuat halaman overview setiap proses dapat dibaca cepat oleh management, tetapi tetap menyediakan jalur investigasi dari agregat pabrik menuju area/lane dan mesin individual.

## Fitur yang ditambahkan

### Pemisahan data real-time dan historis

- Grup **Live Now** untuk jumlah mesin running, mesin stopped, active exception, dan demand utilitas aktual.
- Grup **Selected Range** untuk total runtime, unplanned downtime, output, serta konsumsi resource.
- KPI Live Now tidak dipengaruhi perubahan tanggal historis.
- KPI Selected Range mengikuti preset 1H, 8H, 24H, 7D, 30D, atau custom start–end.

### KPI spesifik proses

- Jetflow: water, electrical energy, steam, batch output.
- Calator: water, chemical, electrical energy, fabric output.
- Dryer: electrical energy, thermal oil energy, fabric output.
- Kalender: steam, electrical energy, fabric output.
- Dispensing: chemical delivered, electrical energy, completed transfer.

### Consumption drill-down

- Donut interaktif untuk distribusi konsumsi per lane/area.
- Pemilihan jenis resource langsung dari panel distribusi.
- Klik segmen donut atau legenda membuka area terkait.
- Daftar area diurutkan menjadi ranking konsumsi per mesin.
- Klik mesin dari ranking overview maupun area langsung membuka halaman detail mesin.
- Time range tetap dipertahankan saat berpindah dari overview ke area dan machine detail.

### Analisis management

- Top five consumers per proses.
- Unplanned downtime Pareto per proses.
- Meter coverage indicator sebagai pengingat kelengkapan instrumentasi.
- Planned idle dipisahkan secara konseptual dari unplanned downtime.

## Batasan V1.4

- Seluruh nilai konsumsi, runtime, downtime, output, dan Pareto masih simulated.
- Meter coverage belum berasal dari tag registry aktual.
- Belum ada normalisasi konsumsi terhadap kilogram kain, meter kain, batch, recipe, atau jenis material.
- Belum ada perbandingan target, baseline, previous period, biaya rupiah, atau carbon emission.
- Data ranking belum berasal dari historian dan energy meter aktual.

## Arah update berikutnya

1. Tetapkan tag source dan unit engineering setiap meter.
2. Tetapkan definisi resmi running, stopped, planned idle, dan unplanned downtime.
3. Hubungkan konsumsi terhadap batch/nomor kain agar tersedia specific consumption.
4. Tambahkan target, baseline, previous-period comparison, dan cost conversion.
5. Ganti simulated data dengan API real-time serta historian aggregation.
