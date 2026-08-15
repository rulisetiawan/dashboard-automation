# Frontend Dashboard V1.18

**Tanggal:** 15 Agustus 2026  
**Status:** Selesai  
**Fokus:** Jetflow water consumption dan current process

## Perubahan

- Water Flow Now pada overview Jetflow diganti menjadi Active Process Stages.
- Water Consumption historical diberi nama Total Water Consumption.
- Donut dan ranking Jetflow menggunakan Total Water Consumption per Lane dan mesin.
- Flow Meter pada KPI detail mesin diganti menjadi Total Water Consumption current batch.
- Water Level pada KPI detail mesin diganti menjadi Current Process.
- Machine card Jetflow menampilkan current process dan jumlah winch.
- Ditambahkan visual sequence 12 tahap dengan status Complete, Current, dan Pending.
- Master process Jetflow diperluas menjadi Filling, Drain, Rinse Cooling, Check PH, Temperature Control, Inject DT 1–2, Dosing DT 1–2, Load, Unload, serta ST To MT Filling.

## Batasan

- Nilai total water dan current process masih simulated.
- Flow meter serta water level tetap dipertahankan sebagai sensor teknis pada historian batch.
