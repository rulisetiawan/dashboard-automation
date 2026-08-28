# Dashboard V2 Concept v2.15

**Versi:** 2.15  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.14.md`  
**Fokus perubahan:** Hierarki visual dan pemetaan empat utility utama

## Utility Now

Utility Now di overview hanya menampilkan empat kategori operasional berikut dalam urutan tetap:

1. Water;
2. Electrical Energy;
3. Steam;
4. Thermal Oil.

Data utility lain tidak dihapus dan tetap dapat tersedia pada backend, tetapi tidak ditampilkan pada KPI overview agar perhatian operator tetap terarah.

## Presentasi card

- Container Utility Now memakai lebar tiga KPI standar pada desktop dan tetap responsif pada tablet serta mobile.
- Setiap kategori memakai icon, nama kategori tetap, dan label snapshot aktual sebagai keterangan kedua.
- Nilai memakai font data, bobot, tracking, dan skala yang sama dengan KPI Machine Running.
- Empat slot selalu dirender dalam layout 2×2. Slot tanpa mapping menampilkan `No mapped snapshot` dan nilai `—`.
- Warna aksen membedakan Water, Electrical Energy, Steam, dan Thermal Oil tanpa keluar dari surface dashboard utama.

## Data dan validasi

- Nilai, unit, quality, dan waktu penerimaan tetap dibaca dari `utility_snapshot`.
- Pemetaan kategori menggunakan `utility_code`, `label`, dan `unit`.
- Quality summary hanya menghitung empat utility utama dan memakai denominator tetap empat.
- `Latest received` memakai timestamp terbaru dari utility utama yang berhasil dipetakan.
