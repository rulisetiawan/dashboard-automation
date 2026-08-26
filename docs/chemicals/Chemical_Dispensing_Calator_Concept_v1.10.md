# Chemical Dispensing Calator Concept v1.10

**Versi:** 1.10  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Valve-only registry seluruh area

## Keputusan scope

Dispensing Calator hanya memakai canonical tag valve untuk live P&ID. Motor tag, motor equipment master, dan motor diagnostic tidak menjadi bagian fitur ini. Simbol pump tetap dapat dipakai sebagai informasi alur proses, tetapi tidak memiliki live motor binding.

## Registry per unit

| Asset | Area | Valve element | Feedback per element | Total tag |
|---|---|---:|---:|---:|
| `DSP-DPN-01` | Depan | 8 inlet + 1 transfer + 2 route | 2 | 22 |
| `DSP-BLK-01` | Belakang 01 | 8 inlet + 1 transfer + 5 route | 2 | 28 |
| `DSP-BLK-02` | Belakang 02 | 8 inlet + 1 transfer + 4 route | 2 | 26 |
| `DSP-TMR-01` | Timur 01 | 8 inlet + 1 transfer + 4 route | 2 | 26 |
| `DSP-TMR-02` | Timur 02 | 8 inlet + 1 transfer + 3 route | 2 | 24 |

Total: **63 valve element** dan **126 valve feedback tag**.

## Tag pattern

Setiap element memiliki:

```text
SMM.{ASSET_ID}.{ELEMENT_CODE}.OPEN_FB
SMM.{ASSET_ID}.{ELEMENT_CODE}.FAULT_FB
```

Element code:

- `INLET_VALVE_01` sampai `INLET_VALVE_08`
- `TRANSFER_VALVE`
- `ROUTE_CL_01` sampai jumlah route unit terkait

Contoh area Belakang dan Timur:

```text
SMM.DSP-BLK-01.INLET_VALVE_08.OPEN_FB
SMM.DSP-BLK-01.ROUTE_CL_05.FAULT_FB
SMM.DSP-BLK-02.ROUTE_CL_04.OPEN_FB
SMM.DSP-TMR-01.TRANSFER_VALVE.OPEN_FB
SMM.DSP-TMR-01.ROUTE_CL_04.OPEN_FB
SMM.DSP-TMR-02.ROUTE_CL_03.FAULT_FB
```

`OPEN_FB = 1` menghasilkan OPEN, `OPEN_FB = 0` menghasilkan CLOSED, dan `FAULT_FB = 1` memiliki prioritas FAULT. Nilai harus fresh dan quality `GOOD`; tanpa telemetry SVG tetap netral.

## Data yang dihapus

- 180 canonical motor tag tanpa telemetry aktual.
- 15 dispensing motor equipment master.
- 75 equipment telemetry row berlabel test pada `DSP-DPN-01`, terhapus melalui cascade equipment.

Dataset test tersebut dapat dibuat ulang dari script seed lama, tetapi tidak disarankan selama keputusan valve-only masih aktif.
