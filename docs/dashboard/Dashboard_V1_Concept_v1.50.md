# Dashboard V1 Concept v1.50

**Tanggal:** 21 Agustus 2026

**Status:** Persistent navigation

## Perubahan

- Dashboard menyimpan menu terakhir yang dibuka pada browser.
- Untuk halaman proses, dashboard juga menyimpan area dan detail mesin terakhir.
- Batch tracking yang sedang dipilih dan scope machine summary ikut dipulihkan.
- Refresh browser tidak lagi selalu mengembalikan pengguna ke Plant Overview.

## Aturan Pemulihan

1. Navigasi disimpan pada browser perangkat, bukan di PostgreSQL.
2. Setelah refresh, dashboard memulihkan page, area, machine, dan batch selection terakhir.
3. Jika asset atau area tersimpan sudah tidak tersedia pada master aktual, dashboard kembali ke level proses yang masih valid.
4. Kerusakan atau penolakan browser storage tidak menghambat dashboard; aplikasi memakai navigasi default sebagai fallback.
