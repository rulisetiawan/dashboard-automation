# Indeks Dokumentasi Project

Dokumentasi pada folder ini menggunakan versioning agar setiap perubahan konsep dapat ditinjau kembali tanpa kehilangan riwayat.

## Dokumen aktif

| Dokumen | Versi | Status | Keterangan |
|---|---:|---|---|
| `SCADA_MES_Master_Concept_v1.0.md` | 1.0 | Baseline | Konsep induk, ruang lingkup, model operasional, arsitektur konseptual, dan roadmap |
| `machines/Machine_Concept_Jetflow_v1.9.md` | 1.9 | Aktif | SV/PV per langkah Jetflow Process Sequence |
| `machines/Machine_Concept_Calator_v1.5.md` | 1.5 | Aktif | Binding snapshot aktual untuk card dan Critical Process Calator |
| `machines/Machine_Concept_Dryer_v1.1.md` | 1.1 | Aktif | Diagnostic motor 3-phase untuk drive dan fan Dryer |
| `machines/Machine_Concept_Kalender_v1.20.md` | 1.20 | Aktif | Fabric wrap pada cylinder Upper/Lower dan loadcell sebagai roller kecil setelah masing-masing felt |
| `utilities/Plant_Utility_Concept_v1.1.md` | 1.1 | Aktif | Power meter 138 mesin dengan pie per area, ranking mesin, dan detail meter individual |
| `chemicals/Chemical_Dispensing_Calator_Concept_v1.11.md` | 1.11 | Aktif | Valve-only registry dengan status heartbeat/controller pada seluruh unit dispensing |
| `dashboard/Dashboard_V2_Concept_v2.3.md` | 2.3 | Aktif | Status heartbeat dan controller pada card asset tanpa full-page render |
| `dashboard/Dashboard_V1_Concept_v1.63.md` | 1.63 | Final V1 | Baseline presentasi V1 dengan tooltip tanpa blink saat refresh real-time |
| `assets/Plant_Machine_Area_Mapping_v1.1.md` | 1.1 | Aktif | Master mapping 138 aset mesin: 133 mesin proses dan 5 dispensing Calator |
| `backend/Backend_Data_Architecture_Concept_v1.0.md` | 1.0 | Aktif | Fondasi edge-to-historian, model database, API, security, dan roadmap integrasi backend |
| `backend/Tag_Display_Mapping_Register_v1.0.md` | 1.0 | Aktif | Baseline canonical tag ke tampilan proses, utility, chemical, dan motor diagnostic |
| `backend/Tag_Naming_Governance_v1.0.md` | 1.0 | Aktif | Standar penamaan, ownership, mapping PLC, dan lifecycle Tag Registry |
| `backend/Section_Parameter_Dictionary_v1.0.md` | 1.0 | Aktif | Kamus section fungsional mesin dan parameter/suffix signal baku |
| `backend/Backend_Data_Flow_Graph_v1.0.md` | 1.0 | Aktif | Graph transmisi telemetry, traceability batch, dan batas OT–IT |
| `backend/Database_Design_Concept_v1.0.md` | 1.0 | Aktif | Desain database PostgreSQL + TimescaleDB untuk master, historian, MES, utility, chemical, maintenance, dan audit |
| `backend/Non_Jetflow_Backend_Integration_v1.0.md` | 1.0 | Aktif | Implementasi awal D1/API read-only untuk Calator, Dryer, Kalender, Dispensing, dan Utilities |
| `backend/PostgreSQL_Local_Integration_v1.4.md` | 1.4 | Aktif | Akses PostgreSQL LAN terbatas untuk `pt_smm_scada` dari jaringan `192.168.100.0/24` |
| `backend/NestJS_PostgreSQL_Integration_v1.12.md` | 1.12 | Aktif | Metadata rule, parameter, unit, threshold, dan trigger pada Alarm API |
| `backend/Alarm_Rule_Engine_v1.0.md` | 1.0 | Aktif | Configurable threshold, hysteresis, delay, lifecycle, audit, dan WebSocket alarm engine |
| `backend/Batch_Abnormal_Log_Backend_Implementation_v1.1.md` | 1.1 | Aktif | Implementasi target achievement, dynamic PV/SV deviation, SV revision log, API, export, dan konfigurasi frontend |
| `backend/Batch_Abnormal_Log_Backend_Flow_v1.0.md` | 1.0 | Histori | Alur alarm aktual, korelasi batch, dan rancangan awal Process Deviation Engine |
| `backend/External_Batch_Ingestion_API_v1.2.md` | 1.2 | Aktif | Active batch sebagai source of truth dan proteksi snapshot dari overwrite telemetry |
| `backend/External_Batch_Ingestion_API_v1.1.md` | 1.1 | Histori | Kontrak identifier eksternal/internal dan dukungan progress desimal pada POST process run |
| `backend/External_Batch_Ingestion_API_v1.0.md` | 1.0 | Histori | Kontrak awal POST batch/process run, idempotency, validation, API key, dan WebSocket refresh |
| `backend/TimescaleDB_Historian_Integration_v1.0.md` | 1.0 | Aktif | Hypertable telemetry, continuous aggregate, columnstore, retention, dan routing query NestJS |
| `backend/PID_Live_State_Architecture_v1.2.md` | 1.2 | Aktif | Satu heartbeat per asset dengan projection card dan event status controller |
| `backend/Kalender_Batch_Tracking_Example_v1.1.md` | 1.1 | Aktif | Metadata batch KL-DPN-05 memakai telemetry aktual pukul 10.00–12.00 WIB |
| `backend/Chemical_CSV_Import_v1.0.md` | 1.0 | Aktif | Import 112.856 weighing dan emergency records ke chemical_transaction secara idempotent |
| `releases/Backend_Architecture_V1.0.md` | 1.0 | Selesai | Baseline arsitektur dan mapping backend |
| `releases/Database_Design_V1.0.md` | 1.0 | Selesai | Baseline konsep database dan ERD |
| `releases/Backend_Non_Jetflow_V1.0.md` | 1.0 | Selesai | Fondasi backend non-Jetflow dan API dashboard |
| `releases/PostgreSQL_Local_V1.0.md` | 1.0 | Selesai | Koneksi dan API PostgreSQL lokal |
| `releases/Frontend_V1.43.md` | 1.43 | Selesai | Chemical Dispensing log custom range |
| `releases/Dashboard_V2.1_Batch_API_Package.md` | 2.1 | Aktif | Paket V2 dengan external production batch ingestion API |
| `CHANGELOG.md` | Berkelanjutan | Aktif | Catatan perubahan antarversi |

## Aturan pembaruan

1. Dokumen konsep versi lama tidak ditimpa.
2. Update minor dibuat sebagai file versi baru, misalnya `v1.1`.
3. Update besar dibuat sebagai major version baru, misalnya `v2.0`.
4. Setiap perubahan wajib dicatat dalam `CHANGELOG.md`.
5. Dokumen aktif pada tabel indeks diperbarui ke versi terbaru.

## Status saat ini

Dokumentasi berada pada tahap baseline konseptual. Konsep mesin, utilitas, chemical dispensing, Dashboard V1, mapping awal 138 aset mesin, dan arsitektur backend telah ditambahkan. Tahap berikutnya adalah menetapkan nomor mesin aktual, hubungan dispensing–Calator, pilot, alamat data source, tag registry aktual, topology jaringan, infrastructure, serta kebutuhan operasional aktual.
