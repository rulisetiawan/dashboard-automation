# Dashboard V1 Concept

## Versi 1.8 — Kalender Configuration versus Actual

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.7.md`

## Perubahan Konsep

Detail Kalender memisahkan jelas tiga kelompok informasi: empat PV utama di bagian atas, parameter configuration recipe pada tabel khusus, dan live process/utility yang tidak menduplikasi nilai PV utama.

## Nilai Operasional

- Operator dapat membaca target loadcell, temperature, overspeed, dan fabric width dalam satu tabel.
- Management dapat melihat energy consumption dan power demand tanpa menggantikan pembacaan kualitas/setting proses.
- Perbandingan PV dan SV tetap tersedia pada Batch Historian Lookup.
