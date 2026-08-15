# Backend Architecture v1.0

**Tanggal:** 15 Agustus 2026  
**Status:** Baseline konseptual selesai

## Hasil

- Konsep backend end-to-end dari PLC/meter/drive hingga dashboard, historian, MES context, dan AI advisory.
- Canonical tag registry dengan source mapping yang dapat diveri dan tidak mengikat frontend ke alamat PLC.
- Baseline PostgreSQL + TimescaleDB untuk master data, transaksi MES, telemetry time-series, snapshot, event, KPI, dan aggregate.
- Register mapping awal tag ke tampilan plant overview, Jetflow, Calator, Dryer, Kalender, Chemical Dispensing, utilities, dan motor diagnostic.
- Graph alur transmisi telemetry, siklus sample, batch traceability, serta batas keamanan OT–IT.

## Keputusan penting

- Fase awal tetap read-only; dashboard dan AI tidak dapat memberi command ke PLC.
- Semua machine dashboard dibangun dari asset/equipment/tag configuration agar mampu berkembang menuju sekitar 300 aset.
- Batch/process run menjadi context wajib untuk menghubungkan sensor, recipe, event, utility, motor, chemical, output, dan QC.

## Dokumen terkait

- [Backend Data Architecture Concept v1.0](../backend/Backend_Data_Architecture_Concept_v1.0.md)
- [Tag & Display Mapping Register v1.0](../backend/Tag_Display_Mapping_Register_v1.0.md)
- [Backend Data Flow Graph v1.0](../backend/Backend_Data_Flow_Graph_v1.0.md)

## Batasan

- Canonical tag, database schema, dan endpoint masih merupakan baseline desain; alamat PLC, protocol, unit/scaling, limits, serta formula resmi KPI belum divalidasi pada commissioning.
