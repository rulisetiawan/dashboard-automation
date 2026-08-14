# Indeks Dokumentasi Project

Dokumentasi pada folder ini menggunakan versioning agar setiap perubahan konsep dapat ditinjau kembali tanpa kehilangan riwayat.

## Dokumen aktif

| Dokumen | Versi | Status | Keterangan |
|---|---:|---|---|
| `SCADA_MES_Master_Concept_v1.0.md` | 1.0 | Baseline | Konsep induk, ruang lingkup, model operasional, arsitektur konseptual, dan roadmap |
| `machines/Machine_Concept_Jetflow_v1.1.md` | 1.1 | Aktif | Konsep Jetflow dengan detail sensor, dynamic winch 2–8, motor, pump, mixer, utilitas, quality, dan analitik |
| `machines/Machine_Concept_Calator_v1.1.md` | 1.1 | Aktif | Konsep Calator dengan multi-speed, template Bianco, Overfeed Out, dancing roller, chemical, output, dan quality |
| `machines/Machine_Concept_Dryer_v1.0.md` | 1.0 | Baseline | Konsep pengeringan, speed, multi-chamber temperature, output, quality, dan implementasi Dryer |
| `machines/Machine_Concept_Kalender_v1.1.md` | 1.1 | Aktif | Konsep Kalender dengan sensor inlet/upper/lower, dancing roller, fabric width, motor equipment, steam, quality, dan analitik |
| `utilities/Plant_Utility_Concept_v1.0.md` | 1.0 | Baseline | Konsep listrik, water, steam boiler, thermal oil boiler, energy balance, dan machine utility monitoring |
| `chemicals/Chemical_Dispensing_Transfer_Concept_v1.1.md` | 1.1 | Aktif | Konsep tujuh varian chemical dan lima dispensing pada area Depan, Belakang, serta Timur |
| `dashboard/Dashboard_V1_Concept_v1.1.md` | 1.1 | Aktif | Konsep dashboard real-time/historical dengan multi-speed Calator, machine monitoring, alarm, data health, utility, dan chemical |
| `assets/Plant_Machine_Area_Mapping_v1.1.md` | 1.1 | Aktif | Master mapping 138 aset mesin: 133 mesin proses dan 5 dispensing Calator |
| `releases/Frontend_V1.10.md` | 1.10 | Selesai | Chart proses lama diganti Production Abnormality Log dengan waktu, batch, SV, PV, deviation, dan impact |
| `CHANGELOG.md` | Berkelanjutan | Aktif | Catatan perubahan antarversi |

## Aturan pembaruan

1. Dokumen konsep versi lama tidak ditimpa.
2. Update minor dibuat sebagai file versi baru, misalnya `v1.1`.
3. Update besar dibuat sebagai major version baru, misalnya `v2.0`.
4. Setiap perubahan wajib dicatat dalam `CHANGELOG.md`.
5. Dokumen aktif pada tabel indeks diperbarui ke versi terbaru.

## Status saat ini

Dokumentasi berada pada tahap baseline konseptual. Konsep mesin, utilitas, chemical dispensing, Dashboard V1, serta mapping awal 138 aset mesin telah ditambahkan. Tahap berikutnya adalah menetapkan nomor mesin aktual, hubungan dispensing–Calator, pilot, data source, tag, topology, infrastructure, serta kebutuhan operasional aktual.
