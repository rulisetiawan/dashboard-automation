# Chemical Dispensing Calator Concept v1.5

**Versi:** 1.5  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Custom time range untuk Dispensing Request Log

## Custom range

Log Chemical Dispensing Calator menyediakan pilihan `Custom range` selain `Last 8 hours`, `Last 24 hours`, dan `Last 7 days`.

1. Pilih **Custom range** pada Time range.
2. Tentukan **Start date & time** dan **End date & time**.
3. Tekan **Apply range**.

Tabel transaksi, jumlah record, dan label rentang akan mengikuti interval tersebut. Jika end time lebih kecil dari start time, dashboard akan menukar kedua nilai agar range tetap valid.

## Kombinasi filter

Custom range dapat dikombinasikan dengan filter chemical variant, Calator destination, dispensing type, dan status.

## Batasan

Data waktu masih dibuat dari sample demonstrasi. Pada implementasi aktual, timestamp harus berasal dari historian/PLC yang sudah disinkronkan.
