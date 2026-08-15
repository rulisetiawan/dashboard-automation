# Frontend Dashboard V1.20

**Tanggal:** 15 Agustus 2026  
**Status:** Selesai  
**Fokus:** Waktu proses pada sequence Jetflow

## Perubahan

- Ditambahkan kolom Start Time dan End Time pada tabel process sequence Jetflow.
- Waktu ditampilkan dalam format `HH:mm:ss` dengan angka yang rata dan mudah dipindai.
- Proses aktif menampilkan Start Time dan status `In progress` pada End Time.
- Proses yang belum berjalan menampilkan `—` agar tidak dianggap sebagai waktu aktual.
- Lebar minimum tabel disesuaikan dan tetap dapat digulir horizontal pada layar kecil.

## Batasan

- Timestamp masih simulated dan belum berasal dari event sequence PLC.
