# Chemical Dispensing Calator Concept v1.16

**Versi:** 1.16  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.15.md`  
**Fokus perubahan:** Visibilitas posisi aktual selector Auto/Manual

## Control mode aktual

Setiap unit dispensing menampilkan posisi kontrol yang diterima dari PLC/Node-RED:

- `AUTO`: sequence dikendalikan otomatis oleh controller;
- `MANUAL`: controller berada pada mode manual/operator;
- `UNKNOWN`: feedback belum tersedia atau tidak dapat divalidasi.

Mode ditampilkan pada overview unit dan header detail agar operator melihatnya sebelum membaca P&ID atau transaksi.

## Batasan interpretasi

Mode controller tidak diambil dari transaksi terakhir. Unit dapat berada pada Manual sekarang walaupun transaksi terakhir tercatat Automatic, atau sebaliknya. Transaction mode tetap menjadi histori per request; control mode adalah live state unit.

## Quality

Mode hanya dianggap aktual saat heartbeat asset sehat dan quality tag `GOOD`. Jika controller offline, label berubah menjadi `UNKNOWN` agar dashboard tidak menampilkan posisi lama sebagai kondisi saat ini.
