# Dashboard V2 Concept v2.13

**Versi:** 2.13  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.12.md`  
**Fokus perubahan:** Utility pada KPI utama dan Production Output by Batch

## Penyederhanaan Plant Overview

- Card `Registered machines` diganti oleh card `Utility Now` pada kelompok KPI paling atas.
- `Utility Now` menampilkan maksimum empat snapshot utility secara ringkas, lengkap dengan unit, quality summary, dan waktu data terbaru.
- Panel Utility Snapshot besar di bawah KPI dihapus agar informasi utility tidak berulang dan halaman tidak menumpuk.
- Machine Operating Status tetap berada pada kelompok analisis utama.
- Panel bar `Production Output by Process` diganti oleh donut `Production Output by Batch`.

## Production Output by Batch

Donut membandingkan kontribusi output berdasarkan `batch_no` pada satu proses dan satu shift. Default proses adalah Kalender karena diposisikan sebagai final process sehingga total plant tidak menghitung material yang sama berulang kali di Jetflow, Calator, Dryer, dan Kalender.

Operator dapat memilih:

- mode `Effective`, `Actual`, atau `Estimated`;
- proses Jetflow, Calator, Dryer, atau Kalender;
- production date;
- Shift A 07.00–15.00, Shift B 15.00–23.00, atau Shift C 23.00–07.00.

Mode `Effective` memakai actual untuk setiap process run bila tersedia. Estimate hanya menjadi fallback pada run yang belum memiliki actual sehingga actual dan estimate tidak dijumlahkan untuk run yang sama. Chart menampilkan lima batch terbesar dan menggabungkan sisanya sebagai `Others`.

## Hierarki informasi

- Total Production Output pada KPI atas mengikuti mode, proses, tanggal, dan shift yang dipilih pada donut.
- Legend memberi label `ACTUAL`, `ESTIMATED`, atau `MIXED` untuk menjaga interpretasi operator.
- Coverage menampilkan jumlah batch terdaftar, actual, estimated fallback, dan no data.
- State filter disimpan pada browser agar pilihan operator tetap tersedia setelah reload.

## Data yang dipertahankan

- Status mesin tetap berasal dari `asset_snapshot.machine_state`.
- Utility tetap berasal dari `utility_snapshot`.
- Batch actual tetap berasal dari `batch_process_run.output_quantity` atau delta output totalizer.
- Estimated output dihitung backend dari speed historian satu menit dengan quality baik dan nilai speed positif.
