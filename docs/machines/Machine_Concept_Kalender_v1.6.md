# Konsep Mesin Kalender

## Versi 1.6 — Motor dan Drive Equipment Analysis

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Kalender_v1.5.md`

## Interaksi Equipment

Setiap Motor & Driven Equipment pada Kalender dapat diklik untuk membuka detail analisa motor/drive tanpa meninggalkan halaman mesin.

## Live Now

- RMS Current (A)
- Voltage (V)
- Active Power (kW)
- Drive Frequency (Hz)

## Historical Selected Range

Time range 1H, 8H, 24H, dan 7D mengubah kartu historical:

- Runtime
- Max RMS Ampere
- Energy
- Unplanned Stop

Trend dapat digeser melalui drag chart, drag navigator, scroll mouse/touchpad, atau tombol keyboard kiri/kanan. Metric trend dapat dipilih antara RMS Amp, Voltage, dan kW.

## Maintenance Target Plan

| Plan | Target |
|---|---|
| Preventive drive inspection | Berdasarkan runtime target PM. |
| RMS Current verification | Sesuai batas current motor. |
| Drive cooling & terminal | Inspeksi mingguan. |
| Bearing lubrication | Berdasarkan interval running hour. |

Panel juga menampilkan target, kondisi saat ini, next action, dan recommendation berbasis kondisi.

## Batasan V1.6

- Nilai electrical, runtime, event stop, dan maintenance masih simulated.
- CMMS work order, meter/drive tag, vibration, thermal, serta alarm actual belum terhubung.
