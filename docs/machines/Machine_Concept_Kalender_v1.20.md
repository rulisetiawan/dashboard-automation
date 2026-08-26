# Machine Concept Kalender v1.20

**Versi:** 1.20  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Fabric wrap pada cylinder dan loadcell roller

## Alur yang dikoreksi

```text
Expander
  → kain melingkari Upper Felt cylinder
  → LC Upper small roller
  → kain melingkari Lower Felt cylinder
  → LC Lower small roller
  → Exit Guide
  → Cooling Belt
```

- Garis segitiga tetap menjadi felt loop yang membungkus masing-masing cylinder.
- Garis merah menjadi kain aktual yang mengikuti kelengkungan cylinder upper dan lower.
- Loadcell upper/lower ditampilkan sebagai roller pengukuran kecil setelah keluaran felt terkait.
- Transfer guide G1–G3 dihapus karena bukan representasi alur aktual yang dimaksud.
- `LOADCELL_UPPER` dan `LOADCELL_LOWER` tetap menjadi element code live pada SVG.
