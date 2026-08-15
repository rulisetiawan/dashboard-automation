# Konsep Dashboard V1

## Versi 1.2 — Full-width Batch Historian Table

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.1.md`

## 1. Tujuan Pembaruan

Versi ini mengubah Batch Historian Lookup pada detail mesin agar tabel Recent Batches menggunakan seluruh lebar card. Tujuannya meningkatkan keterbacaan data batch dan menghilangkan ruang kosong yang sebelumnya muncul di sisi kiri tabel.

## 2. Struktur Tampilan

- Informasi Batch Historian Lookup dan form pencarian berada pada baris header.
- Tabel Recent Batches ditempatkan pada baris berikutnya dengan lebar penuh.
- Kolom Batch No., Start, End, Status, dan Action dibagi secara konsisten sepanjang card.
- Vertical scroll dan sticky header tetap dipertahankan untuk daftar batch yang panjang.
- Horizontal scroll tetap tersedia pada layar sempit.
- Pada ukuran tablet, informasi dan form pencarian otomatis ditumpuk sebelum tabel.

## 3. Cakupan

Layout full-width berlaku pada komponen Batch Historian Lookup bersama sehingga konsisten untuk detail Jetflow, Calator, Dryer, Kalender, dan Chemical Dispensing.

## 4. Batasan V1.2

- Data recent batch masih simulated.
- Filter, sorting kolom, dan pagination server-side belum tersedia.
