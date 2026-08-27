# Dashboard V2 Concept v2.4

**Versi:** 2.4  
**Tanggal:** 27 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.3.md`  
**Fokus perubahan:** Nilai aktual loadcell pada SVG Chemical Dispensing

## Perubahan tampilan

P&ID Chemical Dispensing menampilkan berat aktual Tank 1 dalam kilogram. Nilai diperbarui melalui `instrument:delta` tanpa full-page render dan tanpa mengganggu scroll, filter, atau interaksi user.

Keadaan tampilan:

- `GOOD`: angka live ditampilkan normal;
- `STALE`, `BAD`, atau `NOT_CONNECTED`: last known value tetap terlihat dengan label quality;
- belum ada nilai: `LC-101 · NO LIVE VALUE`.

Status `Controller Active/Offline` dari v2.3 tetap ditampilkan dan tidak digantikan oleh nilai loadcell.

