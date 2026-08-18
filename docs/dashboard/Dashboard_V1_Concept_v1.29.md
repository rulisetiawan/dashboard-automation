# Dashboard V1 Concept v1.29

**Tanggal:** 18 Agustus 2026  
**Status:** Perbaikan layout live sensor actual

## Perubahan

Panel **Live Sensor Measurements** kini menggunakan grid responsif. Setiap nilai `asset_snapshot.values_json` ditampilkan sebagai card tersendiri dengan:

- Asset ID
- Nama parameter
- Nilai dan engineering unit dari `tag_definition` / historian
- Quality snapshot
- Source timestamp

Badge `ACTUAL DATABASE` / `POSTGRESQL ACTUAL` juga diberi style tersendiri agar header tidak terpotong dan konsisten dengan tema dashboard.
