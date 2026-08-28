# Dashboard V2 Concept v2.11

**Versi:** 2.11  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.10.md`  
**Fokus perubahan:** Stabilitas posisi scroll saat Chemical Transaction Log auto-update

## Masalah sebelumnya

Saat `chemical_transaction` berubah, cache analytics diinvalidasi dan halaman sempat merender panel loading yang jauh lebih pendek. Posisi scroll lama melebihi tinggi sementara halaman sehingga browser menggesernya ke atas. Render data akhir kemudian mempertahankan posisi yang sudah berubah tersebut.

## Perilaku baru

- Data chemical sebelumnya tetap ditampilkan selama request analytics terbaru berlangsung.
- Jika background refresh gagal, data terakhir tetap dipertahankan sehingga tinggi halaman tidak runtuh.
- Loading page penuh hanya digunakan saat initial load dan belum ada data sama sekali.
- `.chemical-transaction-panel` digunakan sebagai anchor pada render hasil request berikutnya.
- Posisi panel terhadap viewport dipertahankan meskipun summary, chart, atau jumlah transaksi berubah.
- Filter, pagination, dan data aktual tetap diperbarui setelah response baru diterima.

Perubahan ini tidak mematikan auto-update dan tidak menunda penyimpanan data. Perubahan hanya mencegah layout sementara menggeser posisi baca operator.
