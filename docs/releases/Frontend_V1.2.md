# Frontend Dashboard V1.2

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Hierarchical process navigation dan area/lane drill-down

## Ringkasan

Frontend V1.2 mengubah tab proses dari direct-to-machine menjadi navigasi bertingkat yang mengikuti hierarchy plant.

## Pola Navigasi

```text
Process Fleet Overview
└── Area atau Lane Overview
    └── Machine List
        └── Machine Detail
```

Contoh Kalender:

```text
Kalender Overview — 21 mesin
├── Depan — 7 mesin
├── Belakang — 7 mesin
└── Timur — 7 mesin
```

Setelah area dipilih, dashboard menampilkan daftar mesin di area tersebut. Detail sensor, motor, alarm, dan historical baru dibuka setelah satu mesin dipilih.

## Cakupan

- Jetflow: Lane A–F, total 88 mesin.
- Calator: Depan, Belakang, dan Timur, total 18 mesin.
- Dryer: Depan, Belakang, dan Timur, total 6 mesin.
- Kalender: Depan, Belakang, dan Timur, total 21 mesin.
- Dispensing Calator: Depan, Belakang, dan Timur, total 5 mesin.

## Fitur Ditambahkan

- Fleet overview pada setiap tab proses.
- Area atau lane card dengan total serta simulated machine state.
- Area machine list dengan search dan state filter.
- Machine card dengan ID, batch, progress, snapshot parameter, dan connection indicator.
- Breadcrumb process → area/lane → machine.
- Back navigation ke area dan fleet overview.
- Machine selector pada detail dibatasi ke area aktif.
- Responsive layout untuk desktop, tablet, dan mobile.
- Sidebar dan Plant Overview menggunakan jumlah asset mapping terbaru.

## Asset ID Konseptual

- Jetflow: `JF-LA-01` dan seterusnya.
- Calator: `CL-DPN-01`, `CL-BLK-01`, dan `CL-TMR-01`.
- Dryer: `DR-DPN-01`, `DR-BLK-01`, dan `DR-TMR-01`.
- Kalender: `KL-DPN-01`, `KL-BLK-01`, dan `KL-TMR-01`.
- Dispensing: `DSP-DPN-01`, `DSP-BLK-01`, dan `DSP-TMR-01`.

## Batasan

- Status, batch, subtype, jumlah winch, dan jumlah chamber masih simulated.
- ID konseptual belum direkonsiliasi dengan nomor fisik mesin.
- Search dan filter masih berjalan pada data frontend.
- Area historical dan alarm belum menggunakan backend query context.

## Kebutuhan Berikutnya

- Daftar nomor fisik seluruh mesin.
- Subtype dan konfigurasi aktual per mesin.
- Machine-to-PLC dan gateway mapping.
- Status koneksi aktual.
- Context propagation ke historian, alarm, maintenance, dan batch API.
