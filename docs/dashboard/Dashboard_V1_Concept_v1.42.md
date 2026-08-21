# Dashboard V1 Concept v1.42

**Tanggal:** 21 Agustus 2026

**Status:** Stabilitas input custom date historian

## Perubahan

- Nilai `Start date & time` dan `End date & time` langsung disalin ke state dashboard saat input berubah.
- Event `input`, `change`, dan `blur` ditangani agar kompatibel dengan pemilihan tanggal melalui keyboard maupun date picker browser.
- Render ulang akibat telemetry realtime memakai nilai terbaru yang sedang dipilih operator.
- Tombol `Apply range` tetap menjadi satu-satunya pemicu pengambilan ulang data historian.

## Validasi Range

- Input yang belum lengkap tidak menggantikan state tanggal yang valid.
- Start time wajib lebih awal daripada end time ketika range diterapkan.
- Jika validasi gagal, query historian tidak dijalankan.

## Batas Perubahan

- Query PostgreSQL, granularity aggregate, dan cache historian tidak diubah.
- Perubahan berlaku pada custom range di detail mesin dan Historical Trend Explorer.
