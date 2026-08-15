# Dashboard V1 Concept v1.14

**Versi:** 1.14  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** P&ID Chemical Dispensing Calator

## Perubahan tampilan

Halaman detail Chemical Dispensing Calator tidak lagi menampilkan placeholder remote display. Area tersebut digantikan P&ID SVG responsif untuk menjelaskan alur proses material:

`8 inlet valve → Tank 1 + loadcell → transfer valve → Tank 2 → Calator tujuan`

P&ID mengikuti unit dispensing yang dipilih sehingga daftar Calator tujuan konsisten dengan mapping Depan, Belakang, atau Timur.

## Prinsip operasional

- P&ID pada V1 adalah visualisasi monitoring read-only.
- Tidak ada remote HMI, IP stream, write-back, atau kontrol valve.
- State valve, level, loadcell, route aktif, dan interlock baru dapat ditampilkan sebagai aktual setelah tag PLC tervalidasi.
