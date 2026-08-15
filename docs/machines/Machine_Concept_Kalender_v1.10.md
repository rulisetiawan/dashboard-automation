# Machine Concept Kalender v1.10

**Versi:** 1.10  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Layout historical motor tanpa horizontal scroll

## Penyederhanaan tabel

Tabel diagnostic dipadatkan tanpa mengurangi data:

- Statistik fase menampilkan current `min / avg / max` dalam satu kolom dan voltage `min / avg / max` dalam satu kolom.
- Complete log menggabungkan ampere dan voltage pada satu kolom untuk masing-masing fase R, S, dan T.
- Kolom tambahan tetap tersedia: timestamp, average current, line voltage, kW, Hz, imbalance, dan status.

## Responsif

- Desktop: tabel memenuhi lebar modal tanpa scroll horizontal.
- Layar kecil: header tabel disederhanakan dan setiap record ditampilkan sebagai kartu dua kolom, sehingga tidak memerlukan geser kiri/kanan.

CSV tetap menggunakan struktur data lengkap agar cocok untuk analisa offline.
