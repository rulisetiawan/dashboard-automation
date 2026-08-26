# Dashboard V2 Concept v2.2

**Versi:** 2.2  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Source-aware realtime refresh dan interaction-safe rendering

## Masalah yang diselesaikan

Update `asset_snapshot` yang cepat sebelumnya memicu pengambilan ulang seluruh endpoint dan mengganti seluruh `page-content`. Pergantian DOM di antara `pointerdown` dan `click` dapat membatalkan interaksi, menutup dropdown, serta membuat halaman terasa tidak responsif.

## Arsitektur refresh baru

- WebSocket mengirim hanya nama sumber database yang benar-benar berubah.
- Frontend menggabungkan event yang berdekatan dan mencegah request refresh berjalan tumpang tindih.
- Hanya endpoint yang berkaitan dengan sumber tersebut yang dimuat ulang.
- Model data tetap diperbarui, tetapi render halaman hanya dilakukan bila sumber tersebut relevan untuk halaman aktif.
- Render struktural ditunda ketika pointer, input, select, textarea, sidebar, atau modal motor sedang aktif.
- `instrument:delta` tetap memperbarui P&ID langsung tanpa full render.

## Pengamanan interaksi

- Backdrop sidebar hanya menerima pointer ketika sidebar benar-benar terbuka.
- Tombol `Escape` menutup sidebar dan modal motor.
- Posisi scroll dipertahankan untuk refresh realtime yang aman.
- Full render tetap tersedia untuk navigasi, perubahan filter, dan perubahan struktur data.

## Hasil yang diharapkan

Dashboard tetap menerima data aktual tanpa request berlebihan, dropdown tidak tertutup oleh refresh, klik tidak hilang akibat penggantian DOM, dan beban browser lebih stabil saat `asset_snapshot` diperbarui terus-menerus.
