# Chemical Dispensing Calator Concept v1.14

**Versi:** 1.14  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.13.md`  
**Fokus perubahan:** Auto-update Chemical Transaction Log

## Transaction log

Chemical Transaction Log memperbarui data otomatis ketika `chemical_transaction` menerima baris baru atau perubahan. Summary konsumsi, mode, chart, daftar chemical, unit overview, dan halaman transaksi aktif mengambil ulang data berdasarkan filter operator.

Rolling range 24H, 7D, 30D, dan This Month bergerak ke waktu refresh terbaru agar transaksi yang baru terjadi tidak berada di luar batas akhir query. Custom range tetap memakai batas waktu yang dipilih operator.

## Konsistensi data

- PostgreSQL tetap menjadi source of truth.
- WebSocket hanya mengirim notifikasi bahwa sumber berubah; payload transaksi tetap diambil melalui REST API.
- Satu perubahan tabel tidak menambah row telemetry atau historical lain.
- Bulk import menghasilkan satu notifikasi perubahan per SQL statement.
- Refresh UI mempertahankan posisi scroll dan menunggu interaksi aktif selesai.
