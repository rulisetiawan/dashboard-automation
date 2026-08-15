# Machine Concept Kalender v1.9

**Versi:** 1.9  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Export dan complete historical motor log

## Complete Historical Data Log

Modal Motor & Drive menyediakan tabel log seluruh sample pada selected range `1H`, `8H`, `24H`, atau `7D`. Tabel dapat di-scroll dan header kolom tetap terlihat.

| Kelompok data | Kolom |
|---|---|
| Waktu | Timestamp |
| Arus | Current R, S, T, dan average current |
| Tegangan | Voltage R-N, S-N, T-N, dan line voltage |
| Drive | Active power, drive frequency |
| Kualitas 3-phase | Current imbalance dan status |

Log dapat dicocokkan dengan nomor batch, alarm proses, downtime, dan log operator pada timestamp yang sama.

## Export CSV

Tombol **Export CSV** mengunduh seluruh record log untuk motor dan time range yang aktif. Nama file memuat motor ID serta pilihan range. Isi ekspor identik secara struktur dengan tabel log: timestamp, R/S/T current, R/S/T voltage, average/line voltage, kW, Hz, imbalance, dan status.

## Batasan

Data log dan hasil export masih simulated. Saat integrasi, export harus mengambil data historian yang sama dengan data yang tampil agar timestamp dan nilai 100% konsisten.
