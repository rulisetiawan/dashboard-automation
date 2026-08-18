# Indeks Dokumentasi Project

Dokumentasi pada folder ini menggunakan versioning agar setiap perubahan konsep dapat ditinjau kembali tanpa kehilangan riwayat.

## Dokumen aktif

| Dokumen | Versi | Status | Keterangan |
|---|---:|---|---|
| `SCADA_MES_Master_Concept_v1.0.md` | 1.0 | Baseline | Konsep induk, ruang lingkup, model operasional, arsitektur konseptual, dan roadmap |
| `machines/Machine_Concept_Jetflow_v1.9.md` | 1.9 | Aktif | SV/PV per langkah Jetflow Process Sequence |
| `machines/Machine_Concept_Calator_v1.5.md` | 1.5 | Aktif | Binding snapshot aktual untuk card dan Critical Process Calator |
| `machines/Machine_Concept_Dryer_v1.1.md` | 1.1 | Aktif | Diagnostic motor 3-phase untuk drive dan fan Dryer |
| `machines/Machine_Concept_Kalender_v1.12.md` | 1.12 | Aktif | Perbaikan alignment historical log Motor & Drive |
| `utilities/Plant_Utility_Concept_v1.1.md` | 1.1 | Aktif | Power meter 138 mesin dengan pie per area, ranking mesin, dan detail meter individual |
| `chemicals/Chemical_Dispensing_Calator_Concept_v1.5.md` | 1.5 | Aktif | Custom range pada log transaksi Chemical Dispensing Calator |
| `dashboard/Dashboard_V1_Concept_v1.30.md` | 1.30 | Aktif | Layout dashboard awal dipertahankan dengan sumber PostgreSQL aktual |
| `assets/Plant_Machine_Area_Mapping_v1.1.md` | 1.1 | Aktif | Master mapping 138 aset mesin: 133 mesin proses dan 5 dispensing Calator |
| `backend/Backend_Data_Architecture_Concept_v1.0.md` | 1.0 | Aktif | Fondasi edge-to-historian, model database, API, security, dan roadmap integrasi backend |
| `backend/Tag_Display_Mapping_Register_v1.0.md` | 1.0 | Aktif | Baseline canonical tag ke tampilan proses, utility, chemical, dan motor diagnostic |
| `backend/Backend_Data_Flow_Graph_v1.0.md` | 1.0 | Aktif | Graph transmisi telemetry, traceability batch, dan batas OT–IT |
| `backend/Database_Design_Concept_v1.0.md` | 1.0 | Aktif | Desain database PostgreSQL + TimescaleDB untuk master, historian, MES, utility, chemical, maintenance, dan audit |
| `backend/Non_Jetflow_Backend_Integration_v1.0.md` | 1.0 | Aktif | Implementasi awal D1/API read-only untuk Calator, Dryer, Kalender, Dispensing, dan Utilities |
| `backend/PostgreSQL_Local_Integration_v1.3.md` | 1.3 | Aktif | PostgreSQL service native lokal dengan kredensial terpisah dan API non-Jetflow |
| `backend/NestJS_PostgreSQL_Integration_v1.4.md` | 1.4 | Aktif | Endpoint telemetry/alarm dan snapshot values untuk dashboard actual-only |
| `releases/Backend_Architecture_V1.0.md` | 1.0 | Selesai | Baseline arsitektur dan mapping backend |
| `releases/Database_Design_V1.0.md` | 1.0 | Selesai | Baseline konsep database dan ERD |
| `releases/Backend_Non_Jetflow_V1.0.md` | 1.0 | Selesai | Fondasi backend non-Jetflow dan API dashboard |
| `releases/PostgreSQL_Local_V1.0.md` | 1.0 | Selesai | Koneksi dan API PostgreSQL lokal |
| `releases/Frontend_V1.43.md` | 1.43 | Selesai | Chemical Dispensing log custom range |
| `CHANGELOG.md` | Berkelanjutan | Aktif | Catatan perubahan antarversi |

## Aturan pembaruan

1. Dokumen konsep versi lama tidak ditimpa.
2. Update minor dibuat sebagai file versi baru, misalnya `v1.1`.
3. Update besar dibuat sebagai major version baru, misalnya `v2.0`.
4. Setiap perubahan wajib dicatat dalam `CHANGELOG.md`.
5. Dokumen aktif pada tabel indeks diperbarui ke versi terbaru.

## Status saat ini

Dokumentasi berada pada tahap baseline konseptual. Konsep mesin, utilitas, chemical dispensing, Dashboard V1, mapping awal 138 aset mesin, dan arsitektur backend telah ditambahkan. Tahap berikutnya adalah menetapkan nomor mesin aktual, hubungan dispensing–Calator, pilot, alamat data source, tag registry aktual, topology jaringan, infrastructure, serta kebutuhan operasional aktual.
