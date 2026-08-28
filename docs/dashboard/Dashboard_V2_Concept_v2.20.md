# Dashboard V2 Concept v2.20

**Versi:** 2.20  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.19.md`  
**Fokus perubahan:** Kerapian ringkasan Plant Overview dan rotasi kredensial

## Plant Overview summary

- Utility Now menjadi satu card lebar di bagian paling atas.
- Water, Electrical Energy, Steam, dan Thermal Oil tampil dalam empat kolom pada desktop.
- Machine Running, Stop/Fault/Offline, Active Batches, Production Output, dan Completed Batches tampil dalam lima card dengan lebar seimbang.
- Layout turun menjadi tiga, dua, dan satu kolom pada viewport yang lebih kecil.
- Nilai KPI tidak membungkus, sedangkan keterangan sumber dapat membungkus dengan aman.

## Credential policy

- Username dan password boleh berupa nilai operasional yang mudah digunakan sesuai kebijakan internal.
- Password plaintext hanya dipakai saat provisioning dan tidak ditulis ke source code atau dokumentasi.
- PostgreSQL dan hosted D1 hanya menyimpan salted one-way password hash.
