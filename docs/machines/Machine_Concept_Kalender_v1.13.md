# Machine Concept Kalender v1.13

**Versi:** 1.13  
**Tanggal:** 24 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** P&ID process schematic Kalender dan standardisasi element code SVG

## Konsep visual

Detail mesin Kalender memiliki process schematic yang mengikuti arah kain dari kiri ke kanan. Diagram dibagi menjadi empat zona:

1. **Infeed & Expander** — inlet roller, fabric width sensor, serta Expander L/R.
2. **Heating & Pressure** — steam inlet, heating valve upper/lower, upper felt, lower felt, temperature sensor, serta loadcell upper/lower.
3. **Cooling & Tension** — cooling belt dan dancing roller.
4. **Output** — conveyor belt, chute, plaiter, dan conveyor table.

Fabric path menggunakan garis merah yang kontinu. Steam heating menggunakan garis amber yang terpisah sehingga aliran material dan utilitas mudah dibedakan.

## Equipment dan instrument

| Process item | Element code |
|---|---|
| Steam heating header | `STEAM_HEATING_HEADER` |
| Heating inlet valve | `HEATING_INLET_VALVE` |
| Upper heating valve | `UPPER_HEATING_VALVE` |
| Lower heating valve | `LOWER_HEATING_VALVE` |
| Inlet roller | `INLET_ROLLER` |
| Inlet motor | `INLET_MOTOR` |
| Fabric width sensor | `FABRIC_WIDTH_SENSOR` |
| Expander assembly | `EXPANDER_LR` |
| Expander L motor | `EXPANDER_L_MOTOR` |
| Expander R motor | `EXPANDER_R_MOTOR` |
| Upper felt/cylinder | `UPPER_FELT` |
| Lower felt/cylinder | `LOWER_FELT` |
| Upper felt motor | `UPPER_FELT_MOTOR` |
| Lower felt motor | `LOWER_FELT_MOTOR` |
| Upper temperature | `UPPER_TEMPERATURE` |
| Lower temperature | `LOWER_TEMPERATURE` |
| Loadcell upper | `LOADCELL_UPPER` |
| Loadcell lower | `LOADCELL_LOWER` |
| Cooling belt | `COOLING_BELT` |
| Cooling belt motor | `COOLING_BELT_MOTOR` |
| Dancing roller | `DANCING_ROLLER` |
| Conveyor belt | `CONVEYOR_BELT` |
| Conveyor belt motor | `CONVEYOR_BELT_MOTOR` |
| Plaiter | `PLAITER` |
| Plaiter motor | `PLAITER_MOTOR` |
| Conveyor table motor | `CONVEYOR_TABLE_MOTOR` |
| Fabric route | `FABRIC_PATH` |

## Instrument notation

- `WIT-401`: fabric width indicating transmitter.
- `TT-401`: upper temperature transmitter.
- `TT-402`: lower temperature transmitter.
- `LC-401`: upper loadcell measurement.
- `LC-402`: lower loadcell measurement.
- `ZT-401`: dancing roller position transmitter.

Nomor instrument pada versi ini merupakan convention dashboard awal. Nomor final harus mengikuti drawing dan instrument index aktual mesin.

## Live-state binding

Setiap equipment operasional menggunakan atribut `data-element-code`. Frontend berikutnya dapat mencocokkan atribut tersebut dengan `instrument_state.element_code` untuk memperbarui class state tanpa menggambar ulang SVG.

Contoh canonical tag:

- `SMM.KL-DPN-05.UPPER_HEATING_VALVE.OPEN_FB`
- `SMM.KL-DPN-05.UPPER_FELT.RUN_FB`
- `SMM.KL-DPN-05.UPPER_TEMPERATURE.PV`
- `SMM.KL-DPN-05.LOADCELL_UPPER.PV`
- `SMM.KL-DPN-05.DANCING_ROLLER.POSITION_PV`

## Batasan engineering

Diagram dashboard tidak menggantikan P&ID resmi. Kondisi fail-open/fail-close valve, steam pressure, condensate return, steam trap, interlock, exact fabric threading, ukuran cylinder, serta posisi instrument harus diverifikasi bersama mechanical, process, electrical, dan automation engineering sebelum commissioning.
