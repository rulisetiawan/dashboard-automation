# Konsep Mesin Kalender

## Versi 1.3 — Parameter Configuration dan Live Utility Context

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Kalender_v1.2.md`

## Perubahan

Panel `Upper / Lower Balance` diganti menjadi `Parameter Configuration` agar recipe dan batas pengaturan dapat dibaca langsung tanpa mencampurkan nilai actual dengan nilai target.

| Parameter | Satuan |
|---|---|
| SV Loadcell Upper | kg |
| SV Loadcell Lower | kg |
| SV Temperature Upper | °C |
| SV Temperature Lower | °C |
| Overspeed Expander | % |
| Overspeed Inlet | % |
| Overspeed Plaiter | % |
| Fabric Width | cm |

## Live Process & Utility

Area nilai lanjutan tidak lagi mengulang PV Loadcell dan Temperature dari empat kartu utama. Informasi yang ditampilkan adalah total energy consumption, power demand, dancing roller dalam persen, inlet speed, expander overspeed, dan plaiter overspeed.

## Standard Unit

- Loadcell Upper dan Lower menggunakan `kg` pada kartu utama, historian sensor, serta abnormality log.
- Dancing Roller menggunakan `%` dengan referensi center position.

## Batasan V1.3

- Nilai configuration, consumption, dan drive masih simulated.
- Recipe/setpoint aktual, source tag, revision recipe, serta approval perubahan configuration belum terhubung.
