# Konsep Utilitas Pabrik

## Versi 1.1 — Machine Power Meter Mapping

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Plant_Utility_Concept_v1.0.md`

## 1. Tujuan Pembaruan

Versi ini menetapkan rancangan power meter individual untuk seluruh 138 mesin pada mapping awal: 88 Jetflow, 18 Calator, 6 Dryer, 21 Kalender, dan 5 Dispensing. Dashboard Utilities harus dapat menelusuri konsumsi listrik dari distribusi utama menuju area dan mesin.

## 2. Hierarki Analisis Listrik

`Cubical → MDP → SDP → Kelompok Mesin → Area/Lane → Power Meter Mesin`

Electrical Distribution yang sudah ada tetap digunakan untuk membandingkan Cubical, MDP, dan SDP. Machine Electrical Consumption menjadi layer berikutnya untuk membandingkan konsumsi per area dan melakukan drill-down ke setiap mesin.

## 3. Tampilan Machine Electrical Consumption

1. Operator memilih kelompok Jetflow, Calator, Dryer, Kalender, atau Dispensing.
2. Pie chart membandingkan total energi setiap area/lane pada selected time range.
3. Klik segmen atau legend area mengubah ranking power meter mesin di area tersebut.
4. Klik mesin menampilkan detail meter individual.
5. Detail mesin dapat dibuka untuk menghubungkan energi dengan batch, proses, sensor, alarm, dan output produksi.

Detail power meter minimum:

| Data | Sifat |
|---|---|
| Energy | Historical accumulation dalam kWh/MWh |
| Actual demand | Live kW |
| Load | Live atau calculated percentage |
| Power factor | Live |
| Voltage | Live |
| Meter/data status | Live data quality |

## 4. Aturan Agregasi

- Energi area adalah penjumlahan kWh seluruh meter mesin yang berada dalam area tersebut.
- Pie dan ranking mengikuti selected time range yang sama.
- Actual demand tidak dijumlahkan lintas waktu dan harus diberi konteks Live Now.
- Mesin tanpa data tidak boleh dianggap memiliki konsumsi nol; status No Data harus dipisahkan.
- Rekonsiliasi perlu membandingkan jumlah meter mesin terhadap SDP yang menyuplai area untuk menemukan loss atau unmetered load.

## 5. Kebutuhan Integrasi

- Satu power meter memiliki unique meter ID dan hubungan tetap ke machine ID.
- Mapping harus menyimpan supply Cubical, MDP, serta SDP masing-masing mesin.
- Timestamp meter harus tersinkronisasi dengan PLC, historian, dan batch MES.
- Tag minimum mencakup energy import, active power, power factor, voltage, current, frequency, communication state, dan quality.
- Meter replacement, reset totalizer, rollover, serta communication loss harus dicatat sebagai event.

## 6. Batasan V1.1

- Seluruh nilai power meter pada frontend masih simulated.
- Coverage 100% merupakan target desain, bukan hasil commissioning aktual.
- Mapping meter ID, address, CT ratio, accuracy class, dan sumber SDP aktual belum tersedia.
