# Dashboard V1 Concept v1.36

**Tanggal:** 21 Agustus 2026

**Status:** Peningkatan keterbacaan trend motor 3-phase

## Perubahan

- Warna trend current motor dibuat lebih kontras:
  - Phase R: biru `#0072B2`
  - Phase S: oranye `#D55E00`
  - Phase T: hijau `#009E73`
- Ketiga garis menggunakan ketebalan yang sama agar tidak ada phase yang terlihat lebih dominan.
- Fill area pada Phase R dihapus agar tidak menutupi garis Phase S dan Phase T.
- Warna legend disamakan dengan warna garis grafik.
- Label sumbu Y khusus trend motor dibatasi maksimal dua angka desimal.
- Nilai Power Average, Frequency, dan Energy Delta dibatasi maksimal dua angka desimal.

Perubahan hanya memengaruhi format presentasi. Nilai sumber dan presisi yang disimpan pada PostgreSQL tidak diubah.
