# Dashboard V1 Concept v1.17

**Versi:** 1.17  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Motor historical log dan CSV export

## Perubahan

Workspace Motor & Drive memiliki tabel log keseluruhan untuk selected time range serta tombol Export CSV. Pilihan `1H`, `8H`, `24H`, dan `7D` mengubah chart, ringkasan, troubleshooting table, dan complete data log secara seragam.

## Prinsip data

CSV ditujukan untuk investigasi offline dan korelasi ke batch/event. Pada implementasi produksi, satu source historian dan waktu timezone yang konsisten wajib digunakan oleh tabel, chart, dan export.
