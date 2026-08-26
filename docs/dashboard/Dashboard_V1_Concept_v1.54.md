# Dashboard V1 Concept v1.54

**Tanggal:** 22 Agustus 2026

**Status:** Active alarm operational awareness

## Perubahan Utama

- Badge alarm pada sidebar dan pojok kanan atas memakai jumlah seluruh alarm yang masih aktif, bukan hanya event yang belum di-acknowledge.
- Acknowledge mencatat bahwa operator sudah melihat alarm, tetapi tidak mengurangi jumlah aktif. Jumlah baru turun ketika backend menerima kondisi clear sesuai threshold dan hysteresis.
- Mesin dengan alarm aktif menampilkan note pada Machine Directory, kartu mesin area, dan header detail mesin.
- Note memperlihatkan severity tertinggi, nama kondisi utama, serta jumlah alarm tambahan dan dapat membuka tabel alarm aktif.
- Halaman Alarms & Events menampilkan `Active Alarm Conditions` sebelum distribusi, ranking, dan histori.
- Alarm Configuration dipindahkan ke bagian paling bawah agar monitoring menjadi prioritas pertama.

## Perilaku Popup

- Alarm `CRITICAL` bersifat persisten dan tidak menyediakan tombol close. Popup hilang otomatis hanya setelah event berstatus `CLEARED`.
- Alarm `WARNING` dan `INFO` dapat diminimalkan atau ditutup tanpa mengubah lifecycle event di PostgreSQL.
- Maksimal dua notifikasi non-critical lama dimunculkan kembali ketika dashboard tersambung, sedangkan alarm baru tetap muncul langsung melalui WebSocket.
- Tombol `Open active alarm table` dan ikon alarm kanan atas membuka tabel kondisi aktif.

## Prinsip Operasional

Popup, badge, note mesin, acknowledgement, dan event clear memiliki fungsi berbeda. Popup memberi awareness, badge menunjukkan jumlah kondisi yang masih aktif, note mengikat kondisi ke mesin, acknowledgement mencatat respons operator, sedangkan clear hanya ditentukan oleh alarm engine berdasarkan data proses aktual.
