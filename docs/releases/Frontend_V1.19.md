# Frontend Dashboard V1.19

**Tanggal:** 15 Agustus 2026  
**Status:** Selesai  
**Fokus:** Compact Jetflow process sequence

## Perubahan

- Kartu besar process sequence pada detail Jetflow diganti menjadi tabel ringkas.
- Tabel menampilkan Step, Process, dan Status.
- Area tabel memiliki tinggi tetap dan vertical scroll agar sequence hingga sekitar 100 step tidak memperpanjang halaman.
- Header tabel dibuat sticky selama daftar digulir.
- Current Process tetap diberi highlight, sedangkan Complete dan Pending memiliki indikator status yang berbeda.
- Tabel mendukung horizontal scroll pada layar sempit.

## Batasan

- Data frontend masih menggunakan 12 step simulated.
- Mapping dan jumlah sequence aktual akan mengikuti recipe PLC pada tahap integrasi.
