# Plant Machine and Area Mapping v1.2

**Tanggal:** 1 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Plant_Machine_Area_Mapping_v1.1.md`
**Fokus perubahan:** Penambahan Calator 03 di Area Depan

## Perubahan master aset

Asset `CL-DPN-03` didaftarkan sebagai `Calator Depan 03` dengan subtype `Standard`. Asset baru berada pada tahap commissioning `PENDING_MAPPING`; kondisi awal dashboard harus `OFFLINE`, `NOT_CONNECTED`, dan `NO_DATA` sampai heartbeat serta tag proses aktual diterima.

| Area | Calator | Kalender | Dryer | Dispensing Calator | Total Area |
|---|---:|---:|---:|---:|---:|
| Depan | 3 | 7 | 1 | 1 | 12 |
| Belakang | 9 | 7 | 2 | 2 | 20 |
| Timur | 7 | 7 | 3 | 2 | 19 |
| **Total** | **19** | **21** | **6** | **5** | **51** |

Rentang Calator Depan menjadi `CL-DPN-01` sampai `CL-DPN-03`.

## Hubungan dispensing

`DSP-DPN-01` kini dapat menampilkan tiga tujuan Calator pada area yang sama: `CL-DPN-01`, `CL-DPN-02`, dan `CL-DPN-03`. Route ketiga memiliki feedback `OPEN_FB` dan `FAULT_FB` tersendiri. Rasio jumlah asset Area Depan berubah dari 1:2 menjadi 1:3.

## Rekapitulasi plant

| Jenis mesin | Jumlah |
|---|---:|
| Jetflow | 88 |
| Calator | 19 |
| Kalender | 21 |
| Dryer | 6 |
| Dispensing Calator | 5 |
| **Total aset mesin terdata** | **139** |

Total tersebut terdiri dari **134 mesin proses produksi** dan **5 mesin dispensing pendukung Calator**. Penambahan master asset tidak menyatakan mesin sudah terkoneksi; status koneksi tetap ditentukan oleh heartbeat aktual.
