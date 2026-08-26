# Dashboard V1 Concept v1.53

**Tanggal:** 21 Agustus 2026

**Status:** Alarm configuration form stability

## Diperbaiki

- Nilai yang sedang diketik pada form alarm rule disimpan sebagai draft di state frontend.
- Refresh data realtime tidak lagi mengosongkan input rule name, threshold, hysteresis, delay, message, atau recommendation.
- Pilihan asset, tag, rule type, severity, dan enabled tetap konsisten selama tag registry maupun alarm event diperbarui.
- Pergantian asset hanya mereset pilihan tag, tanpa menghapus variabel konfigurasi lain yang sudah diisi.
- Mode edit memuat seluruh nilai rule ke draft dan tombol Cancel membersihkan draft tersebut.

## Format Angka

Threshold dan hysteresis menerima tanda desimal titik maupun koma. Nilai seperti `170,5` dinormalisasi menjadi `170.5` sebelum dikirim sebagai JSON number ke NestJS.

## Alur Data

Input operator → draft form frontend → validasi angka → API alarm rule → PostgreSQL. Draft dibersihkan hanya setelah backend mengonfirmasi bahwa rule berhasil disimpan.
