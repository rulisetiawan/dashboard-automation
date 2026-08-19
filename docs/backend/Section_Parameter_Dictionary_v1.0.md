# Section & Parameter Dictionary v1.0

**Tanggal:** 19 Agustus 2026  
**Status:** Standar baseline untuk Tag Registry PT.SMM

## Tujuan

Dokumen ini membakukan dua komponen semantic tag:

```text
SMM.{ASSET_ID}.{SECTION}.{PARAMETER}
```

Contoh:

```text
SMM.CL-DPN-01.OVERFEED_OUT.SPEED_SV
```

- `ASSET_ID` menunjukkan mesin dan area; contoh `CL-DPN-01` sudah berarti Calator Depan 01.
- `SECTION` menunjukkan bagian fisik atau fungsi proses pada mesin.
- `PARAMETER` menunjukkan besaran/sinyal yang dipantau atau diperintahkan.

Area dan process type tidak perlu diulang dalam canonical tag karena dibaca dari master `asset`. Alamat fisik PLC/OPC UA/Modbus disimpan pada mapping source, bukan pada nama tag.

## Aturan penamaan

1. Gunakan huruf kapital, angka, dan underscore (`A-Z`, `0-9`, `_`).
2. Gunakan nama bahasa Inggris teknis yang konsisten; label dashboard dapat tetap bahasa Indonesia.
3. `SECTION` harus berasal dari kamus proses di bawah, bukan nama bebas.
4. `PARAMETER` harus memakai suffix status baku: `PV`, `SV`, `FB`, `CMD`, `TOTAL`, atau `STATUS`.
5. Nomor equipment memakai dua digit: `WINCH_01`, `FAN_01`, `VALVE_01`.
6. Saat belum ada section khusus, gunakan `MACHINE` hanya untuk signal tingkat mesin seperti mode, emergency stop, atau counter utama.

## Suffix parameter baku

| Suffix | Arti | Contoh |
|---|---|---|
| `_PV` | Process Value / nilai aktual hasil pembacaan | `TEMPERATURE_PV` |
| `_SV` | Setpoint / target aktif | `SPEED_SV` |
| `_FB` | Feedback diskrit dari field/PLC | `RUN_FB`, `OPEN_FB` |
| `_CMD` | Command/request. Hanya dipakai dalam jalur OT yang disetujui | `START_CMD` |
| `_TOTAL` | Counter akumulatif yang tidak di-reset tiap batch | `ENERGY_TOTAL` |
| `_STATUS` | Kode state/mode/quality | `DRIVE_STATUS` |
| `_SPREAD` | Selisih atau deviasi hasil kalkulasi | `SPEED_SPREAD` |
| `_ALARM` | Status alarm/interlock diskrit | `HIGH_TEMP_ALARM` |

`PV` dan `SV` adalah tag terpisah. Jangan menyimpan setpoint di dalam tag PV atau sebaliknya.

## Parameter global

| Parameter | Unit lazim | Keterangan |
|---|---|---|
| `SPEED_PV`, `SPEED_SV` | m/min atau Hz | Kecepatan line/roller/drive; unit wajib ditentukan di registry. |
| `TEMPERATURE_PV`, `TEMPERATURE_SV` | °C | Temperatur aktual dan target. |
| `PRESSURE_PV`, `PRESSURE_SV` | bar(g) | Steam, udara, atau hydraulic pressure. |
| `LEVEL_PV`, `LEVEL_SV` | %, mm, atau m³ | Unit harus sesuai instrument. |
| `FLOW_PV`, `FLOW_TOTAL` | m³/h; m³ | Laju alir versus totalizer. |
| `WEIGHT_PV`, `WEIGHT_SV` | kg | Loadcell atau timbang chemical. |
| `POSITION_PV`, `POSITION_SV` | % atau mm | Dancer, actuator, table. |
| `OUTPUT_TOTAL` | m, kg, atau roll | Counter output mesin. |
| `BATCH_NO` | text | Nomor batch aktif. |
| `PROCESS_STEP_CODE` | text/integer | Step program yang sedang berjalan. |
| `MACHINE_STATE` | text | `RUNNING`, `STOP`, `MAINTENANCE`, `FAULT`, `IDLE`. |

## Motor dan drive 3-phase

Section motor memakai kode equipment yang tercatat pada tabel `equipment`.

| Parameter | Unit | Keterangan |
|---|---|---|
| `CURRENT_R_PV`, `CURRENT_S_PV`, `CURRENT_T_PV` | A | Arus RMS setiap fase. |
| `VOLTAGE_RS_PV`, `VOLTAGE_ST_PV`, `VOLTAGE_TR_PV` | V | Tegangan antar fase. |
| `ACTIVE_POWER_PV` | kW | Active power drive/motor. |
| `ENERGY_TOTAL` | kWh | Counter energi kumulatif. |
| `DRIVE_FREQUENCY_PV` | Hz | Frekuensi output VFD. |
| `RUNTIME_TOTAL` | h | Runtime kumulatif. |
| `RUN_FB`, `FAULT_FB`, `TRIP_FB` | boolean | Status diskrit. |
| `DRIVE_STATUS` | text/integer | State/mode atau fault code drive. |

Contoh:

```text
SMM.CL-DPN-01.FEED.CURRENT_R_PV
SMM.KL-DPN-01.UP_FELT.DRIVE_FREQUENCY_PV
SMM.JF-LA-01.WINCH_01.RUN_FB
```

## Jetflow

| Section | Fungsi |
|---|---|
| `MACHINE` | Batch, recipe, machine state, process step. |
| `MAIN_TANK` | Main tank temperature, level, filling/drain. |
| `DOSING_TANK_01`, `DOSING_TANK_02` | Temperatur dan level tangki dosing. |
| `WATER_INLET` | Flow dan total water intake. |
| `WINCH_01`–`WINCH_08` | Winch dinamis sesuai konfigurasi mesin. |
| `MAIN_PUMP`, `CIRCULATION_PUMP` | Pompa utama dan sirkulasi. |
| `DOSING_PUMP_01`, `DOSING_PUMP_02` | Pompa dosing. |
| `MIXER_01`, `MIXER_02` | Mixer chemical/dosing. |
| `STEAM_SUPPLY` | Flow/pressure steam bila meter tersedia. |

Contoh:

```text
SMM.JF-LA-01.MAIN_TANK.TEMPERATURE_PV
SMM.JF-LA-01.MAIN_TANK.TEMPERATURE_SV
SMM.JF-LA-01.WATER_INLET.FLOW_TOTAL
SMM.JF-LA-01.MACHINE.PROCESS_STEP_CODE
```

## Calator

| Section | Fungsi |
|---|---|
| `FEED` | Feeding/entry line. |
| `SQUEEZING_01`, `SQUEEZING_02` | Squeezing roller. |
| `OVERFEED_IN_TOP`, `OVERFEED_IN_BOTTOM` | Overfeed inlet; channel spesifik dapat diberi `_01`–`_04`. |
| `OVERFEED_OUT` | Overfeed outlet; parameter proses utama. |
| `DANCER` | Dancer roller position/tension reference. |
| `FOLDER` | Folding section. |
| `PLAIT` | Plaiter section. |
| `WATER_INLET` | Water consumption dan flow bila tersedia. |
| `CHEMICAL_TRANSFER` | Request, route, weight received, status transfer. |

Contoh:

```text
SMM.CL-DPN-01.OVERFEED_OUT.SPEED_PV
SMM.CL-DPN-01.OVERFEED_OUT.SPEED_SV
SMM.CL-DPN-01.DANCER.POSITION_PV
SMM.CL-DPN-01.CHEMICAL_TRANSFER.WEIGHT_PV
```

## Dryer

| Section | Fungsi |
|---|---|
| `LINE` | Kecepatan line dan output. |
| `CHAMBER_01`–`CHAMBER_NN` | Temperatur/chamber condition. |
| `FAN_01`–`FAN_NN` | Motor sirkulasi setiap chamber. |
| `EXHAUST_FAN` | Exhaust. |
| `COOLING_FAN` | Cooling section. |
| `THERMAL_OIL_SUPPLY` | Temperatur, pressure, flow oil bila tersedia. |

Contoh:

```text
SMM.DR-DPN-01.CHAMBER_01.TEMPERATURE_PV
SMM.DR-DPN-01.THERMAL_OIL_SUPPLY.TEMPERATURE_PV
SMM.DR-DPN-01.MAIN_DRIVE.SPEED_PV
```

## Kalender

| Section | Fungsi |
|---|---|
| `INLET` | Inlet drive/temperature. |
| `UPPER_FELT`, `LOWER_FELT` | Upper/lower felt dan loadcell terkait. |
| `UPPER_ROLL`, `LOWER_ROLL` | Temperatur roll bila sensor diletakkan di roll. |
| `EXPANDER_LEFT`, `EXPANDER_RIGHT` | Expander L/R. |
| `DANCER` | Dancer roller. |
| `COOLING_BELT`, `CONVEYOR_BELT` | Belt equipment. |
| `PLAIT`, `CONVEYOR_TABLE`, `UP_DOWN_TABLE` | Finishing/output equipment. |
| `FABRIC` | Width, target gramasi, quality context. |
| `STEAM_SUPPLY` | Steam meter/pressure. |

Contoh:

```text
SMM.KL-DPN-01.UPPER_FELT.WEIGHT_PV
SMM.KL-DPN-01.UPPER_FELT.WEIGHT_SV
SMM.KL-DPN-01.UPPER_ROLL.TEMPERATURE_PV
SMM.KL-DPN-01.FABRIC.WIDTH_PV
SMM.KL-DPN-01.DANCER.POSITION_PV
```

## Chemical Dispensing Calator

| Section | Fungsi |
|---|---|
| `INLET_VALVE_01`–`INLET_VALVE_08` | Valve chemical masuk Tank 1. |
| `TANK_01` | Loadcell/weight, mixer, level jika tersedia. |
| `TRANSFER_VALVE` | Valve antar tank. |
| `TRANSFER_PUMP` | Pump transfer ke Tank 2. |
| `TANK_02` | Level/weight/status tank tujuan. |
| `ROUTE_CL_XX` | Jalur ke Calator tertentu. |
| `CHEMICAL_REQUEST` | Request code, mode manual/auto, total target/actual. |

Contoh:

```text
SMM.DSP-DPN-01.TANK_01.WEIGHT_PV
SMM.DSP-DPN-01.INLET_VALVE_01.OPEN_FB
SMM.DSP-DPN-01.TRANSFER_PUMP.RUN_FB
SMM.DSP-DPN-01.ROUTE_CL_01.OPEN_FB
```

## Utilities

Asset utilitas memiliki section sesuai hierarchy meter atau equipment:

```text
SMM.ELC-CUB-01.METER.ENERGY_TOTAL
SMM.ELC-MDP-03.METER.ACTIVE_POWER_PV
SMM.WTR-MAIN-01.METER.FLOW_TOTAL
SMM.BLR-STM-01.STEAM_HEADER.PRESSURE_PV
SMM.BLR-OIL-01.THERMAL_OIL_SUPPLY.TEMPERATURE_PV
```

## Governance dan perubahan

1. Process Engineer menentukan section berdasarkan fungsi proses/P&ID.
2. Automation Engineer memetakan section/parameter ke tag PLC atau node OPC UA.
3. Data Engineer memasukkan canonical tag, unit, data type, sampling rate, alarm limit, dan source mapping ke Tag Registry.
4. Perubahan nama tidak dilakukan langsung pada tag aktif. Buat usulan, review impact dashboard/historian, lalu versioning mapping.
5. Tambahan section/parameter harus dimasukkan ke dokumen versi berikutnya agar seluruh asset memakai istilah yang sama.
