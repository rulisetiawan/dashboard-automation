# Chemical Dispensing Calator Concept

## Versi 1.3 — Area Support dan Chemical Usage per Calator

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.2.md`

## Mapping Dispensing ke Calator

| Dispensing Unit | Calator yang Didukung |
|---|---|
| DSP-DPN-01 | CL-DPN-01 sampai CL-DPN-02 |
| DSP-BLK-01 | CL-BLK-01 sampai CL-BLK-05 |
| DSP-BLK-02 | CL-BLK-06 sampai CL-BLK-09 |
| DSP-TMR-01 | CL-TMR-01 sampai CL-TMR-04 |
| DSP-TMR-02 | CL-TMR-05 sampai CL-TMR-07 |

## Detail per Dispensing Unit

Setiap halaman dispensing hanya menampilkan Calator yang berada di bawah dukungannya.

- `Chemical Usage by Supported Calator` menampilkan matriks kg setiap varian chemical untuk setiap Calator tujuan.
- `Top Chemical per Calator` menampilkan tiga chemical dengan penggunaan tertinggi untuk setiap Calator.
- Klik Calator pada matriks otomatis memfilter Dispensing Request Log ke Calator tersebut.
- Filter chemical, mode Manual/Automatic, status, dan time range tetap berlaku di dalam scope dispensing unit.

## Batasan V1.3

- Mapping pembagian unit Belakang dan Timur adalah baseline konseptual untuk demonstrasi.
- Mapping pipe, valve route, scale, serta volume actual per Calator perlu divalidasi saat commissioning.
