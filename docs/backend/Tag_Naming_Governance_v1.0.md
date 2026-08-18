# Tag Naming & Governance v1.0

**Tanggal:** 18 Agustus 2026  
**Status:** Baseline standar data OT–MES–SCADA

## Tujuan

Tag, asset ID, dan equipment ID tidak dibuat bebas per orang. Standar ini memastikan data dari PLC, historian, dashboard, alarm, maintenance, dan AI memakai identitas yang konsisten dan dapat ditelusuri.

## Kepemilikan dan persetujuan

| Keputusan | Pemilik utama | Reviewer / persetujuan |
|---|---|---|
| Asset ID dan area | Engineering / Plant Asset Owner | Production, Maintenance, MES |
| Equipment ID | Maintenance Engineering | Automation, Plant Asset Owner |
| Signal role dan engineering unit | Process Engineering | Automation, QA, MES |
| PLC address / OPC UA Node ID / Modbus register | Automation / OT | Maintenance |
| Tag code historian | MES / Data Engineer | Automation, Process Engineering |
| Limit alarm dan severity | Process + Maintenance | Production Manager |

Tidak ada tag baru yang langsung dipakai di production tanpa masuk Tag Registry dan melewati review minimal Automation serta Process Owner.

## Identitas data

### Asset ID

Asset ID adalah nomor mesin resmi di sistem MES/SCADA.

```text
{PROCESS_CODE}-{AREA_CODE}-{SEQUENCE}
```

Contoh:

```text
JF-LA-01       Jetflow Lane A nomor 01
CL-DPN-01      Calator Depan nomor 01
DR-BLK-02      Dryer Belakang nomor 02
KL-TMR-07      Kalender Timur nomor 07
DSP-DPN-01     Dispensing Calator Depan nomor 01
```

### Equipment ID

Equipment ID harus selalu memiliki asset induk.

```text
{ASSET_ID}-MTR-{EQUIPMENT_CODE}
```

Contoh:

```text
CL-DPN-01-MTR-FEED
CL-DPN-01-MTR-OF-OUT
JF-LA-01-MTR-MAIN-PUMP
KL-DPN-01-MTR-UP-FELT
```

## Standar tag

### Tag code canonical

Tag code canonical adalah identitas unik pada database, historian, API, dashboard, dan model AI. Ia tidak perlu sama dengan alamat fisik PLC.

```text
SMM.{PROCESS}.{AREA}.{ASSET}.{EQUIPMENT_OR_SECTION}.{PARAMETER}_{ROLE}
```

Bagian `EQUIPMENT_OR_SECTION` boleh dihilangkan untuk signal level mesin. Gunakan huruf kapital, underscore untuk nama parameter, dan titik sebagai pemisah level.

Contoh:

```text
SMM.CALATOR.DPN.CL-DPN-01.FEEDING.SPEED_PV
SMM.CALATOR.DPN.CL-DPN-01.OVERFEED_OUT.SPEED_SV
SMM.JETFLOW.LA.JF-LA-01.MAIN_TANK.TEMPERATURE_PV
SMM.JETFLOW.LA.JF-LA-01.DOSING_TANK_01.LEVEL_PV
SMM.KALENDER.DPN.KL-DPN-01.UPPER_FELT.LOADCELL_PV
SMM.DRYER.DPN.DR-DPN-01.CHAMBER_01.TEMPERATURE_PV
SMM.CALATOR.DPN.CL-DPN-01.MTR-FEED.CURRENT_R_PV
```

### Signal role

`signal_role` adalah nama semantik yang digunakan dashboard untuk mapping tampilan. Formatnya lebih ringkas:

```text
{SECTION}_{PARAMETER}_{ROLE}
```

Contoh:

```text
FEEDING_SPEED_PV
OVERFEED_OUT_SPEED_SV
MAIN_TANK_TEMPERATURE_PV
DANCER_POSITION_PV
CURRENT_R_PV
MACHINE_STATE
```

### Role yang diizinkan

| Role | Makna |
|---|---|
| `PV` | Process Value / nilai aktual |
| `SV` | Setpoint / nilai target |
| `STATE` | Status diskret, misalnya running atau stop |
| `CMD` | Perintah yang dikirim controller; tidak dipakai untuk write dari dashboard V1 |
| `FB` | Feedback perangkat, misalnya valve open feedback |
| `ALARM` | Alarm atau trip diskret |
| `TOTAL` | Counter terakumulasi, misalnya output meter atau kWh |
| `RUNTIME` | Akumulasi jam operasi |

## Mapping alamat PLC

Alamat PLC tidak dimasukkan ke `tag_code`. Alamat disimpan sebagai metadata source mapping:

| Field mapping | Contoh |
|---|---|
| Protocol | `OPC_UA`, `MODBUS_TCP`, `S7`, `ETHERNET_IP` |
| Gateway ID | `GW-WASH-01` |
| Endpoint | IP/hostname gateway yang dikelola OT |
| Source address | OPC UA Node ID / Modbus register / PLC DB address |
| Scan interval | `1000 ms` |
| Data type | `Float32`, `Int16`, `Boolean` |
| Scale / offset | `0.1`, `+0.0` |
| Engineering unit | `m/min`, `°C`, `kg`, `%`, `A`, `kW` |

Dengan pemisahan ini, alamat PLC dapat berubah tanpa merusak dashboard dan histori tag canonical.

## Aturan kualitas data

Setiap sample sensor harus membawa:

- `source_ts`: waktu data di PLC/gateway.
- `ingested_at`: waktu data masuk ke database.
- `quality`: minimal `GOOD`, `UNCERTAIN`, `BAD`, atau `STALE`.
- `gateway_id` dan `message_id` untuk traceability serta deduplikasi.

Dashboard tidak boleh menyamarkan data `BAD` atau `STALE` sebagai nilai normal.

## Proses pendaftaran tag baru

1. Process Engineer mengajukan kebutuhan parameter dan tujuan tampilannya.
2. Automation Engineer memverifikasi sumber PLC, datatype, unit, scan interval, dan scaling.
3. MES/Data Engineer menerbitkan asset ID, tag code canonical, signal role, serta mapping display.
4. Reviewer menyetujui unit, range normal, alarm limit, dan ownership.
5. Tag diuji pada staging/commissioning dengan quality dan timestamp.
6. Setelah disetujui, `source_status` di Tag Registry menjadi `MAPPED` dan collector diaktifkan.

## Aturan perubahan

- Tag code canonical tidak diubah setelah data produksi masuk; gunakan tag baru dan tandai tag lama `RETIRED`.
- Perubahan PLC address hanya memperbarui source mapping, bukan tag code canonical.
- Perubahan unit wajib disertai versioning dan konversi historis yang terdokumentasi.
- Tag `CMD` tidak boleh diberikan akses write dari dashboard tanpa workflow approval, audit trail, dan interlock safety terpisah.

## Minimum Tag Registry

Setiap tag minimal memiliki kolom berikut:

```text
tag_code
asset_id
equipment_id (opsional)
signal_role
engineering_unit
protocol
gateway_id
source_address
data_type
scale
offset
scan_interval_ms
normal_low
normal_high
alarm_low
alarm_high
source_status
owner
created_at
```

## Status mapping

| Status | Arti |
|---|---|
| `DRAFT` | Belum direview |
| `PENDING_MAPPING` | Disetujui semantik, source PLC belum tersambung |
| `MAPPED` | Source terverifikasi dan collector aktif |
| `COMMISSIONING` | Sedang diuji di lapangan |
| `RETIRED` | Tidak dipakai lagi, histori tetap disimpan |

## Contoh Calator

| Kebutuhan | Asset | Canonical tag | Unit | Display |
|---|---|---|---|---|
| Speed Feeding aktual | `CL-DPN-01` | `SMM.CALATOR.DPN.CL-DPN-01.FEEDING.SPEED_PV` | m/min | Critical Process → Feeding |
| Speed Overfeed Out target | `CL-DPN-01` | `SMM.CALATOR.DPN.CL-DPN-01.OVERFEED_OUT.SPEED_SV` | m/min | Card Overfeed Out / SV-PV trend |
| Dancing Roller aktual | `CL-DPN-01` | `SMM.CALATOR.DPN.CL-DPN-01.DANCER.POSITION_PV` | % | Live Monitoring |
| Current phase R motor Feed | `CL-DPN-01` | `SMM.CALATOR.DPN.CL-DPN-01.MTR-FEED.CURRENT_R_PV` | A | Motor Diagnostic |

## Catatan dataset test

Tag dengan `TEST_SAMPLE` atau prefix `SMM.TEST` hanya untuk demonstrasi integrasi lokal. Tag tersebut tidak boleh menjadi standar production tanpa diregistrasikan ulang memakai format canonical di atas.
