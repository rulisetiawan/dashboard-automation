# Dashboard V2 Concept v2.7

**Versi:** 2.7  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.6.md`  
**Fokus perubahan:** Auto-update Chemical Transaction Log

## Perilaku auto-update

Saat `chemical_transaction` berubah, backend mengirim `dashboard:refresh` dengan source `chemical_transaction`. Browser kemudian:

1. mengambil ulang transaksi terbaru;
2. memperbarui batas akhir rolling range untuk pilihan 24H, 7D, 30D, atau This Month;
3. menghapus cache chemical analytics;
4. mengambil ulang summary, chart, dan halaman transaction log aktif;
5. merender ulang halaman sambil mempertahankan posisi scroll dan interaksi operator.

Custom range tidak digeser. Data pada custom range tetap dimuat ulang bila isi tabel berubah.

## Indikator

Header `Chemical Transaction Log` menampilkan `LIVE AUTO-UPDATE` saat WebSocket terhubung dan `AUTO-UPDATE PAUSED` saat kanal real-time terputus.

## Latensi

Perubahan langsung pada PostgreSQL dideteksi maksimal sekitar dua detik, ditambah waktu query dan render browser. Beberapa perubahan dalam satu interval digabung menjadi satu refresh agar UI dan database tidak menerima request berulang yang tidak perlu.
