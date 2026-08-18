# Machine Concept Jetflow v1.8

**Versi:** 1.8  
**Tanggal:** 18 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Batch context pada kartu mesin Lane

## Perubahan dari v1.7

Kartu mesin Jetflow pada tampilan Lane/area kini menampilkan nomor batch aktif di samping current process dan jumlah winch.

Informasi kartu secara ringkas mencakup:

- Machine ID dan lokasi Lane.
- State live dan konektivitas.
- Current process Jetflow serta jumlah winch.
- **Batch number aktif**.
- Water consumption, runtime, dan state.

Nomor batch memakai master process run/historian saat integrasi MES tersedia. Nilai saat ini masih simulated.
