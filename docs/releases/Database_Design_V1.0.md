# Database Design v1.0

**Tanggal:** 15 Agustus 2026  
**Status:** Baseline konseptual selesai

## Ditambahkan

- Konsep database PostgreSQL + TimescaleDB untuk menyatukan master asset/tag, historian, batch MES, utility, chemical, maintenance, event, KPI, dan audit.
- ERD konseptual asset–equipment–tag–sample serta batch–run–step–abnormality.
- Struktur logical schema, retention, live snapshot, aggregate, query path dashboard, dan tahapan implementasi database.

## Keputusan

- Database diakses oleh ingestion dan backend API; frontend serta PLC tidak saling mengakses langsung.
- Telemetry mentah tetap disimpan dan semua kartu/diagnostic dapat ditelusuri kembali ke tag sumber.

## Dokumen terkait

- [Database Design Concept v1.0](../backend/Database_Design_Concept_v1.0.md)
- [Backend Data Architecture Concept v1.0](../backend/Backend_Data_Architecture_Concept_v1.0.md)
