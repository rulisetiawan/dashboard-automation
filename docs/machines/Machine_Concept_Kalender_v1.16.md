# Machine Concept Kalender v1.16

**Versi:** 1.16  
**Tanggal:** 24 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Live-state binding P&ID dari PostgreSQL ke SVG

## Perubahan

- P&ID mengambil initial state dari `GET /api/v1/assets/{assetId}/instrument-states`.
- Halaman detail subscribe ke WebSocket room asset melalui event `asset:subscribe`.
- Delta `instrument:delta` diterapkan langsung ke group SVG berdasarkan `data-element-code` tanpa me-render ulang halaman.
- State visual dibakukan: hijau untuk `OPEN/RUNNING/ACTIVE`, abu-abu untuk `CLOSED/STOPPED/INACTIVE`, merah untuk `FAULT/ALARM/BAD`, dan amber untuk `STALE`.
- Tooltip SVG memuat semantic state, effective quality, dan source timestamp.

## Mapping contoh

`SMM.KL-DPN-05.UPPER_HEATING_VALVE.OPEN_FB` diproyeksikan menjadi `element_code = UPPER_HEATING_VALVE`. Nilai `1` memberi state `OPEN`, sedangkan nilai `0` memberi state `CLOSED`.

Effective quality selalu diprioritaskan. Tag yang melewati `stale_after_seconds` ditampilkan sebagai `STALE`, walaupun nilai boolean terakhirnya masih `1`.
