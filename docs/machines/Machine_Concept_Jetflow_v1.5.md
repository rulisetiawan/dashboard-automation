# Konsep Mesin Jetflow

## Versi 1.5 — Batch Trend dengan Recipe Program Overlay

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Jetflow_v1.4.md`

## 1. Tujuan Pembaruan

Saat nomor batch dipilih, trend sensor Jetflow harus menunjukkan konteks recipe program, bukan hanya garis PV dan SV. Operator dapat melihat step proses yang sedang direpresentasikan pada rentang waktu tersebut, kapan setpoint berubah, nilai target baru, dan apakah PV mengikuti perubahan tersebut.

## 2. Elemen pada Trend Batch

| Elemen | Makna |
|---|---|
| PV solid | Nilai proses aktual dari sensor. |
| SV dashed | Target/setpoint recipe yang aktif pada waktu tersebut. |
| Area berwarna | Durasi step recipe yang relevan untuk sensor yang dipilih. |
| Garis vertikal putus-putus | Titik perubahan SV dari recipe program. |
| Label nilai pada garis | Nilai SV baru setelah perubahan. |
| Ringkasan di atas trend | Nama process step, waktu mulai–akhir, waktu perubahan SV, dan targetnya. |

## 3. Mapping Awal Sensor dan Program

| Sensor | Step program yang ditampilkan |
|---|---|
| Main Tank Temperature | Temperature Control dan Rinse Cooling. |
| Water Level | Filling, Drain, dan ST To MT Filling. |
| Main Flow Meter | Filling, Drain, dan ST To MT Filling. |
| Dosing Tank 1 Temperature | Inject DT 1 dan Dosing DT 1. |
| Dosing Tank 2 Temperature | Inject DT 2 dan Dosing DT 2. |
| Dosing Tank Level | Inject/Dosing DT 1 serta Inject/Dosing DT 2. |

## 4. Contoh Interpretasi

Untuk `TEMP_MAIN`, area Temperature Control memperlihatkan ramp SV bertahap, misalnya 60°C, 80°C, lalu 93°C. Setiap perubahan mempunyai garis penanda pada waktu event. Area Rinse Cooling kemudian menunjukkan penurunan SV ke target pendinginan. PV dibaca terhadap garis SV untuk menilai lag, overshoot, atau kegagalan mencapai target.

## 5. Data yang Dibutuhkan Saat Integrasi

- `batch_id`, `machine_id`, `recipe_id`, recipe version, dan step code.
- Timestamp aktual start/end setiap step serta status step.
- Event perubahan setpoint: timestamp, tag, nilai lama, nilai baru, sumber perubahan, dan operator/automatic mode.
- Historian PV dengan quality code serta timestamp sumber.
- Tolerance, hold-time, dan rule achievement per recipe step.

## 6. Aturan Operasional

- Overlay hanya muncul setelah batch dimuat pada Batch Historian Lookup.
- Overlay mengikuti sensor yang dicentang dan range 1H, 8H, atau 24H.
- Process band hanya menampilkan step yang berhubungan dengan sensor tersebut agar trend tetap terbaca.
- Perubahan manual dan automatic recipe harus dibedakan pada data produksi nanti.
- Event setpoint yang tidak memiliki quality atau timestamp valid tidak boleh dianggap sebagai dasar analisis penyebab.

## 7. Batasan V1.5

- Sequence, durasi, SV, dan respons PV masih simulasi frontend.
- Timestamp belum berasal dari PLC, recipe controller, maupun historian.
- Rule achievement, hold-time verification, dan perubahan manual belum terhubung ke data aktual.
