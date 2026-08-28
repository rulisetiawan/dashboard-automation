# Dashboard V2 Concept v2.9

**Versi:** 2.9  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.8.md`  
**Fokus perubahan:** Penyelarasan status area card dengan tema industrial-light

## Arah visual

Status tetap mudah dikenali tanpa membuat area card terlihat seperti panel traffic-light. Card kembali memakai surface putih, border standar, dan shadow yang sama dengan komponen dashboard lain.

Warna semantik dipakai secara terbatas pada:

- angka status;
- titik indikator kecil;
- garis vertikal dua piksel pada status yang aktif;
- garis kondisi tiga piksel di sisi atas area card;
- status pill.

Tint status aktif hanya lima persen terhadap `surface-2`. Status bernilai nol kembali netral dan diredupkan agar tidak bersaing dengan kondisi yang benar-benar terjadi.

## Semantik

- Run: hijau;
- Idle: slate yang diselaraskan dengan `ink-2` dan `ink-3`;
- Warn: amber;
- Fault: merah.

Prioritas status utama tetap Fault, Warning, Running, Idle, lalu Offline. Sumber data dan perilaku real-time tidak berubah.
