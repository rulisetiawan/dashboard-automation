# Tag & Display Mapping Register v1.0

**Tanggal:** 15 Agustus 2026  
**Status:** Baseline mapping konseptual — bukan tag list PLC final

## Cara membaca register

Kode tag berikut adalah **canonical tag** yang dipakai dashboard/API. Pada commissioning, setiap kode dipetakan ke alamat OPC UA, Modbus, atau PLC aktual melalui `tag_source_mapping`. Suffix `_PV` adalah actual/process value, `_SV` adalah setpoint, `_TOTAL` adalah counter monotonik, dan `_STATE` adalah event/state.

| Panel / tampilan | Canonical tag atau sumber | Pengolahan backend | Mode data |
|---|---|---|---|
| Live card | `tag_latest` dari tag terkait | nilai terakhir + quality + source timestamp | Real-time |
| Trend SV/PV | `tag_sample` + `process_step_execution` | rollup sesuai range, overlay step/recipe | Historis per batch/range |
| Abnormal log | PV, SV, tolerance, alarm/state event | detection rule + link batch/step | Event historis |
| Consumption | totalizer meter/flow | delta tervalidasi per interval | Historis |
| Runtime / downtime | machine/drive state | state interval dan reason code | Historis |

## 1. Plant overview dan utilities

| Tampilan | Tag / sumber utama | Formula atau query |
|---|---|---|
| Mesin running / stop / maintenance / problem | `{asset}.MACHINE.STATE`, `equipment_state_event` | state terbaru per asset dengan data freshness. |
| Batch sedang proses / selesai | `batch_machine_run.status` | unique batch aktif dan completed pada selected range. |
| Total output produksi | `{asset}.PRODUCTION.OUTPUT_TOTAL_M` atau batch output | delta counter / approved output menurut subtype. |
| Total water consumption | `{asset}.WATER.TOTAL_M3` | jumlah delta totalizer seluruh asset terpilih. |
| Total energy consumption | `{asset}.METER.ENERGY_KWH_TOTAL` | jumlah delta meter per asset/area. |
| Current utility usage | `{meter}.KW_PV`, `{utility}.FLOW_PV`, `{boiler}.PRESSURE_PV` | snapshot latest, bukan total historis. |
| Pie water/energy per area | `meter_interval` / `water_interval` | group by lane/area; klik area menjadi filter ranking mesin. |
| Cubical / MDP / SDP pie | `{node}.METER.ENERGY_KWH_TOTAL`, `{node}.METER.KW_PV` | group hierarchy electrical pada range / live demand. |

## 2. Jetflow

Prefix contoh: `SMM.LB.JF-LB-08` (ganti area dan machine ID sesuai asset).

| Tampilan Jetflow | Canonical tag / sumber | Catatan |
|---|---|---|
| Main temperature card + SV | `.MAIN_TANK.TEMP_PV`, `.MAIN_TANK.TEMP_SV` | PV/SV batch trend dan alarm tolerance. |
| Total water consumption | `.WATER.TOTAL_M3` | delta totalizer; bukan `FLOW_PV`. |
| Flow teknis | `.WATER.FLOW_PV` | untuk trend/investigasi filling atau drain. |
| Water level | `.MAIN_TANK.LEVEL_PV` | sensor teknis; level low/high event. |
| Dosing tank temperature 1/2 | `.DOSING_TANK_01.TEMP_PV`, `.DOSING_TANK_02.TEMP_PV` | dukung SV bila ada recipe/PLC. |
| Dosing tank level 1/2 | `.DOSING_TANK_01.LEVEL_PV`, `.DOSING_TANK_02.LEVEL_PV` | level low dan kesiapan dosing. |
| Current process | `.BATCH.PROCESS_STEP_CODE` + `process_step_execution` | kode tahap latest dan start/end sequence table. |
| Process overlay pada trend | `process_step_execution.program_parameters` | menampilkan band tahap dan perubahan SV pada semua sensor yang dipilih. |
| Batch / recipe context | `.BATCH.NO`, `.RECIPE.CODE`, `.COLOR.CODE` atau MES event | authoritative source idealnya MES, PLC dipakai sebagai cross-check. |
| Tangle limit Winch n | `.WINCH_0n.TANGLE_LIMIT_STATE` | jumlah winch dinamis 2–8 dari `equipment_config`. |
| Winch motor n | `.WINCH_0n.MOTOR.AMP_R/S/T_PV`, `.VOLT_R/S/T_PV`, `.KW_PV`, `.DRIVE_HZ_PV`, `.RUN_FB` | sumber modal diagnostic 3-phase. |
| Main/circulation/dosing/mixer pump | `.{EQUIPMENT}.MOTOR.*` | struktur tag motor sama untuk setiap equipment. |
| Steam utility | `.STEAM.PRESSURE_PV`, `.STEAM.FLOW_TOTAL_KG` bila tersedia | dikaitkan ke batch / temperature control. |

Tahap program yang distandarkan dalam `process_step_definition`: `FILLING`, `DRAIN`, `RINSE_COOLING`, `CHECK_PH`, `TEMPERATURE_CONTROL`, `INJECT_DT_1`, `INJECT_DT_2`, `DOSING_DT_1`, `DOSING_DT_2`, `LOAD`, `UNLOAD`, `ST_TO_MT_FILLING`. Recipe aktual dapat memiliki hingga sekitar 100 execution step tanpa mengubah layout.

## 3. Calator

Prefix contoh: `SMM.DPN.CL-DPN-01`.

| Tampilan Calator | Canonical tag / sumber | Catatan |
|---|---|---|
| Speed feeding | `.FEEDING.SPEED_PV`, `.FEEDING.SPEED_SV` | sumber output speed dan tracking drive. |
| Speed squeezing 1 / 2 | `.SQUEEZING_01.SPEED_PV`, `.SQUEEZING_02.SPEED_PV` | PV/SV bila setpoint tersedia. |
| Overfeed standard atas/bawah | `.OVERFEED_UPPER.SPEED_PV`, `.OVERFEED_LOWER.SPEED_PV` | gunakan actual dan target; model detail mengikuti subtype. |
| Bianco overfeed in/out 1–4 | `.OVERFEED_IN_LOWER_01..02`, `.OVERFEED_IN_UPPER_03..04`, `.OVERFEED_OUT_LOWER_01..02`, `.OVERFEED_OUT_UPPER_03..04` | equipment config menentukan tag mana yang aktif. |
| Critical overfeed out | `.OVERFEED_OUT_*.SPEED_PV/SV` | calculator dapat menyimpan average/spread sebagai derived tag. |
| Dancing roller | `.DANCER.POSITION_PV` | persen dan center/reference; event near limit. |
| Folder / plaiter speed | `.FOLDER.SPEED_PV`, `.PLAITING.SPEED_PV` | Kedua kecepatan dipakai untuk synchronisation dan troubleshooting line. |
| Output | `.PRODUCTION.OUTPUT_TOTAL_M` | delta counter; kaitkan batch/run. |
| Chemical usage | `dispensing_weighing_event` + `chemical_route` | bukan trend batch sensor; log request code, actual kg, mode, dan destination. |
| Motor line | `.{EQUIPMENT}.MOTOR.AMP_R/S/T_PV`, `.VOLT_R/S/T_PV`, `.KW_PV`, `.DRIVE_HZ_PV`, `.RUN_FB` | Feeding, squeezing, overfeed, folder, plaiter. |

**Normalisasi nama:** seluruh segment canonical ditulis uppercase; equipment plaiter menggunakan segment `PLAITING` agar tidak ada variasi ejaan saat commissioning.

## 4. Dryer

Prefix contoh: `SMM.BLG.DR-BLK-01`.

| Tampilan Dryer | Canonical tag / sumber | Catatan |
|---|---|---|
| Line speed + SV | `.LINE.SPEED_PV`, `.LINE.SPEED_SV` | penentu residence time dan output. |
| Temperature chamber n | `.CHAMBER_0n.TEMP_PV`, `.CHAMBER_0n.TEMP_SV` | jumlah chamber mengikuti `equipment_config`. |
| Temperature profile | seluruh `.CHAMBER_*.TEMP_PV/SV` | trend dan imbalance antar chamber. |
| Thermal oil | `.THERMAL_OIL.SUPPLY_TEMP_PV`, `.RETURN_TEMP_PV`, `.PRESSURE_PV`, `.FLOW_TOTAL_L` bila tersedia | utility dari boiler thermal oil. |
| Moisture in/out | `.FABRIC.MOISTURE_IN_PV`, `.MOISTURE_OUT_PV` | optional; dapat berasal dari QC/LIMS bila belum online. |
| Output | `.PRODUCTION.OUTPUT_TOTAL_M` | delta counter dikaitkan batch/run. |
| Main drive & fan | `.{EQUIPMENT}.MOTOR.AMP_R/S/T_PV`, `.VOLT_R/S/T_PV`, `.KW_PV`, `.DRIVE_HZ_PV`, `.RUN_FB` | Main Drive, Chamber Fan n, Exhaust Fan, Cooling Fan. |

## 5. Kalender

Prefix contoh: `SMM.DPN.KL-DPN-03`.

| Tampilan Kalender | Canonical tag / sumber | Catatan |
|---|---|---|
| Card Loadcell upper / lower | `.UPPER_FELT.LOADCELL_PV`, `.UPPER_FELT.LOADCELL_SV`; `.LOWER_FELT.LOADCELL_PV`, `.LOWER_FELT.LOADCELL_SV` | kg; empat kartu utama menampilkan PV serta SV. |
| Card temperature upper / lower | `.UPPER_FELT.TEMP_PV`, `.UPPER_FELT.TEMP_SV`; `.LOWER_FELT.TEMP_PV`, `.LOWER_FELT.TEMP_SV` | °C; steam heating context. |
| Parameter configuration | loadcell/temp SV di atas, `.EXPANDER.OVERSPEED_SV`, `.INLET.OVERSPEED_SV`, `.PLAITING.OVERSPEED_SV`, `.FABRIC.WIDTH_SV` | parameter program/recipe, bukan nilai sensor live duplikat. |
| Live sensor | `.DANCER.POSITION_PV`, `.FABRIC.WIDTH_PV`, serta empat PV utama | dancing roller dalam %, width cm. |
| Production / delivery | `batch`, `production_order`, `batch_machine_run` | fabric type, gramasi, width target, customer, delivery target, output progress, completed batches. |
| Energy | `.METER.ENERGY_KWH_TOTAL`, `.METER.KW_PV` | ditempatkan di KPI utility, tidak diduplikasi pada live sensor. |
| Steam | `.STEAM.PRESSURE_PV`, `.STEAM.FLOW_TOTAL_KG` bila tersedia | dikaitkan ke temperature upper/lower. |
| Equipment motor | `.{EQUIPMENT}.MOTOR.AMP_R/S/T_PV`, `.VOLT_R/S/T_PV`, `.KW_PV`, `.DRIVE_HZ_PV`, `.RUN_FB` | Inlet, Expander L/R, Upper/Lower Felt, Cooling/Conveyor Belt, Plaiter, Conveyor/Up Down Table. |

## 6. Chemical Dispensing Calator

Prefix contoh: `SMM.DPN.DSP-DPN-01`. Sumber utama halaman ini adalah **transaksi request–weighing–transfer**, bukan trend batch.

| Tampilan Chemical Dispensing | Canonical tag / sumber | Catatan |
|---|---|---|
| Request log | `dispensing_request` | request code, timestamp, chemical, target Calator, manual/automatic, status. |
| Actual chemical weighing | `dispensing_weighing_event.actual_weight_kg` | target vs actual, start/end, operator/auto source. |
| Usage by chemical / Calator | `dispensing_weighing_event` + `chemical_route` | group custom range, chemical variant, destination Calator. |
| Tank 1 loadcell | `.TANK_01.LOADCELL_01_PV`, `.LOADCELL_02_PV`, `.LOADCELL_03_PV`, `.LOADCELL_TOTAL_KG` | tiga loadcell dan calculated total. |
| Tank 2 | `.TANK_02.LEVEL_PV`, `.TANK_02.WEIGHT_PV` bila tersedia | tank sebelum distribution. |
| Eight inlet valves | `.INLET_VALVE_01..08.OPEN_FB` | state P&ID; command tidak disediakan dari dashboard. |
| Transfer valve | `.TRANSFER_VALVE.OPEN_FB` | state transfer Tank 1 → Tank 2. |
| Route ke Calator | `.ROUTE_{CALATOR_ID}.VALVE.OPEN_FB` atau route event | asset route aktif harus berasal dari topology yang tervalidasi. |
| Dispensing equipment drive | `.{EQUIPMENT}.MOTOR.AMP_R/S/T_PV`, `.VOLT_R/S/T_PV`, `.KW_PV`, `.RUN_FB` | bila pump/mixer/drive tersedia. |

Relasi support unit pada baseline: `DSP-DPN-01 → CL-DPN-01..02`; `DSP-BLK-01 → CL-BLK-01..05`; `DSP-BLK-02 → CL-BLK-06..09`; `DSP-TMR-01 → CL-TMR-01..04`; `DSP-TMR-02 → CL-TMR-05..07`. Route fisik harus direkonsiliasi dengan P&ID aktual sebelum data menjadi resmi.

## 7. Motor & drive diagnostic lintas proses

Struktur yang sama dipakai untuk semua motor Jetflow, Calator, Dryer, Kalender, dan equipment dispensing yang terintegrasi.

| Tampilan diagnostic | Canonical tag / sumber | Pengolahan |
|---|---|---|
| Live RMS current R/S/T | `.{EQ}.MOTOR.AMP_R_PV`, `_S_PV`, `_T_PV` | `tag_latest`, limit dan quality. |
| Live voltage R/S/T | `.{EQ}.MOTOR.VOLT_R_PV`, `_S_PV`, `_T_PV` | phase-to-neutral atau phase-to-phase harus dicatat pada metadata. |
| Active power / frequency | `.{EQ}.MOTOR.KW_PV`, `.{EQ}.DRIVE.HZ_PV` | live card. |
| Runtime / unplanned stop | `equipment_state_event` | running interval, stop reason, linked alarm/batch. |
| Min / avg / max & high/low time | `tag_sample` | aggregate per selected custom range; tetap link ke raw sample. |
| Imbalance / voltage spread | R/S/T samples | formula versioned, threshold per equipment. |
| Historical trend | `tag_sample` / `tag_1m` | selectable AMP, voltage, kW, time range + navigator. |
| Full log / export CSV | raw/rollup API query | same filter/range dan audit metadata. |
| Maintenance target | `maintenance_plan` + runtime / event | read-only plan, due date/runtime, action, owner. |

## 8. Binding aturan khusus dashboard

1. Semua card **Live Now** hanya mengambil `tag_latest`, state event terakhir, dan menampilkan freshness/quality.
2. Semua card **Selected Range** mengambil aggregate dan interval event, sehingga berubah hanya ketika user menerapkan start/end date.
3. Drill-down pie area/lane mengirim `area_id` yang sama ke endpoint ranking; halaman tidak perlu scroll ke atas atau membangun data baru di client.
4. Trend batch Jetflow meminta tag sensor terpilih serta `process_step_execution` secara paralel. Checklist process hanya memfilter overlay, bukan mengubah data sensor.
5. Table log chemical menggunakan range custom langsung terhadap `dispensing_request` dan `dispensing_weighing_event`; tidak bergantung pada batch historian.

## 9. Checklist commissioning mapping

- Cocokkan PV, SV, unit, decimal, scale, dan kualitas dengan HMI/instrumen aktual.
- Pastikan totalizer tidak dibaca sebagai instantaneous flow dan tentukan aturan reset/rollover.
- Uji timestamp PLC/gateway, sequence process, batch handover, dan alarm start/clear.
- Tandai tag tidak tersedia sebagai `NOT_MAPPED`; jangan menghasilkan nilai dummy pada produksi.
- Setujui owner process, engineering, maintenance, dan utility sebelum binding dashboard diaktifkan.
