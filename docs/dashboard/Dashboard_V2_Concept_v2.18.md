# Dashboard V2 Concept v2.18

**Versi:** 2.18  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.17.md`  
**Fokus perubahan:** Sinkronisasi indikator shift header

## Current shift header

Indikator shift pada header dihitung dari waktu `Asia/Jakarta` dan diperbarui setiap detik bersama jam dashboard:

| Shift | Rentang waktu | Production date |
|---|---|---|
| A | 07:00–15:00 | tanggal kalender saat ini |
| B | 15:00–23:00 | tanggal kalender saat ini |
| C | 23:00–07:00 | tanggal mulai shift; pukul 00:00–06:59 memakai tanggal sebelumnya |

Header menampilkan nama shift dan rentang waktunya. Tooltip serta accessibility label menyertakan production date yang aktif.

## Batas tanggung jawab

- Header menunjukkan shift operasional yang sedang berjalan.
- Filter Production Output by Batch dan Machine Performance tetap mengikuti pilihan analisis pengguna.
- Perpindahan shift aktual tidak menimpa tanggal atau shift historis yang sedang dianalisis.
