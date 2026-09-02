# Solar Fueling & Inventory Reconciliation v1.2

**Status:** Aktif
**Tanggal:** 2 September 2026
**Dashboard:** V2.29
**Baseline:** Melanjutkan `Solar_Fueling_System_Concept_v1.1.md`

## Lifecycle transaksi

| Status sumber | Status dashboard | Perlakuan nilai aktual |
|---|---|---|
| `AKTIF` | `READY` | Request sudah tersedia; flow meter, variance, dan totalizer belum ditampilkan |
| `TERPAKAI` | `COMPLETED` | Flow meter, totalizer, variance, dan konsumsi diakui sebagai final |
| `TIDAK AKTIF` | `CANCELLED` | Tidak dihitung sebagai konsumsi |

Transaksi `PARTIAL` tetap diakui sebagai hasil aktual dengan penanda agar dapat ditinjau.

## Rentang waktu

- `Today` adalah 00:00 WIB sampai waktu sekarang.
- `7 days`, `30 days`, dan `90 days` adalah rolling window.
- `All history` membaca seluruh histori tersedia dengan batas API lima tahun.
- `Custom` menerima waktu awal dan akhir dari user.

Log menggunakan prioritas waktu selesai, pembuatan QR, mulai proses, update sumber, lalu ingestion. Urutan ini menjaga transaksi legacy tanpa `date_created/date_activated` tetap berada pada tanggal proses asal, bukan tanggal migrasi. Pagination tetap dilakukan oleh server.

## Consumption Trend

Trend memakai volume aktual flow meter dari transaksi `COMPLETED/PARTIAL`. Interval per jam digunakan untuk rentang maksimal dua hari dan interval per hari untuk rentang yang lebih panjang. Grafik batang mencantumkan skala sumbu Y serta nilai liter setiap interval.

## Rekonsiliasi

Tiga pembandingan ditampilkan sebagai pasangan nilai berlabel, bukan notasi `vs`:

1. flow meter actual dikurangi request QR;
2. machine totalizer delta dikurangi backend transaction sum;
3. live level sensor dikurangi calculated system stock.

Setiap kartu menampilkan selisih bertanda dalam liter dan persentase terhadap nilai acuan. Jika nilai pembanding atau acuan tidak tersedia, hasil ditampilkan sebagai `N/A`.
