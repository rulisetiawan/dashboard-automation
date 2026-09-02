# Dashboard V2 Concept v2.30

**Versi:** 2.30
**Tanggal:** 2 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.29.md`

## Fokus perubahan

Rekonsiliasi totalizer mengikuti nilai pada batas waktu analisis dan kartu perbandingan dibuat lebih sederhana.

## Totalizer boundary delta

Untuk setiap time range, sistem memilih transaksi final dengan timestamp paling awal dan paling akhir yang memiliki totalizer.

`Totalizer Delta = Totalizer Akhir − Totalizer Awal`

Contoh dua hari:

- totalizer awal tanggal 1: `6.500 L`;
- totalizer akhir tanggal 2: `7.300 L`;
- totalizer delta: `800 L`.

Backend flow-meter sum tetap dihitung dari seluruh transaksi final pada range. Selisih rekonsiliasi adalah totalizer delta dikurangi backend flow-meter sum.

## Tampilan perbandingan

- Setiap card memiliki satu header, dua nilai utama, satu divider, dan satu baris selisih.
- Nested card, latar berwarna berlapis, dan notasi `vs` tidak digunakan.
- Warna status hanya diterapkan pada nilai selisih agar informasi utama tetap tenang dan mudah dibaca.
- Detail totalizer menampilkan formula nilai akhir dikurangi nilai awal.
