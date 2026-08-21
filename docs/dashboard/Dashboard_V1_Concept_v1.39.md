# Dashboard V1 Concept v1.39

**Tanggal:** 21 Agustus 2026

**Status:** Konsistensi pilihan parameter historian

## Perubahan

- Pilihan parameter trend PV/SV disimpan secara terpisah untuk setiap asset mesin.
- Refresh data realtime, perubahan time range, dan render ulang halaman mempertahankan parameter yang sedang dipilih.
- Reload browser memulihkan pilihan terakhir melalui penyimpanan lokal browser.
- Parameter awal tidak lagi ditentukan oleh tag telemetry terbaru karena urutan kedatangan telemetry dapat berubah.
- Fallback menggunakan parameter PV/SV pertama dalam urutan yang stabil dan hanya berjalan jika belum ada pilihan valid atau tag pilihan telah dihapus dari master tag.

## Batas Perubahan

- Data telemetry dan historian PostgreSQL tidak diubah.
- Pemilihan parameter tetap bersifat lokal pada browser/operator dan tidak mengubah konfigurasi tag mesin.
- Trend tetap menampilkan satu parameter terpilih dengan pasangan PV dan SV yang tersedia.
