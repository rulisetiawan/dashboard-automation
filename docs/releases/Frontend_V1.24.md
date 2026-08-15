# Frontend Dashboard V1.24

**Tanggal:** 15 Agustus 2026  
**Status:** Selesai  
**Fokus:** Management Question Center pada Plant Overview

## Perubahan

- Ditambahkan tujuh kartu jawaban management pada bagian teratas Plant Overview.
- Mesin running ditampilkan sebagai jumlah serta tabel mesin lengkap.
- Mesin stopped, maintenance, problem, dan fault ditampilkan sebagai breakdown dan tabel tersendiri.
- Output produksi dan completed batch mengikuti selected time range.
- Utility Now menampilkan Electrical, Water, Steam, dan Thermal Oil secara live.
- Total Utility Consumption menampilkan empat total dengan satuannya masing-masing.
- Active batch dihitung dari batch number unik pada mesin operating.
- Pemilih time range ditempatkan langsung pada Management Question Center.
- Baris tabel status mesin dapat dibuka menuju detail mesin.

## Batasan

- Data dan klasifikasi status masih simulated.
- Maintenance aktual membutuhkan integrasi CMMS atau state maintenance dari PLC/MES.
