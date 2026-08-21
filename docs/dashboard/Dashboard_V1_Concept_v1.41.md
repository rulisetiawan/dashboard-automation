# Dashboard V1 Concept v1.41

**Tanggal:** 21 Agustus 2026

**Status:** Stabilitas posisi pagination Chemical Transaction Log

## Perubahan

- Tombol `Previous` dan `Next` tidak mengembalikan viewport ke bagian atas halaman.
- Posisi bagian Chemical Transaction Log dipertahankan relatif terhadap viewport setelah data baru dirender.
- Tabel lama tidak diganti dengan panel loading sementara selama query halaman berikutnya berjalan.
- Tombol pagination dan pilihan jumlah baris dinonaktifkan sementara untuk mencegah request ganda.
- Perubahan jumlah baris per halaman memakai mekanisme scroll anchor yang sama.

## Alur Interaksi

1. Operator menekan `Next`, `Previous`, atau mengganti jumlah baris.
2. Posisi panel transaksi dicatat.
3. Query halaman baru dikirim ke PostgreSQL tanpa menghapus tabel aktif.
4. Setelah respons diterima, tabel dirender ulang dan posisi panel dipulihkan.

## Batas Perubahan

- Filter, isi transaksi, perhitungan jumlah halaman, dan query backend tidak diubah.
- Mekanisme ini hanya diterapkan pada pagination Chemical Transaction Log.
