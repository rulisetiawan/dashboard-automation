# Dashboard V2 Concept v2.32

**Tanggal:** 19 September 2026  
**Status:** Implemented  
**Baseline:** `Dashboard_V2_Concept_v2.31.md`

## Finishing machine expansion

Dashboard menambahkan empat menu Operations baru:

- Continuous — 4 asset;
- Inspecting — 12 asset;
- Finishing — 1 asset;
- Setting Dongnam — 4 asset.

Setiap menu memakai pola drill-down yang sama: fleet overview, area, machine detail, connection status, operational summary, live sensors, batch lookup, historian, equipment, dan alarm context.

Bagian `Parameter Utama` menjelaskan scope monitoring sebelum tag aktual tersedia. Card status dan nilai tidak menggunakan fallback simulasi; asset commissioning tampil offline/no data sampai heartbeat dan telemetry aktual diterima.

Production Output by Batch dapat memilih keempat proses baru. Actual output totalizer diprioritaskan, sedangkan estimasi dari speed historian hanya digunakan sebagai fallback.
