# Dashboard V2 Concept v2.14

**Versi:** 2.14  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.13.md`  
**Fokus perubahan:** Utility priority card dan sinkronisasi output antarproses

## Utility Now

- Utility tetap berada pada kelompok KPI paling atas dan menggunakan lebar dua card standar.
- Empat nilai utility disusun 2×2 agar angka dan unit dapat diperbesar.
- Background cyan sangat ringan, border primer, bayangan lembut, dan aksen warna utility membedakan card dari KPI mesin tanpa keluar dari surface dashboard.
- Quality summary dan latest received tetap terlihat pada header dan footer.

## Production Output by Process

Bar chart antarproses ditampilkan kembali di bawah Machine Operating Status dan Production Output by Batch.

Chart mengikuti filter yang sama dengan donut batch:

- production date;
- Shift A/B/C;
- mode Effective, Actual, atau Estimated.

Process selector pada donut tetap menentukan batch yang sedang dianalisis. Bar chart selalu menampilkan Jetflow, Calator, Dryer, dan Kalender secara berdampingan agar operator dapat melihat perbedaan output antarstage.

## Analisis gap

Panel menampilkan:

- proses dengan output tertinggi;
- proses terendah yang memiliki data;
- gap absolut dalam meter;
- gap persentase terhadap proses tertinggi.

Gap digunakan sebagai indikator awal bottleneck atau ketidakseimbangan antarproses. Nilai proses tidak dijumlahkan menjadi total plant karena batch yang sama dapat melewati lebih dari satu proses. Total plant tetap mengacu pada final process yang dipilih, dengan Kalender sebagai default.
