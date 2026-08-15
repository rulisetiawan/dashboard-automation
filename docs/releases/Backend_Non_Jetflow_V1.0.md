# Backend Non-Jetflow v1.0

**Tanggal:** 15 Agustus 2026  
**Status:** Fondasi integrasi selesai

## Ditambahkan

- D1 persistence dan migration untuk master asset, snapshot, tag registry, telemetry, chemical transaction, dan utility snapshot.
- API backend read-only untuk Calator, Dryer, Kalender, Chemical Dispensing, serta Utilities.
- Dashboard memuat fleet asset, chemical transaction, utility snapshot, dan status backend dari API.
- Endpoint telemetry yang terkunci dengan credential untuk integrasi OT gateway berikutnya.

## Batasan

- Data yang tersimpan saat ini adalah `SIMULATED_SEED` karena mapping PLC, network, dan gateway aktual belum diberikan.
- Jetflow belum dimasukkan ke scope integrasi ini.
