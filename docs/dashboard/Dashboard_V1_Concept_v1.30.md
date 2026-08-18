# Dashboard V1 Concept v1.30

**Tanggal:** 18 Agustus 2026  
**Status:** Struktur visual dashboard dipertahankan

## Perubahan

Struktur visual asli dipulihkan: navigation tab, fleet overview, area drill-down, machine card, panel, dan chart tetap menggunakan layout dashboard yang telah disetujui.

Integrasi PostgreSQL tetap aktif. Data asset, state, batch, progress, koneksi, serta snapshot sensor tetap dibaca dari database. Nilai historical aggregate yang belum memiliki query/mapping aktual ditampilkan sebagai `—` atau `No data`, bukan angka generator.

Pada card Calator, nilai Overfeed Out membaca `asset_snapshot.values_json.overfeed_out_speed_pv` bila tersedia.
