# Dashboard V1 Concept v1.31

**Tanggal:** 18 Agustus 2026  
**Status:** Database-driven fleet, detail, dan motor diagnostic

## Tampilan yang membaca database langsung

- Fleet overview: jumlah asset dan machine state per area.
- Area drill-down: asset, batch, progress, quality, dan source timestamp.
- Machine detail: nilai `asset_snapshot.values_json` serta unit dari `tag_definition`.
- Motor & driven equipment: `equipment_snapshot` untuk R/S/T, voltage, kW, Hz, runtime, energy, dan due maintenance.
- Process run: `batch_process_run`.
- Utility, chemical, alarm, dan historian: tabel operasional masing-masing.

Struktur visual card/fleet/area tetap dipertahankan. Data yang belum disuplai database tidak dibuat-buat oleh frontend.
