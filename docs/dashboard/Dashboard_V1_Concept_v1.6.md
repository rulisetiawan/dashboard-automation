# Dashboard V1 Concept

## Versi 1.6 — Contextual Batch Investigation untuk Jetflow

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.5.md`

## Perubahan Konsep

Investigasi batch Jetflow ditingkatkan dari perbandingan PV/SV biasa menjadi trend yang menyatukan nilai sensor dengan konteks recipe program. Tujuannya agar penelusuran abnormal tidak terlepas dari step proses yang sedang berjalan.

## Pengalaman Pengguna

1. Pengguna membuka detail Jetflow dan memuat nomor batch.
2. Pengguna mencentang sensor, misalnya Main Tank Temperature.
3. Trend menampilkan PV, SV, process band, dan marker saat setpoint berubah.
4. Ringkasan di atas trend memperlihatkan step, interval waktu, serta SV baru.
5. Pengguna membandingkan marker tersebut dengan abnormality log batch untuk menentukan investigasi lanjutan.

## Nilai untuk Operasi

- Menjawab perubahan target terjadi pada process step apa dan jam berapa.
- Mempercepat pembacaan apakah PV mengejar, terlambat, atau menyimpang dari recipe SV.
- Menjaga batch, sensor trend, program sequence, dan abnormality log pada satu konteks investigasi.

## Batasan

- Belum ada pembuktian otomatis bahwa target tercapai sesuai tolerance dan hold time.
- Data tetap simulated hingga historian dan event recipe diintegrasikan.
