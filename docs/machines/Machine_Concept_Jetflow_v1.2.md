# Konsep Mesin Jetflow

## Versi 1.2 — Total Water Consumption dan Current Process

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Jetflow_v1.1.md`

## 1. Tujuan Pembaruan

Versi ini mengunci dua perubahan tampilan operasional Jetflow:

1. Water Flow tidak digunakan sebagai KPI management utama Jetflow.
2. KPI utama air menggunakan Total Water Consumption dalam satuan `m³`.
3. Water Level pada kartu ringkasan detail mesin diganti menjadi Current Process.
4. Sensor water level dan instantaneous flow meter tetap dikoleksi sebagai data teknis untuk historian, diagnosis, serta kalkulasi totalizer.

## 2. Definisi Total Water Consumption

Total Water Consumption adalah volume air kumulatif yang telah digunakan, bukan laju aliran sesaat.

### Overview Seluruh Jetflow

- Menjumlahkan konsumsi air seluruh Jetflow.
- Mengikuti selected historical time range.
- Dapat dibagi per Lane A–F.
- Dapat digunakan untuk ranking konsumsi per mesin.
- Satuan utama `m³`.

### Detail Mesin

- Menampilkan total konsumsi air mesin untuk batch aktif atau batch yang sedang dianalisis.
- Nilai berasal dari totalizer flow meter atau integrasi nilai flow terhadap waktu.
- Reset totalizer dan pergantian batch harus dicatat sebagai event historian.

### Formula Konseptual

Jika PLC menyediakan totalizer:

`Batch Water Consumption = Totalizer End − Totalizer Start`

Jika hanya tersedia instantaneous flow:

`Batch Water Consumption = integral Flow Rate terhadap waktu proses`

## 3. Current Process Jetflow

Current Process merupakan tahap sequence yang sedang aktif pada PLC atau recipe execution.

Urutan proses yang digunakan:

1. Filling.
2. Drain.
3. Rinse Cooling.
4. Check PH.
5. Temperature Control.
6. Inject DT 1.
7. Inject DT 2.
8. Dosing DT 1.
9. Dosing DT 2.
10. Load.
11. Unload.
12. ST To MT Filling.

Dashboard menampilkan status setiap tahap sebagai Complete, Current, atau Pending.

## 4. Data Source yang Dibutuhkan

| Informasi | Sumber Utama | Catatan |
|---|---|---|
| Current Process | PLC sequence step / recipe step code | Membutuhkan mapping code ke nama proses |
| Total Water Consumption | Water totalizer | Pilihan utama |
| Instantaneous Water Flow | Flow meter | Tetap disimpan untuk diagnosis |
| Water Level | Level transmitter | Tetap disimpan sebagai sensor teknis |
| Batch start/end | MES atau PLC batch state | Digunakan untuk menetapkan boundary totalizer |

## 5. Aturan Tampilan

- Current Process menjadi kartu live pada detail mesin.
- Total Water Consumption menjadi kartu kumulatif pada detail mesin.
- Overview Jetflow menampilkan total konsumsi air seluruh mesin pada selected range.
- Flow `m³/h` dan level `%` tetap tersedia pada trend batch SV/PV jika relevan, tetapi tidak menjadi KPI management utama.

## 6. Batasan V1.2

- Mapping kode sequence PLC aktual belum tersedia.
- Sumber totalizer dan aturan reset per vendor mesin belum dikonfirmasi.
- Nilai frontend masih simulated.
