# Chemical Dispensing Calator Concept v1.15

**Versi:** 1.15  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.14.md`  
**Fokus perubahan:** Interaction-safe transaction auto-update

## Aturan tampilan

Ketika transaksi baru diterima, operator tetap berada pada posisi baca yang sama. Dashboard mempertahankan data lama selama request terbaru berlangsung dan kemudian mengganti summary, chart, serta transaction log dalam satu render dengan anchor panel yang sama.

Initial load tanpa cache tetap menampilkan loading state. Auto-update setelah data pertama tersedia tidak mengganti seluruh halaman dengan loading state.

## Konsistensi

- PostgreSQL tetap menjadi source of truth.
- WebSocket tetap menjadi notifikasi perubahan.
- REST API tetap membawa payload transaction dan analytics.
- Filter aktif, pagination, posisi scroll, serta interaksi operator dipertahankan.
