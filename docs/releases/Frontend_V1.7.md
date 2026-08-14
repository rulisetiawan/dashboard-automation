# Frontend Dashboard V1.7

**Tanggal:** 14 Agustus 2026  
**Status:** Area-linked machine ranking selesai

## Tujuan update

Membuat interaksi consumption pie dan ranking mesin bekerja pada konteks overview yang sama. Pemilihan area tidak lagi memindahkan halaman sebelum pengguna memilih mesin yang ingin diperiksa.

## Fitur yang ditambahkan

- Klik segmen donut atau legend area langsung memfilter panel ranking di sebelah kanan.
- Ranking hanya menampilkan mesin yang termasuk dalam area/lane terpilih.
- Judul dan subtitle ranking menampilkan nama area aktif serta jumlah mesin dalam scope.
- Segmen donut dan baris legend terpilih memiliki active highlight.
- Ranking scope ditampilkan di atas chart.
- Tombol **All Areas** atau **All Lanes** mengembalikan ranking ke seluruh fleet.
- Klik mesin pada ranking tetap membuka halaman detail mesin.
- Filter area bekerja pada seluruh overview proses:
  - Jetflow per Lane A–F;
  - Calator per Depan, Belakang, Timur;
  - Dryer per Depan, Belakang, Timur;
  - Kalender per Depan, Belakang, Timur;
  - Dispensing per Depan, Belakang, Timur.

## Diubah

- Klik consumption donut tidak lagi langsung membuka halaman area machine list.
- Halaman area machine list tetap dapat dibuka melalui area card di bagian Area Status.

## Batasan

- Nilai konsumsi dan ranking masih simulated.
- Filter area belum disimpan sebagai preferensi pengguna permanen.
