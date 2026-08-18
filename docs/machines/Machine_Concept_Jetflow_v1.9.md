# Machine Concept Jetflow v1.9

**Versi:** 1.9  
**Tanggal:** 18 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** SV/PV per langkah Jetflow Process Sequence

## Perubahan dari v1.8

Tabel Jetflow Process Sequence sekarang memiliki kolom **SV** dan **PV** untuk setiap langkah proses.

| Kondisi langkah | SV | PV |
|---|---|---|
| Complete | Target recipe saat step dijalankan | Nilai actual yang tercatat |
| Current | Target recipe aktif | Actual live untuk parameter step |
| Pending | Target recipe rencana | `—` sampai step dimulai |

Setiap nilai menampilkan parameter yang relevan, misalnya main tank level, temperature, pH, dosing weight/flow, fabric load, atau dosing tank level. Ini mencegah perbandingan SV/PV dibaca tanpa konteks satuan.

## Batasan

Nilai masih simulated. Saat integrasi aktual, SV berasal dari recipe/program controller dan PV berasal dari historian tag pada interval process step yang sama.
