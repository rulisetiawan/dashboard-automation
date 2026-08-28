# Dashboard V2 Concept v2.12

**Versi:** 2.12  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.11.md`  
**Fokus perubahan:** Penyelarasan visual Utility Snapshot pada Plant Overview

## Tujuan

Utility Snapshot pada halaman utama harus dapat dipindai secepat status mesin. Nilai aktual menjadi informasi utama, sementara jenis utility, quality, dan waktu update tetap terlihat tanpa membuat card bertumpuk atau keluar dari tema dashboard.

## Tampilan baru

- Panel tetap berada di Plant Overview, berdampingan dengan Machine Operating Status.
- Bagian atas menampilkan jumlah titik utility, jumlah quality `GOOD`, jumlah titik yang memerlukan perhatian, serta waktu data terbaru.
- Setiap utility memiliki identitas ringkas, label, konteks pengukuran, nilai dan unit yang lebih besar, quality badge, serta waktu update masing-masing.
- Electrical, water, steam, dan thermal oil memakai aksen tipis yang berbeda agar mudah dipindai.
- Permukaan utama tetap putih. Warna dibatasi pada simbol, garis aksen, dan status sehingga konsisten dengan dashboard utama.
- Pada layar kecil, summary membungkus dan daftar utility berubah menjadi satu kolom.

## Data dan perilaku yang dipertahankan

- Nilai tetap berasal dari endpoint `GET /api/v1/utilities/snapshot` dan tabel PostgreSQL `utility_snapshot`.
- Quality ditampilkan sesuai nilai sumber; desain tidak mengubah atau membuat status data baru.
- Timestamp tetap menggunakan `source_ts` tiap utility.
- WebSocket `dashboard:refresh` tetap memicu pembaruan utility tanpa perubahan kontrak backend.
