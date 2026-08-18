# Dashboard V1 Concept v1.24

**Versi:** 1.24  
**Tanggal:** 18 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Alarm downtime grouping per area dan mesin

## Tujuan

Halaman Alarm & Events sekarang membantu menentukan lokasi dampak downtime terbesar sebelum operator membuka detail mesin.

## Tampilan baru

1. **Downtime by Area** mengurutkan area/lane berdasarkan unplanned downtime pada selected range.
2. Setiap area menunjukkan total downtime, jumlah machine/asset, dan jumlah alarm event.
3. Klik area memperbarui ranking **Top Downtime Machines** dan daftar active alarm pada scope yang sama.
4. Ranking mesin menunjukkan machine ID, equipment, issue, jumlah event, unplanned downtime, serta waktu event terakhir.
5. Klik baris mesin membuka detail mesin terkait untuk investigasi parameter, motor/drive, batch, atau abnormality log.

## Aturan data

- **Unplanned downtime** adalah durasi stop/fault yang tidak direncanakan; planned idle tidak termasuk.
- Ranking area merupakan agregat dari record equipment/machine pada area tersebut.
- Utilities tetap dapat muncul sebagai asset sumber downtime, tetapi tidak membuka detail mesin proses.
- Nilai masih simulated sampai historian event, state machine, dan reason code aktual terintegrasi.
