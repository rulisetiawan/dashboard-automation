# Dashboard V2 Concept v2.27

**Versi:** 2.27
**Tanggal:** 2 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.26.md`

## Fokus perubahan

Menu Resources mendapat modul **Solar Fueling** untuk tracking QR dan user, konsumsi berbasis flow meter, rekonsiliasi totalizer mesin, kontrol stock movement, dan stock opname dengan approval workflow.

Tampilan mengikuti komponen visual dashboard V2: hierarchy informasi ringkas, warna biru operasional, tabel actual data, empty state tanpa dummy, dan live update yang mempertahankan posisi scroll pengguna.

## Keputusan

- Actual flow meter menjadi sumber volume dispensing.
- Totalizer mesin berfungsi sebagai pembanding independen terhadap agregasi backend.
- Fueling OUT tidak dicatat ulang sebagai stock movement.
- Accuracy stok hanya muncul sesudah stock opname fisik.
- Field proses sumber yang ambigu diganti dengan istilah bisnis canonical.
