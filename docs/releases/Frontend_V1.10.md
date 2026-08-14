# Frontend Dashboard V1.10

**Tanggal:** 14 Agustus 2026  
**Status:** Production abnormality log selesai

## Tujuan update

Mengganti chart proses lama yang bersifat umum dengan tabel kejadian abnormal yang dapat menjawab kapan setpoint tidak tercapai, terjadi pada batch apa, berapa besar deviation, dan apa dampaknya terhadap proses produksi.

## Fitur yang ditambahkan

- Panel **Production Abnormality Log** pada detail Jetflow, Calator, Dryer, dan Kalender.
- Kolom data:
  - start time;
  - end time;
  - batch number;
  - parameter;
  - Set Value (SV);
  - worst Process Value (PV);
  - deviation;
  - duration;
  - process impact;
  - recovery status.
- Ringkasan jumlah event, open abnormality, affected batches, dan total deviation duration.
- Filter periode 1H, 8H, 24H, dan 7D.
- Status Open, Recovered, dan Acknowledged.
- Tombol konseptual untuk export abnormal log.
- Tabel menggunakan horizontal scroll pada layar sempit agar seluruh informasi tetap tersedia.

## Diubah

- Main Process Trend Jetflow diganti dengan abnormality log.
- Historical relationship Calator diganti dengan abnormality log.
- Speed & Temperature Profile Dryer diganti dengan abnormality log.
- Finishing Process Trend Kalender diganti dengan abnormality log.
- Panel sensor SV/PV interaktif tetap tersedia untuk investigasi visual mendalam.

## Batasan

- Data log, batch, SV, worst PV, duration, dan impact masih simulated.
- Trigger event belum menggunakan tolerance dan delay aktual dari recipe atau PLC.
- Export belum menghasilkan file CSV.
- Belum tersedia workflow root-cause, assignment, dan corrective action.
