# Solar Fueling & Inventory Reconciliation v1.4

**Status:** Aktif
**Tanggal:** 2 September 2026
**Dashboard:** V2.31
**Baseline:** Melanjutkan `Solar_Fueling_System_Concept_v1.3.md`

## Status QR operasional

Status summary memisahkan QR yang masih menunggu hasil final dari transaksi selesai dan exception. Pending tidak memiliki actual yang diakui sampai status menjadi `COMPLETED/PARTIAL`.

Not Match menggunakan toleransi dua persen:

```text
abs(actual_liters - requested_liters) / requested_liters > 0.02
```

Perhitungan hanya berlaku jika requested lebih dari nol, actual tersedia, dan transaksi sudah final.

## Interaksi trend

Consumption Trend memakai sumbu Y sebagai satu-satunya legend nilai. Setiap bar menyimpan metadata period, actual, requested, dan gap. Saat pointer bergerak di atas bar, tooltip fixed mengikuti cursor tanpa mengubah layout atau posisi scroll halaman.

Keyboard focus menampilkan tooltip pada posisi bar dan `aria-label` membacakan informasi yang sama untuk teknologi bantu.
