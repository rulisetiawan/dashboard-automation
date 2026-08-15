# Indeks Dokumentasi Project

Dokumentasi pada folder ini menggunakan versioning agar setiap perubahan konsep dapat ditinjau kembali tanpa kehilangan riwayat.

## Dokumen aktif

| Dokumen | Versi | Status | Keterangan |
|---|---:|---|---|
| `SCADA_MES_Master_Concept_v1.0.md` | 1.0 | Baseline | Konsep induk, ruang lingkup, model operasional, arsitektur konseptual, dan roadmap |
| `machines/Machine_Concept_Jetflow_v1.7.md` | 1.7 | Aktif | Diagnostic motor 3-phase untuk winch, pump, dosing, dan mixer Jetflow |
| `machines/Machine_Concept_Calator_v1.2.md` | 1.2 | Aktif | Diagnostic motor 3-phase untuk equipment line Calator |
| `machines/Machine_Concept_Dryer_v1.1.md` | 1.1 | Aktif | Diagnostic motor 3-phase untuk drive dan fan Dryer |
| `machines/Machine_Concept_Kalender_v1.12.md` | 1.12 | Aktif | Perbaikan alignment historical log Motor & Drive |
| `utilities/Plant_Utility_Concept_v1.1.md` | 1.1 | Aktif | Power meter 138 mesin dengan pie per area, ranking mesin, dan detail meter individual |
| `chemicals/Chemical_Dispensing_Calator_Concept_v1.4.md` | 1.4 | Aktif | P&ID dispensing: 8 inlet, dua tank, loadcell, dan distribusi Calator |
| `dashboard/Dashboard_V1_Concept_v1.21.md` | 1.21 | Aktif | Cross-process Motor & Drive diagnostic workspace |
| `assets/Plant_Machine_Area_Mapping_v1.1.md` | 1.1 | Aktif | Master mapping 138 aset mesin: 133 mesin proses dan 5 dispensing Calator |
| `releases/Frontend_V1.42.md` | 1.42 | Selesai | Cross-process Motor & Drive diagnostic |
| `CHANGELOG.md` | Berkelanjutan | Aktif | Catatan perubahan antarversi |

## Aturan pembaruan

1. Dokumen konsep versi lama tidak ditimpa.
2. Update minor dibuat sebagai file versi baru, misalnya `v1.1`.
3. Update besar dibuat sebagai major version baru, misalnya `v2.0`.
4. Setiap perubahan wajib dicatat dalam `CHANGELOG.md`.
5. Dokumen aktif pada tabel indeks diperbarui ke versi terbaru.

## Status saat ini

Dokumentasi berada pada tahap baseline konseptual. Konsep mesin, utilitas, chemical dispensing, Dashboard V1, serta mapping awal 138 aset mesin telah ditambahkan. Tahap berikutnya adalah menetapkan nomor mesin aktual, hubungan dispensing–Calator, pilot, data source, tag, topology, infrastructure, serta kebutuhan operasional aktual.
