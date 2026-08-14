# Frontend Dashboard V1.9

**Tanggal:** 14 Agustus 2026  
**Status:** Machine sensor SV/PV comparison selesai

## Tujuan update

Menambahkan perbandingan trend Set Value dan Process Value pada setiap detail mesin, dengan pilihan sensor yang dapat diaktifkan atau dinonaktifkan oleh pengguna.

## Fitur yang ditambahkan

- Panel **Sensor SV / PV Comparison** pada detail:
  - Jetflow;
  - Calator;
  - Dryer;
  - Kalender;
  - Chemical Dispensing.
- Checkbox ON/OFF untuk masing-masing sensor.
- Tombol **All On** dan **All Off**.
- Pilihan periode trend 1H, 8H, dan 24H.
- Setiap sensor memiliki chart sendiri agar engineering unit yang berbeda tidak menggunakan skala yang sama.
- Garis PV menggunakan solid line.
- Garis SV menggunakan dashed line.
- Current PV, SV, dan deviation ditampilkan di atas setiap chart.
- Deviation yang melewati batas demo diberi warning indicator.
- Posisi scroll dipertahankan saat sensor atau periode trend diubah.

## Sensor awal per proses

- Jetflow: main temperature, water level, flow meter, dosing temperatures, dosing level.
- Calator: overfeed out, dancing roller, feeding, squeezing, folder, dan plaiter speed.
- Dryer: line speed, chamber temperatures, dan thermal oil supply.
- Kalender: upper/lower temperature, overfeed, upper/lower loadcell, dan fabric width.
- Dispensing: transfer flow, batch weight, line pressure, tank level, dan pump speed.

## Batasan

- SV, PV, deviation, dan historical series masih simulated.
- Daftar sensor belum berasal dari tag registry aktual.
- Batas deviation warning belum menggunakan recipe tolerance resmi.
- Belum tersedia export CSV dan pemilihan waktu custom khusus panel ini.
