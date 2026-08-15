# Dashboard V1 Concept

## Versi 1.11 — Chemical Dispensing Calator Transaction Workspace

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.10.md`

## Perubahan Konsep

Chemical Dispensing Calator menggunakan model transaksi request–weighing–transfer. Oleh karena itu detail halaman dibangun sebagai tabel traceability yang dapat difilter, bukan workspace trend batch mesin proses.

## Prinsip Pemisahan Domain

- Dispensing Calator: request code, timbang chemical, mode manual/automatic, dan tujuan Calator.
- Dye Kitchen Jetflow: domain baru di masa depan dengan recipe dyeing, color code, dosing, dan proses yang berbeda.
