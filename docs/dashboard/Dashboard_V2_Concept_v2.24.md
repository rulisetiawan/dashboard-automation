# Dashboard V2 Concept v2.24

**Versi:** 2.24  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.23.md`  
**Fokus perubahan:** Badge compact Auto/Manual pada Live Process Schematic

## Penempatan

- Header Live Process Schematic Chemical Dispensing menempatkan control mode tepat di sebelah `Controller Active/Offline`.
- Badge dibuat compact dan hanya menonjolkan label `AUTO`, `MANUAL`, atau `UNKNOWN`.
- Detail quality dan waktu feedback tetap tersedia melalui tooltip agar header tidak menjadi padat.

## Perilaku realtime

Badge memakai `SMM.{ASSET_ID}.MACHINE.AUTO_MODE_FB` yang sama seperti overview dan header detail unit. Perubahan `instrument:delta` atau `asset:communication` memperbarui semua badge dengan asset ID yang sama tanpa merender ulang SVG.

Aturan V2.23 tetap berlaku: mode hanya valid saat quality `GOOD` dan heartbeat controller sehat.
