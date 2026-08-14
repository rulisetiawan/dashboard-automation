# Plant Machine and Area Mapping v1.0

**Tanggal:** 14 Agustus 2026  
**Status:** Baseline master mapping  
**Ruang lingkup:** Jetflow, Calator, Kalender, dan Dryer

## 1. Tujuan

Dokumen ini menjadi baseline struktur lokasi dan jumlah mesin untuk Asset Registry, navigasi dashboard, machine selector, alarm routing, historical query, serta pengembangan integrasi PLC berikutnya.

Data ini baru menetapkan jumlah mesin per area. Nomor mesin aktual, vendor, PLC, protocol, status koneksi, subtype, dan tag belum ditetapkan.

## 2. Klarifikasi Struktur Area

Area Jetflow disebut terdiri dari enam lane. Walaupun penjelasan awal menyebut Lane A–E, daftar aktual mencakup Lane A sampai Lane F. Untuk baseline ini struktur dinormalisasi menjadi **enam lane: A, B, C, D, E, dan F**.

Di luar area Jetflow terdapat tiga area produksi:

- Depan.
- Belakang.
- Timur.

## 3. Mapping Area Jetflow

| Area | Jumlah Jetflow | Rentang ID konseptual | Keterangan |
|---|---:|---|---|
| Lane A | 6 | `JF-LA-01` – `JF-LA-06` | Dyeing area |
| Lane B | 18 | `JF-LB-01` – `JF-LB-18` | Dyeing area |
| Lane C | 18 | `JF-LC-01` – `JF-LC-18` | Dyeing area |
| Lane D | 18 | `JF-LD-01` – `JF-LD-18` | Dyeing area |
| Lane E | 13 | `JF-LE-01` – `JF-LE-13` | Dyeing area |
| Lane F | 15 | `JF-LF-01` – `JF-LF-15` | Dyeing area |
| **Total** | **88** |  |  |

Jumlah winch tetap menjadi konfigurasi per mesin dengan rentang 2–8 winch. Mapping lane tidak menentukan jumlah winch.

## 4. Mapping Area Non-Jetflow

| Area | Calator | Kalender | Dryer | Total Area |
|---|---:|---:|---:|---:|
| Depan | 2 | 7 | 1 | 10 |
| Belakang | 9 | 7 | 2 | 18 |
| Timur | 7 | 7 | 3 | 17 |
| **Total** | **18** | **21** | **6** | **45** |

Rentang ID konseptual:

| Jenis Mesin | Depan | Belakang | Timur |
|---|---|---|---|
| Calator | `CL-DPN-01` – `CL-DPN-02` | `CL-BLK-01` – `CL-BLK-09` | `CL-TMR-01` – `CL-TMR-07` |
| Kalender | `KL-DPN-01` – `KL-DPN-07` | `KL-BLK-01` – `KL-BLK-07` | `KL-TMR-01` – `KL-TMR-07` |
| Dryer | `DR-DPN-01` | `DR-BLK-01` – `DR-BLK-02` | `DR-TMR-01` – `DR-TMR-03` |

ID di atas masih berupa usulan sistem dan tidak menggantikan nomor mesin fisik yang sudah digunakan pabrik.

## 5. Rekapitulasi Master Mesin

| Jenis Mesin | Jumlah | Persentase dari Mesin Terdata |
|---|---:|---:|
| Jetflow | 88 | 66,2% |
| Calator | 18 | 13,5% |
| Kalender | 21 | 15,8% |
| Dryer | 6 | 4,5% |
| **Total mesin terdata** | **133** | **100%** |

Angka 133 adalah jumlah mesin produksi yang sudah dipetakan pada versi ini. Target arsitektur hingga sekitar 300 mesin tetap dipertahankan untuk ekspansi mesin lain, utilitas, dispensing, dan equipment tambahan.

## 6. Hierarki Asset yang Digunakan

```text
Plant
├── Jetflow Area
│   ├── Lane A
│   │   └── Jetflow 01–06
│   ├── Lane B
│   │   └── Jetflow 01–18
│   ├── Lane C
│   │   └── Jetflow 01–18
│   ├── Lane D
│   │   └── Jetflow 01–18
│   ├── Lane E
│   │   └── Jetflow 01–13
│   └── Lane F
│       └── Jetflow 01–15
├── Area Depan
│   ├── Calator 01–02
│   ├── Kalender 01–07
│   └── Dryer 01
├── Area Belakang
│   ├── Calator 01–09
│   ├── Kalender 01–07
│   └── Dryer 01–02
└── Area Timur
    ├── Calator 01–07
    ├── Kalender 01–07
    └── Dryer 01–03
```

## 7. Konsep Navigasi Dashboard

Plant Overview harus menyediakan dua cara pencarian mesin:

1. Berdasarkan proses: Jetflow, Calator, Dryer, atau Kalender.
2. Berdasarkan lokasi: Lane A–F, Depan, Belakang, atau Timur.

Filter minimum:

- Area.
- Jenis mesin.
- Machine ID atau nomor fisik.
- Machine state.
- Connection state.
- Batch atau nomor kain aktif.

Tampilan agregat yang disiapkan:

- Total mesin per area dan jenis.
- Running, idle, warning, fault, offline, dan maintenance.
- Mesin sudah terhubung dibanding total mesin terdaftar.
- Alarm aktif per area.
- Active batch per area.
- Data quality dan last communication per area.

## 8. Model Data Awal Asset Registry

Setiap mesin minimal memiliki atribut:

| Field | Contoh | Fungsi |
|---|---|---|
| `asset_id` | `JF-LB-08` | ID sistem yang stabil |
| `physical_machine_no` | Belum ditetapkan | Nomor mesin yang digunakan operator |
| `machine_type` | `JETFLOW` | Jenis proses |
| `area_code` | `JETFLOW` | Area utama |
| `location_code` | `LB` | Lane atau lokasi |
| `sequence_no` | `08` | Urutan mesin di lokasi |
| `display_name` | `Jetflow Lane B 08` | Nama pada dashboard |
| `subtype` | Belum ditetapkan | Model atau konfigurasi mesin |
| `equipment_config` | `winch_count: 5` | Konfigurasi dinamis mesin |
| `integration_status` | `NOT_MAPPED` | Tahap koneksi data |
| `criticality` | Belum ditetapkan | Prioritas maintenance |

## 9. Tahap Integrasi yang Disarankan

Setiap mesin menggunakan status onboarding berikut:

1. `REGISTERED` — mesin dan lokasinya sudah tercatat.
2. `SURVEYED` — PLC, panel, network, dan sensor sudah diperiksa.
3. `TAG_MAPPED` — tag dan alamat data sudah dipetakan.
4. `CONNECTED` — collector menerima data.
5. `VALIDATED` — nilai diverifikasi terhadap HMI atau instrumen.
6. `PRODUCTION` — data resmi digunakan dashboard dan historian.

Dengan struktur ini, jumlah mesin yang terhubung dapat bertambah bertahap tanpa mengubah master hierarchy.

## 10. Informasi yang Diperlukan untuk Versi Berikutnya

- Nomor fisik atau nama aktual setiap mesin.
- Vendor, tipe, model, dan tahun masing-masing mesin.
- Subtype Calator, termasuk mesin Bianco dan lokasi aktualnya.
- Jumlah winch setiap Jetflow.
- Jumlah chamber setiap Dryer.
- PLC, protocol, IP atau gateway, dan kondisi jaringan per area.
- Mesin yang akan dipilih sebagai pilot pada setiap jenis proses.
- Status aktif, nonaktif, standby, atau sudah tidak digunakan.
- Penamaan resmi area pada signage dan dokumen pabrik.

## 11. Keputusan Versi 1.0

- Baseline saat ini berisi 133 mesin produksi.
- Jetflow berjumlah 88 mesin pada Lane A–F.
- Area Depan, Belakang, dan Timur berisi 45 mesin non-Jetflow.
- Struktur data menggunakan konfigurasi dan tidak membuat layout hard-coded per mesin.
- Machine ID konseptual harus direkonsiliasi dengan nomor fisik sebelum menjadi ID produksi resmi.
