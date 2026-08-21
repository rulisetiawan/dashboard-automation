# Dashboard V1 Concept v1.43

**Tanggal:** 21 Agustus 2026

**Status:** Navigasi langsung ke detail mesin

## Perubahan

- Klik baris asset pada Plant Overview langsung membuka detail mesin terkait.
- Dashboard menetapkan process page, selected asset, area, dan machine drill-down dalam satu aksi atomik.
- Navigasi tidak lagi berhenti pada overview proses atau overview area.
- Perilaku yang sama digunakan pada ranking mesin, daftar alarm, dan tautan detail power meter.
- Baris tabel asset mendukung navigasi keyboard dengan `Enter` dan `Space`.

## Alur Navigasi

```text
Plant Overview
  -> klik asset
  -> identifikasi process + asset ID
  -> set process page + area + selected machine
  -> Machine Detail
```

## Batas Perubahan

- Klik menu sidebar tetap membuka overview utama proses.
- Klik card area tetap membuka daftar mesin pada area tersebut.
- Data asset, telemetry, historian, dan query PostgreSQL tidak diubah.
