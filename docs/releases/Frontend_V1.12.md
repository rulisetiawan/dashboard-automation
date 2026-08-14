# Frontend Dashboard V1.12

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Production output bar trend pada Plant Overview

## Ringkasan

Trend Production Throughput pada Plant Overview diubah menjadi grafik batang yang menampilkan total good fabric output per interval. Grafik, KPI output, dan ringkasan statistik mengikuti pilihan time range `1H`, `8H`, `24H`, atau `7D`.

## Perubahan

- Grafik garis Actual versus Target diganti dengan grafik batang Production Output by Interval.
- Interval batang menyesuaikan time range:
  - `1H`: output per 5 menit.
  - `8H`: output per jam.
  - `24H`: output per 2 jam.
  - `7D`: output per hari.
- Nilai output ditampilkan pada setiap batang agar dapat dibaca langsung.
- Panel menampilkan Total Output, Average per interval, dan Peak per interval.
- KPI Active Output menjadi Good Production Output dan mengikuti time range yang dipilih.
- Perubahan time range tetap mempertahankan posisi scroll halaman.

## Definisi Data

- Output menggunakan satuan meter kain.
- Good Production Output adalah panjang kain hasil produksi yang lolos sebagai output baik pada interval terpilih.
- Total Output merupakan penjumlahan seluruh batang dalam time range.
- Average merupakan rata-rata output per interval.
- Peak merupakan output interval tertinggi.

## Batasan V1.12

- Nilai output masih simulated dan belum bersumber dari counter aktual mesin.
- Belum ada pemisahan output berdasarkan proses, area, mesin, batch, atau grade quality.
- Reset counter, koreksi meter, dan aturan scrap/rework belum diterapkan.

## Rekomendasi Integrasi Berikutnya

- Tetapkan sumber tag counter output per mesin dan aturan agregasinya.
- Hubungkan output ke batch, nomor kain, mesin, area, dan hasil QC.
- Pisahkan gross output, good output, reject, rework, dan loss.
- Tambahkan drill-down dari batang waktu menuju ranking area dan mesin.
