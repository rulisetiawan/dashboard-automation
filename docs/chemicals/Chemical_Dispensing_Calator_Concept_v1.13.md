# Chemical Dispensing Calator Concept v1.13

**Versi:** 1.13  
**Tanggal:** 27 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.12.md`  
**Fokus perubahan:** Penekanan visual nilai live loadcell pada P&ID

## Readout Tank 1

Nilai `SMM.{ASSET_ID}.TANK_01.WEIGHT_PV` tetap menjadi sumber berat aktual Tank 1. Tampilan di dalam vessel dipisahkan menjadi tiga lapis:

1. label instrumen `LC-101 · LIVE WEIGHT`;
2. angka berat aktual berukuran besar dengan unit `kg`;
3. quality terpisah agar status tidak memperpanjang atau mengecilkan angka.

## Quality visual

- `GOOD`: panel hijau dengan titik live berdenyut halus;
- `STALE`: panel kuning dan last known value tetap terlihat;
- `BAD` atau `NOT_CONNECTED`: panel merah dan last known value tetap terlihat;
- belum ada nilai: panel netral dengan `— kg` dan `NO DATA`.

Pulse dinonaktifkan saat sistem operasi mengaktifkan reduced motion.

## Konsistensi data

Perubahan ini hanya pada presentasi. Binding WebSocket `instrument:delta`, sumber `tag_latest`, pemisahan heartbeat controller, dan penyimpanan hasil final ke `chemical_transaction.actual_kg` tetap mengikuti v1.12.
