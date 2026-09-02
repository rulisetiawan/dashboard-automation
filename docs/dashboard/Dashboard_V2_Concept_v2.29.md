# Dashboard V2 Concept v2.29

**Versi:** 2.29
**Tanggal:** 2 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.28.md`

## Fokus perubahan

Solar Fueling menampilkan data sesuai lifecycle transaksi dan hari operasional Asia/Jakarta. QR yang baru dibuat tidak diperlakukan sebagai pengisian selesai sampai sumber mengubah statusnya menjadi final.

## Perubahan utama

- `Today` dimulai pada pukul 00:00 WIB dan berakhir pada waktu aktual.
- Transaksi legacy tanpa tanggal pembuatan/selesai memakai waktu mulai atau update sumber, bukan tanggal migrasi.
- `All history` membuka histori tersedia hingga lima tahun melalui API ber-pagination.
- Nilai flow meter, variance, dan totalizer pada log hanya ditampilkan untuk `COMPLETED` atau `PARTIAL`.
- Consumption Trend menggunakan batang dengan sumbu Y dan label nilai liter.
- Tank Level Trend dihapus agar fokus analisis berada pada konsumsi; Live Tank Level tetap menjadi KPI.
- Kartu requested/actual, backend/totalizer, serta system stock/sensor memisahkan kedua nilai dan menampilkan selisih liter serta persen.

## Aturan interpretasi

Nilai `actual_solar=0` pada QR berstatus `AKTIF/READY` adalah placeholder sebelum pengisian selesai. Nilai tersebut tidak boleh tampil sebagai actual, tidak boleh membentuk variance, dan tidak boleh masuk exception volume.
