# Konsep Mesin Kalender

## Versi 1.2 — Primary PV dan SV Cards

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Kalender_v1.1.md`

## 1. Tujuan Pembaruan

Versi ini menetapkan empat parameter upper dan lower sebagai kartu live utama pada detail mesin Kalender. Jumlah kartu tetap empat agar perbandingan sisi atas dan bawah dapat dibaca langsung tanpa menambah kepadatan halaman.

## 2. Empat Kartu Utama

| Kartu | PV | SV | Unit |
|---|---|---|---|
| Loadcell Upper | Nilai aktual loadcell sisi upper | Setpoint loadcell upper | kN |
| Loadcell Lower | Nilai aktual loadcell sisi lower | Setpoint loadcell lower | kN |
| Temperature Upper | Temperatur aktual upper | Setpoint temperature upper | °C |
| Temperature Lower | Temperatur aktual lower | Setpoint temperature lower | °C |

PV menjadi angka utama pada setiap kartu. SV ditampilkan pada bagian bawah kartu agar operator dapat segera membandingkan nilai aktual dengan target.

## 3. Parameter yang Tetap Dipertahankan

Overfeed, fabric width, loadcell balance, dan temperature balance tidak dihapus dari model data. Parameter tersebut tetap tersedia pada panel proses, trend batch SV/PV, historian, serta analisis abnormal. Perubahan ini hanya menentukan prioritas empat kartu live teratas.

## 4. Batasan V1.2

- PV dan SV frontend masih simulated.
- Nilai engineering unit, range, dan setpoint aktual perlu divalidasi terhadap PLC setiap mesin.
