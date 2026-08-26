# Machine Concept Kalender v1.17

**Versi:** 1.17  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Koreksi alur kain dan tata letak P&ID Kalender

## Alur proses baku

P&ID menampilkan satu jalur kain kontinu dari kiri ke kanan:

1. **Fabric supply** — kain berasal dari trolley/stack di area infeed.
2. **Inlet dan pre-heating** — kain dinaikkan melewati guide roller atas lalu turun menuju sensor lebar.
3. **Expander L/R** — kain dibuka dan disejajarkan sebelum masuk ke unit Kalender.
4. **Upper dan lower heated cylinder** — kain mengikuti rangkaian guide roller, upper felt, dan lower felt tanpa garis saling silang.
5. **Cooling belt** — kain keluar dari unit pemanas dan didinginkan pada belt horizontal.
6. **Dancing roller** — posisi kain turun pada dancing roller untuk menjaga tension.
7. **Conveyor dan folder** — kain kembali naik menuju conveyor, lalu diarahkan oleh folder.
8. **Plaiter output table** — kain dilipat di atas meja output, bukan di bawah rangka mesin.

## Instrumentasi yang dipertahankan

- Heating inlet valve `HEATING_INLET_VALVE`
- Upper heating valve `UPPER_HEATING_VALVE`
- Lower heating valve `LOWER_HEATING_VALVE`
- Fabric width sensor `FABRIC_WIDTH_SENSOR`
- Temperature upper/lower `UPPER_TEMPERATURE`, `LOWER_TEMPERATURE`
- Loadcell upper/lower `LOADCELL_UPPER`, `LOADCELL_LOWER`
- Dancing roller `DANCING_ROLLER`
- Motor inlet, expander L/R, upper/lower felt, cooling belt, conveyor, plaiter, dan conveyor table

Seluruh `data-element-code` lama dipertahankan agar binding live dari `instrument_state` dan delta WebSocket tidak berubah. Perubahan versi ini hanya memperbaiki geometri, keterbacaan, urutan proses, dan posisi equipment.

## Catatan engineering

Diagram ini adalah process schematic untuk monitoring dashboard, bukan dokumen konstruksi. Diameter pipa, class steam, condensate return, fail-safe valve, interlock, dan nomor loop final wajib divalidasi terhadap P&ID/OEM drawing mesin aktual sebelum commissioning.
