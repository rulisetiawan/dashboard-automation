# Machine Concept Kalender v1.12

**Versi:** 1.12  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Perbaikan alignment tabel historical motor

## Perbaikan

Struktur tabel log fase dikoreksi agar setiap data kembali berada di sel tabel (`td`) yang normal. Layout internal untuk RMS Ampere dan Voltage ditempatkan di dalam sel, bukan pada elemen sel tabelnya sendiri.

Hasilnya, setiap kolom Timestamp, Phase R/S/T, Load, Drive, dan Quality kembali sejajar secara konsisten dan tidak menumpuk pada satu area.
