ap# Chemical Dispensing Calator Concept v1.9

**Versi:** 1.9  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Registry lengkap valve dan motor dispensing

## Cakupan unit

| Asset | Inlet valve | Transfer valve | Route valve | Motor 3-phase |
|---|---:|---:|---:|---:|
| `DSP-DPN-01` | 8 | 1 | 2 | 3 |
| `DSP-BLK-01` | 8 | 1 | 5 | 3 |
| `DSP-BLK-02` | 8 | 1 | 4 | 3 |
| `DSP-TMR-01` | 8 | 1 | 4 | 3 |
| `DSP-TMR-02` | 8 | 1 | 3 | 3 |

## Valve tag

Setiap valve memiliki dua feedback:

| Parameter | Unit | Fungsi | Stale |
|---|---|---|---:|
| `OPEN_FB` | bool | `1 = OPEN`, `0 = CLOSED` | 30 detik |
| `FAULT_FB` | bool | `1 = FAULT`, `0 = tidak fault` | 30 detik |

Element valve yang dibakukan:

- `INLET_VALVE_01` sampai `INLET_VALVE_08`
- `TRANSFER_VALVE`
- `ROUTE_CL_01` dan seterusnya sesuai jumlah Calator yang didukung unit

Contoh:

```text
SMM.DSP-DPN-01.INLET_VALVE_01.OPEN_FB
SMM.DSP-DPN-01.INLET_VALVE_01.FAULT_FB
SMM.DSP-DPN-01.TRANSFER_VALVE.OPEN_FB
SMM.DSP-DPN-01.ROUTE_CL_01.OPEN_FB
```

## Motor tag

Motor master per dispensing:

| Element code | Equipment code | Nama |
|---|---|---|
| `INLET_PUMP` | `INLET-PUMP` | Inlet Pump |
| `TANK_01_MIXER` | `TANK-MIXER` | Tank 1 Mixer |
| `TRANSFER_PUMP` | `TRANSFER` | Transfer Pump |

Setiap motor memiliki parameter:

| Parameter | Unit | Stale |
|---|---|---:|
| `RUN_FB` | bool | 30 detik |
| `FAULT_FB` | bool | 30 detik |
| `CURRENT_R_PV`, `CURRENT_S_PV`, `CURRENT_T_PV` | A | 30 detik |
| `VOLTAGE_RS_PV`, `VOLTAGE_ST_PV`, `VOLTAGE_TR_PV` | V | 30 detik |
| `ACTIVE_POWER_PV` | kW | 30 detik |
| `FREQUENCY_PV` | Hz | 30 detik |
| `RUNTIME_TOTAL` | h | 120 detik |
| `ENERGY_TOTAL` | kWh | 120 detik |

Contoh:

```text
SMM.DSP-DPN-01.TRANSFER_PUMP.RUN_FB
SMM.DSP-DPN-01.TRANSFER_PUMP.CURRENT_R_PV
SMM.DSP-DPN-01.TRANSFER_PUMP.ACTIVE_POWER_PV
SMM.DSP-DPN-01.TRANSFER_PUMP.RUNTIME_TOTAL
```

## Integrasi SVG

Segment element pada canonical tag harus sama dengan `data-element-code` SVG. `instrument_state` menerjemahkan `OPEN_FB`, `RUN_FB`, dan `FAULT_FB` menjadi state visual. Tag numeric tetap tersedia untuk diagnostic/trend tetapi tidak mengalahkan feedback status.

Tanpa sample aktual, SVG tampil netral sebagai `NO LIVE DATA`. Hijau hanya diberikan untuk feedback `OPEN`, `RUNNING`, atau `ACTIVE` yang masih fresh.

Command seperti `OPEN_CMD` atau `START_CMD` belum didaftarkan karena dashboard saat ini bersifat monitoring. Remote command harus dirancang terpisah dengan PLC interlock, role-based access, confirmation, dan audit trail.

## Hasil registry

- 126 valve feedback tag
- 180 motor status/diagnostic tag
- 15 motor equipment master
- 306 tag valve dan motor untuk lima dispensing unit

Migration: `postgres/migrations/0014_dispensing_calator_tag_registry.sql`.
