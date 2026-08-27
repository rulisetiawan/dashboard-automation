# Dashboard V2 Concept v2.5

**Versi:** 2.5  
**Tanggal:** 27 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.4.md`  
**Fokus perubahan:** Readout besar nilai live loadcell Chemical Dispensing

## Perubahan tampilan

P&ID Chemical Dispensing menempatkan berat aktual Tank 1 sebagai angka utama berukuran besar di dalam equipment plate. Label `LC-101`, angka dan unit, serta quality berada pada elemen terpisah agar operator dapat membaca nilai dengan cepat.

Keadaan warna mengikuti quality aktual:

- `GOOD`: hijau;
- `STALE`: kuning;
- `BAD` atau `NOT_CONNECTED`: merah;
- belum ada data: netral.

Status controller tetap berada pada card utama sebagai validasi koneksi yang terpisah dari quality nilai loadcell. Sumber data dan lifecycle realtime tidak berubah dari v2.4.
