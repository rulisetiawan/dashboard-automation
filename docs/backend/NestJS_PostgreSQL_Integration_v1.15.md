# NestJS PostgreSQL Integration v1.15

**Tanggal:** 28 Agustus 2026  
**Status:** Chemical transaction change marker aktif

## Tujuan

Chemical Transaction Log harus diperbarui otomatis untuk setiap perubahan data, termasuk penulisan langsung melalui Navicat, Node-RED, proses import, atau integrasi lain yang tidak melewati endpoint NestJS.

## Change marker

Migration `0017_chemical_transaction_change_marker.sql` menambahkan:

- tabel `dashboard_change_marker` sebagai versi perubahan per sumber;
- statement-level trigger pada `chemical_transaction` untuk operasi `INSERT`, `UPDATE`, dan `DELETE`;
- timestamp marker yang selalu bergerak maju minimal satu mikrodetik.

Statement-level trigger dipilih agar bulk import ribuan row hanya memperbarui marker satu kali per statement, bukan satu kali per row.

Inisialisasi poller WebSocket memiliki retry satu detik agar lifecycle gateway tetap aman ketika startup database masih menyelesaikan migration baru.

## Alur runtime

```text
INSERT / UPDATE / DELETE chemical_transaction
                 ↓ trigger
dashboard_change_marker.chemical_transaction
                 ↓ polling maksimal 2 detik
dashboard:refresh { sources: ["chemical_transaction"] }
                 ↓
REST chemical analytics + transaction page dimuat ulang
```

Marker menggantikan deteksi `MAX(created_at)`. Dengan demikian, insert data backfill yang membawa `created_at` lama dan perubahan pada transaksi yang sudah ada tetap terdeteksi.

## Batas

- WebSocket harus terhubung agar browser menerima push otomatis.
- REST API tetap menjadi sumber data; WebSocket hanya membawa notifikasi perubahan.
- Refresh digabung per interval dan tidak membuat salinan histori baru.
