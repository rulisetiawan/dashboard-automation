# Machine Concept Kalender v1.11

**Versi:** 1.11  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Pengelompokan kolom Motor & Drive historical log

## Struktur log yang dirapikan

Complete historical log sekarang menggunakan tujuh kelompok kolom:

| Kolom | Isi |
|---|---|
| Timestamp | Waktu record historian |
| Phase R | RMS current dan voltage R-N |
| Phase S | RMS current dan voltage S-N |
| Phase T | RMS current dan voltage T-N |
| Load | Average current dan line voltage |
| Drive | Active power dan frequency |
| Quality | Current imbalance dan status |

Pengelompokan ini menjaga semua data penting terlihat dalam satu lebar modal tanpa membuat angka terlalu kecil atau tabel sulit dibaca.

## Catatan

Struktur CSV tetap lengkap dengan kolom individual agar dapat digunakan untuk analisa lebih lanjut di spreadsheet atau historian investigation.
