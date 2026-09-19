# Plant Machine and Area Mapping v1.3

**Tanggal:** 19 September 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Plant_Machine_Area_Mapping_v1.2.md`  
**Fokus perubahan:** Registrasi mesin Continuous, Inspecting, Finishing, dan Setting Dongnam

## Penambahan area Finishing

Empat jenis mesin baru didaftarkan sebagai proses terpisah agar navigasi, alarm, historian, output, dan ownership tag dapat dikelola secara independen.

| Proses | Jumlah | Asset ID | Area |
|---|---:|---|---|
| Continuous | 4 | `CT-FIN-01` – `CT-FIN-04` | Finishing |
| Inspecting | 12 | `INSP-FIN-01` – `INSP-FIN-12` | Finishing |
| Finishing | 1 | `FIN-FIN-01` | Finishing |
| Setting Dongnam | 4 | `SD-FIN-01` – `SD-FIN-04` | Finishing |
| **Total asset baru** | **21** |  |  |

Semua asset baru memiliki `commissioning_status = PENDING_MAPPING`. Kondisi awal wajib `OFFLINE`, `NOT_CONNECTED`, dan `NO_DATA`; dashboard tidak membuat nilai sensor simulasi.

## Rekapitulasi plant

| Jenis mesin | Jumlah |
|---|---:|
| Jetflow | 88 |
| Calator | 19 |
| Kalender | 21 |
| Dryer | 6 |
| Continuous | 4 |
| Inspecting | 12 |
| Finishing | 1 |
| Setting Dongnam | 4 |
| Dispensing Calator | 5 |
| **Total aset mesin terdata** | **160** |

Total tersebut terdiri dari **155 mesin proses produksi** dan **5 mesin dispensing pendukung Calator**. Status koneksi setiap asset tetap ditentukan oleh heartbeat aktual dengan stale limit 30 detik.

## Aturan identitas

- `CT` digunakan untuk mesin Continuous.
- `INSP` digunakan untuk mesin Inspecting.
- `FIN` digunakan untuk mesin Finishing.
- `SD` digunakan untuk mesin Setting Dongnam.
- Kode area `FIN` menyatakan lokasi/kelompok area Finishing dan tidak menggantikan `process_type`.

Nomor mesin fisik, alamat PLC, gateway, dan tag sumber aktual harus divalidasi saat commissioning tanpa mengubah `asset_id` yang sudah dipakai historian.
