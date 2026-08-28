# Dashboard V2 Concept v2.10

**Versi:** 2.10  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.9.md`  
**Fokus perubahan:** Peningkatan kontras status aktif tanpa mewarnai seluruh card

## Keseimbangan tema dan visibilitas

Area card tetap memakai surface putih dan struktur industrial-light. Visibilitas ditingkatkan khusus pada kondisi yang benar-benar aktif:

- angka diperbesar dan dibuat semi-bold;
- label status aktif mengikuti warna semantik;
- background aktif memakai tint sepuluh persen;
- border aktif memakai campuran warna empat puluh persen;
- garis kiri tiga piksel dan shadow ringan memperkuat status aktif;
- badge kondisi utama diperbesar dan diberi border tipis;
- aksen atas card kembali memakai warna semantik penuh setinggi empat piksel.

Status bernilai nol tetap netral dengan opacity rendah.

## Palet

- Run: hijau;
- Idle: cyan primer dashboard;
- Warn: amber;
- Fault: merah.

Card Warning dan Fault mendapat border luar yang sedikit lebih kuat agar exception mudah dikenali, tetapi background keseluruhan card tetap putih.

Sumber status, prioritas kondisi, dan refresh real-time tidak berubah.
