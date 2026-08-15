# Machine Concept Kalender v1.7

**Versi:** 1.7  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Motor & Drive Diagnostic modal dan pembacaan 3-phase

## Motor & Drive Diagnostic

Detail motor Kalender dibuka sebagai modal/pop-up terpusat agar analisa tidak terlalu lebar atau menempel pada tepi halaman dashboard. Latar belakang dashboard tetap terlihat redup, sedangkan konten modal memiliki ruang aman di sekeliling layar dan area scroll internal untuk layar kecil.

## Data 3-phase R/S/T

Bagian **Live Now** memisahkan pembacaan motor tiga fase:

| Data | R | S | T |
|---|---|---|---|
| RMS Current | Arus fase R | Arus fase S | Arus fase T |
| Voltage | Tegangan R-N | Tegangan S-N | Tegangan T-N |
| Balance | Dibandingkan terhadap rata-rata arus | Dibandingkan terhadap rata-rata arus | Dibandingkan terhadap rata-rata arus |

Dashboard tetap menampilkan ringkasan RMS current rata-rata dan line voltage rata-rata agar operator dapat membaca kondisi umum secara cepat. Nilai **current imbalance** dihitung dari deviasi maksimum arus fase terhadap rata-rata arus tiga fase.

## Batasan

- Pembacaan R/S/T pada V1 masih simulated.
- Tegangan ditampilkan sebagai phase-to-neutral; tag line-to-line dan kualitas daya dapat ditambahkan setelah power meter/drive tag tervalidasi.
- Modal dan data bersifat read-only, tanpa write-back ke drive atau PLC.
