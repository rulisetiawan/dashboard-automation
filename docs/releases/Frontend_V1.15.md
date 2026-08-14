# Frontend Dashboard V1.15

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Standard full bar chart pada Plant Overview

## Ringkasan

Grafik Production Output pada Plant Overview disederhanakan menjadi bar chart vertikal standar dengan batang solid dan lebar. Grafik menggunakan seluruh lebar panel dan tetap mengikuti pilihan periode historical.

## Perubahan

- Batang dibuat lebih lebar dan solid tanpa bentuk rounded/floating.
- Setiap batang dimulai dari baseline nol.
- Sumbu Y menampilkan skala output dalam meter kain.
- Gridline horizontal dan baseline dibuat lebih jelas.
- Nilai output tetap ditampilkan di atas masing-masing batang.
- Tinggi grafik desktop ditambah menjadi 320 px.
- Tampilan mobile menggunakan tinggi 260 px dan mengurangi label waktu yang berpotensi bertumpuk.

## Time Range

- `1H`: output per 5 menit.
- `8H`: output per jam.
- `24H`: output per 2 jam.
- `7D`: output per hari.

## Batasan

- Data output masih simulated.
- Tooltip, zoom, dan drill-down per batang belum tersedia.
