# Dashboard V1 Concept v1.57

**Tanggal:** 22 Agustus 2026

**Status:** Compact active-alarm carousel

## Diubah

- Alarm notification menjadi satu compact container setinggi kontrol LIVE dan ditempatkan tepat di sebelahnya.
- Container hanya menampilkan severity, asset ID, serta judul utama alarm tanpa detail dan recommendation yang panjang.
- Semua alarm aktif menggunakan container yang sama; dashboard tidak lagi membuat beberapa card alarm.
- Alarm diurutkan berdasarkan priority `CRITICAL`, `WARNING`, kemudian `INFO`, dengan alarm terbaru lebih dahulu pada severity yang sama.

## Navigasi

- Indikator `current/total` menunjukkan posisi alarm yang sedang dilihat.
- Tombol previous dan next memutar daftar alarm aktif secara circular.
- Pada perangkat sentuh, pengguna dapat swipe kiri atau kanan untuk berpindah alarm.
- Klik judul alarm langsung membuka detail mesin berdasarkan `asset_id` dan `process` pada master asset.
- Jika asset belum dimapping, dashboard memberi notifikasi dan membuka tabel alarm aktif sebagai fallback.

## Lifecycle

Carousel hanya membaca event yang belum `CLEARED`. Alarm critical tetap berada dalam daftar sampai kondisi proses normal, sementara badge header tetap menunjukkan total seluruh alarm aktif.
