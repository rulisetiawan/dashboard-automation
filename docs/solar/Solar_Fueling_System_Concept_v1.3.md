# Solar Fueling & Inventory Reconciliation v1.3

**Status:** Aktif
**Tanggal:** 2 September 2026
**Dashboard:** V2.30
**Baseline:** Melanjutkan `Solar_Fueling_System_Concept_v1.2.md`

## Definisi totalizer range

Totalizer tidak dijumlahkan per transaksi. Sistem membaca dua boundary sample dari transaksi `COMPLETED/PARTIAL` di dalam range:

1. `first_totalizer_liters`: totalizer pada transaksi paling awal;
2. `latest_totalizer_liters`: totalizer pada transaksi paling akhir;
3. `machine_delta_liters = latest_totalizer_liters − first_totalizer_liters`.

Urutan memakai `fueling_completed_at` dan `transaction_id` sebagai tie-breaker. Nilai minimum atau maksimum totalizer tidak digunakan karena yang dibutuhkan adalah kondisi pada batas waktu.

Jika hanya tersedia nol atau satu sampel, totalizer delta ditampilkan `N/A`. Jika terjadi reset di antara dua boundary, jumlah reset tetap ditampilkan sebagai peringatan karena delta langsung dapat menjadi negatif atau tidak merepresentasikan konsumsi normal.

## Rekonsiliasi

| Nilai | Perhitungan |
|---|---|
| Backend flow-meter sum | Jumlah `metered_liters` seluruh transaksi final dalam range |
| Totalizer delta | Totalizer akhir dikurangi totalizer awal |
| Selisih liter | Totalizer delta dikurangi backend flow-meter sum |
| Selisih persen | Selisih liter dibagi backend flow-meter sum |

Kartu menampilkan kedua nilai utama, selisih liter, selisih persen, dan formula boundary totalizer.
