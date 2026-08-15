# Backend Data Architecture Concept v1.0

**Tanggal:** 15 Agustus 2026  
**Status:** Baseline konseptual  
**Ruang lingkup:** Transmisi data OT–IT, tag registry, historian, MES context, API dashboard, dan kesiapan analitik/AI.

## 1. Tujuan

Backend SCADA / MES PT.SMM harus menjadi pondasi yang tetap stabil saat jumlah aset berkembang dari baseline **138 aset mesin** menuju sekitar 300 mesin, sensor, meter utilitas, dan equipment pendukung. Dashboard tidak boleh bergantung pada nama tag atau layout yang ditulis tetap di frontend. Penambahan mesin, jumlah winch Jetflow, chamber Dryer, motor, sensor, atau perubahan alamat PLC dilakukan melalui master data dan versi mapping tag.

Fase V1 bersifat **read-only**: backend hanya mengumpulkan, memvalidasi, menyimpan, menghitung, dan menyajikan data. Tidak ada command dari dashboard, AI, atau jaringan IT ke PLC/drive.

## 2. Prinsip arsitektur

1. **Configuration-driven.** Asset, equipment, tag, satuan, interval, limit, formula KPI, dan komponen dashboard dibaca dari registry, bukan hard-coded per mesin.
2. **Satu sumber kebenaran.** Raw telemetry tetap tersimpan; snapshot, KPI, alarm, dan kartu dashboard adalah turunan yang dapat ditelusuri ke tag asal.
3. **Identitas stabil.** `asset_id`, `equipment_id`, dan `tag_id` adalah identitas internal permanen. Nama mesin fisik, alamat PLC, atau label tampilan dapat berubah tanpa memutus histori.
4. **Context first.** Sampel data selalu membawa waktu, kualitas data, sumber edge, dan bila tersedia `batch_id`, `run_id`, recipe, serta process step.
5. **Store-and-forward.** Gangguan jaringan IT tidak boleh menghilangkan data operasi. Edge gateway menyimpan antrean lokal lalu mengirim ulang setelah koneksi pulih.
6. **Segregasi OT–IT.** PLC berada di jaringan OT; hanya gateway yang diizinkan membaca data dan meneruskan ke DMZ / backend. Arah komunikasi produksi adalah keluar dari OT.
7. **AI advisory only.** Model AI kelak membaca historian dan mengirim rekomendasi berjejak audit. AI tidak menulis setpoint atau menjalankan mesin secara langsung.

## 3. Alur transmisi data

1. PLC, VFD/drive, power meter, flow meter, sensor, dan boiler controller menghasilkan nilai proses atau event.
2. **OT Edge Gateway** per lane/area membaca tag melalui OPC UA subscription bila tersedia; Modbus TCP/RTU atau driver vendor digunakan sebagai fallback.
3. Edge melakukan timestamp, konversi satuan/scaling, validasi tipe data, penandaan kualitas, buffering disk, dan membentuk envelope telemetry baku.
4. Edge mem-publish ke broker/ingestion endpoint di zona DMZ dengan MQTT over TLS atau HTTPS. Pengiriman menggunakan `message_id` untuk deduplikasi.
5. Ingestion service memvalidasi schema dan mapping tag aktif, lalu menulis raw sample ke historian serta memperbarui live snapshot.
6. Stream processor membentuk event state, alarm, konsumsi delta totalizer, runtime, downtime, output, dan aggregate 1 menit / 15 menit / 1 jam.
7. MES context service menghubungkan batch, customer, fabric spec, recipe, process execution, chemical request, dan quality record dengan interval waktu mesin.
8. Dashboard mengambil snapshot melalui WebSocket/SSE dan histori melalui REST query yang dibatasi asset, tag, batch, serta time range.

Detail graph tersedia pada [Backend Data Flow Graph v1.0](Backend_Data_Flow_Graph_v1.0.md).

## 4. Layer backend yang disarankan

| Layer | Tanggung jawab | Catatan implementasi |
|---|---|---|
| Field / control | PLC, VFD, meter, instrument, HMI | Tetap menjadi sumber kontrol utama; tidak diakses langsung dari frontend. |
| OT Edge | Protocol adapter, read-only collector, buffer lokal, normalizer | Gateway ditempatkan per area/lane agar kegagalan satu gateway tidak menghentikan seluruh plant. |
| OT DMZ | MQTT broker / secure relay | Sertifikat perangkat, ACL topic, dan jalur satu arah ke IT. |
| Ingestion & stream | Validasi telemetry, deduplication, latest state, event engine | Stateless dan dapat diskalakan horizontal. |
| Data platform | PostgreSQL + TimescaleDB historian, object storage, cache | PostgreSQL untuk master/MES; hypertable untuk sample time-series. |
| Application service | Asset registry, batch, KPI, alarm, maintenance, chemical, API | Tidak menyimpan alamat PLC di frontend. |
| Presentation | Dashboard, export, mobile/reporting | Seluruh query memakai canonical tag code dan permission. |
| Analytics / AI | Feature store, model, recommendation, feedback | Membaca data terkurasi; hasil bersifat rekomendasi dan diaudit. |

## 5. Tag registry dan standar penamaan

### 5.1 Canonical tag code

Format yang diusulkan:

```text
SMM.{AREA}.{ASSET_ID}.{EQUIPMENT}.{SIGNAL}
```

Contoh:

```text
SMM.LB.JF-LB-08.MAIN_TANK.TEMP_PV
SMM.LB.JF-LB-08.MAIN_TANK.TEMP_SV
SMM.DPN.KL-DPN-03.UPPER_FELT.LOADCELL_PV
SMM.BLG.DR-BLK-01.CHAMBER_03.TEMP_PV
SMM.TMR.DSP-TMR-02.TANK_01.LOADCELL_TOTAL_KG
SMM.UTIL.MDP-02.METER.ENERGY_KWH_TOTAL
```

Kode canonical dipakai oleh API dan mapping dashboard. Alamat sumber seperti NodeId OPC UA, register Modbus, atau nama tag PLC disimpan hanya pada `tag_source_mapping` dan dapat berganti versi.

### 5.2 Isi minimum sebuah tag definition

| Field | Contoh | Fungsi |
|---|---|---|
| `tag_id` | UUID | Identitas teknis permanen. |
| `tag_code` | `SMM.LB.JF-LB-08.MAIN_TANK.TEMP_PV` | Kode universal untuk API dan analitik. |
| `asset_id` / `equipment_id` | `JF-LB-08` / `MAIN_TANK` | Konteks mesin dan equipment. |
| `signal_role` | `PV`, `SV`, `TOTALIZER`, `STATE`, `ALARM` | Cara data dipakai pada dashboard dan formula. |
| `data_type`, `engineering_unit` | `float`, `°C` | Validasi serta format tampilan. |
| `source_protocol`, `source_address` | `OPC_UA`, `ns=3;s=...` | Detail integrasi yang tidak dipublikasikan ke UI. |
| `scale`, `offset`, `deadband` | `0.1`, `0`, `0.05` | Normalisasi dan pengendalian volume sample. |
| `sample_policy` | `1s`, `on_change` | Interval collect atau aturan event. |
| `stale_after_sec`, `quality_rule` | `15`, `GOOD/UNCERTAIN/BAD` | Kesehatan data. |
| `mapping_version`, `effective_from/to` | `1.0`, tanggal | Riwayat perubahan mapping. |

### 5.3 Contoh konfigurasi tag

```json
{
  "tag_code": "SMM.LB.JF-LB-08.MAIN_TANK.TEMP_PV",
  "signal_role": "PV",
  "data_type": "float64",
  "engineering_unit": "degC",
  "source": {
    "gateway_id": "EDGE-JF-LB-01",
    "protocol": "OPC_UA",
    "address": "ns=3;s=Jetflow08.MainTank.TempActual"
  },
  "collection": { "period_ms": 1000, "deadband": 0.1, "stale_after_sec": 15 },
  "display": { "label": "Main Tank Temperature", "decimals": 1, "trend_group": "temperature" }
}
```

## 6. Frekuensi dan kualitas data

| Kelas data | Contoh | Pengambilan | Penyimpanan / pemakaian |
|---|---|---:|---|
| Fast process | motor ampere, drive Hz, temperature Jetflow | 1 detik atau perubahan nilai | raw historian, diagnostic, trend batch |
| Standard process | level, speed, water flow, loadcell | 2–5 detik | raw historian, dashboard mesin |
| Meter / utility | kW, energy totalizer, steam/thermal oil | 1–5 detik; energy di-on-change | live usage dan aggregate konsumsi |
| State / alarm | running, fault, valve, interlock, step | on-change, heartbeat 15–30 detik | event ledger, runtime/downtime |
| MES transaction | batch start/end, recipe, chemical request | event driven | relational transaction dan traceability |
| Quality / maintenance | QC result, work order, calibration | event/manual approval | relational record dan analitik |

Setiap sample memiliki `source_ts`, `ingested_ts`, `quality`, dan `gateway_id`. Backend menandai sample **STALE** bila tidak ada pembaruan setelah batas tag; nilai terakhir tidak boleh tampak seolah-olah live tanpa label kualitas.

## 7. Model database

### 7.1 Master dan konfigurasi

| Tabel | Isi utama |
|---|---|
| `site`, `area`, `asset` | Hierarki plant, lane/area, mesin, nomor fisik, subtype, status integrasi. |
| `equipment` | Winch, pump, motor, chamber, felt, tank, valve, meter, dan hubungan parent–child. |
| `tag_definition` | Canonical tag, unit, tipe, role, interval, limit, mapping version. |
| `tag_source_mapping` | Protocol, gateway, alamat sumber, scaling, effective period. |
| `dashboard_binding` | Card/chart/table → canonical tag atau formula KPI. |
| `process_step_definition`, `recipe` | Kode tahap, urutan, sensor relevan, profile SV. |
| `chemical`, `chemical_route`, `utility_meter` | Tujuh chemical, route–destination, hierarchy Cubical/MDP/SDP/machine meter. |

### 7.2 Operasional dan MES

| Tabel | Isi utama |
|---|---|
| `batch`, `production_order` | Nomor batch/kain, customer, fabric type, target output, delivery target. |
| `batch_machine_run` | Batch pada mesin tertentu, start/end, planned vs actual, status. |
| `process_step_execution` | Step Jetflow atau process program, start/end, status, parameter program/SV. |
| `equipment_state_event` | Running, stopped, maintenance, fault, reason, durasi. |
| `alarm_event` | Alarm source, severity, acknowledge, clear, linked batch/run. |
| `dispensing_request`, `dispensing_weighing_event` | Request code, chemical, target/actual kg, mode manual/auto, tujuan Calator. |
| `maintenance_plan`, `maintenance_execution` | Target maintenance, runtime trigger, action, result. |

### 7.3 Historian dan data turunan

| Tabel / materialized view | Bentuk data |
|---|---|
| `tag_sample` | Hypertable: `ts`, `tag_id`, numeric/text/bool value, quality, source timestamp, ingestion id. |
| `tag_latest` | Satu nilai terakhir per tag untuk live dashboard. |
| `tag_1m`, `tag_15m`, `tag_1h` | Min/avg/max/last/count untuk query histori cepat. |
| `meter_interval` | Delta energy/water/steam/oil hasil totalizer yang tervalidasi. |
| `motor_phase_interval` | Turunan per fase R/S/T: min/avg/max ampere & voltage, kW, Hz, imbalance. |
| `kpi_interval` | Output, runtime, downtime, consumption dan intensity per asset/area/range. |

`tag_sample` tidak dibuat per mesin atau per tag. Satu hypertable berpartisi waktu dan `tag_id` menjaga skala saat jumlah tag bertambah besar. Retensi awal yang disarankan: raw 1 detik 90 hari, aggregate 1 menit 2 tahun, aggregate 15 menit/1 jam minimal 5 tahun; keputusan akhir mengikuti kebutuhan audit dan kapasitas.

### 7.4 Contoh envelope telemetry

```json
{
  "schema_version": "1.0",
  "message_id": "b12ec9b2-09fa-4b4b-8b55-7bc90d1e2d11",
  "site_id": "SMM",
  "gateway_id": "EDGE-JF-LB-01",
  "sent_at": "2026-08-15T08:10:02.134Z",
  "samples": [
    {
      "tag_code": "SMM.LB.JF-LB-08.MAIN_TANK.TEMP_PV",
      "source_ts": "2026-08-15T08:10:01.991Z",
      "value": 126.4,
      "quality": "GOOD"
    },
    {
      "tag_code": "SMM.LB.JF-LB-08.BATCH.PROCESS_STEP_CODE",
      "source_ts": "2026-08-15T08:10:01.991Z",
      "value": "TEMPERATURE_CONTROL",
      "quality": "GOOD"
    }
  ]
}
```

## 8. Perhitungan yang harus dilakukan backend

- **Consumption:** `delta(totalizer)` per interval. Reset meter, rollover, nilai mundur, dan gap komunikasi harus diberi flag, bukan langsung dijumlahkan.
- **Runtime/downtime:** dibangun dari event state mesin/drive, dengan reason code bila tersedia. Status UI `running`, `stop`, `maintenance`, `problem`, dan `offline` berasal dari rule state yang terdokumentasi.
- **Output:** selisih production/length counter yang tervalidasi, lalu dikaitkan dengan `batch_machine_run`; formula berbeda dapat dipasang per subtype mesin.
- **Abnormality:** evaluasi `PV` vs `SV` / tolerance / hold time serta event alarm. Event menyimpan worst PV, deviation, start/end, batch, step, recovery, dan tag source.
- **Motor diagnostic:** raw R/S/T dipertahankan; statistik min/avg/max, high/low timestamp, imbalance, runtime, dan energy dihitung per selected range.
- **Plant overview:** cache live hanya membaca `tag_latest` dan state event; kartu historis membaca `kpi_interval` sesuai selected custom range.

## 9. API dan data contract dashboard

Frontend tidak memanggil PLC dan tidak mengenal alamat register. API mengembalikan canonical code, metadata unit, kualitas, dan source timestamp.

| Endpoint / channel | Tujuan |
|---|---|
| `GET /api/v1/plant/overview?from=&to=` | Live fleet state serta KPI historis plant. |
| `GET /api/v1/assets?process=&area=` | Navigasi overview per proses, lane, dan area. |
| `GET /api/v1/assets/{assetId}/snapshot` | Kartu live dan health data mesin. |
| `GET /api/v1/history?tags=&from=&to=&rollup=` | PV/SV, motor trend, utility, dan histori dapat digeser. |
| `GET /api/v1/batches/{batchNo}/investigation` | Context batch, step execution, sensor series, serta abnormal log. |
| `GET /api/v1/dispensing/{assetId}/transactions` | Log dispensing dengan custom date range, chemical, mode, dan destination Calator. |
| `GET /api/v1/equipment/{id}/diagnostic` | Live R/S/T, statistik historis, trend, log, dan maintenance plan. |
| `WS /ws/v1/snapshot` | Delta live snapshot untuk user yang berhak. |

Export CSV mengambil query API yang sama, termasuk time range, permission, dan metadata unit agar hasil export dapat diaudit.

## 10. Keamanan, audit, dan reliability

- Segmen OT, DMZ, dan IT dipisahkan firewall; dashboard tidak dapat merutekan trafik ke PLC.
- Gateway memakai certificate/mTLS, ACL topic, dan akun read-only pada PLC/OPC server.
- RBAC minimum: Management, Production, Engineering, Maintenance, Utility, Quality, Administrator. Semua export, acknowledgement, dan perubahan master dicatat.
- NTP/PTP diselaraskan pada PLC/gateway/server. `source_ts` tidak diganti oleh waktu server.
- Backup PostgreSQL, object storage, konfigurasi gateway, dan tag registry diuji pemulihannya. Target RPO/RTO ditentukan bersama IT/OT.
- Data quality wajib tampil pada API: `GOOD`, `UNCERTAIN`, `BAD`, `STALE`, `NOT_CONNECTED`.

## 11. Pengelolaan perubahan dan versioning

Perubahan tag tidak boleh menghapus histori. Gunakan workflow:

1. Register asset/equipment baru atau perubahan konfigurasi (`winch_count`, jumlah chamber, subtype Bianco).
2. Buat `tag_source_mapping` versi baru dengan tanggal efektif dan peer review OT + process owner.
3. Jalankan commissioning: compare nilai gateway dengan HMI/instrumen, unit, scaling, update rate, dan alarm state.
4. Aktifkan mapping setelah validasi; mapping lama dinonaktifkan tetapi tetap tersimpan.
5. Dashboard binding menggunakan canonical tag, sehingga UI tidak perlu dipatch bila alamat PLC berubah.

## 12. Tahap implementasi

| Tahap | Hasil minimum |
|---|---|
| 0. Foundation | Asset registry, tag register template, naming, network survey, time sync, data quality rule. |
| 1. Jetflow pilot | Satu lane, batch/run, PV/SV, process step, water/steam, motor diagnostic, historian. |
| 2. Calator + dispensing | Multi-speed, dancer, chemical request–weighing–destination traceability. |
| 3. Dryer + Kalender | Chamber/thermal oil, loadcell/temp/fabric parameter, motor diagnostic. |
| 4. Utilities | Cubical–MDP–SDP–machine meter, water, steam, thermal oil, reconciliation. |
| 5. Plant scale | Onboarding bertahap seluruh 138 aset lalu ekspansi menuju ±300 aset. |
| 6. Analytics / AI | Baseline, anomaly detection, recommendation workflow, human approval dan feedback. |

## 13. Data yang perlu dikonfirmasi sebelum build produksi

- PLC/vendor/protocol/IP dan topology jaringan masing-masing area.
- Tag list aktual, data type, unit, scale, update rate, alarm limit, serta owner tiap tag.
- Nomor fisik mesin dan subtype; jumlah winch Jetflow dan chamber Dryer.
- Formula resmi output, runtime/downtime reason, consumption, dan toleransi PV–SV.
- Single line electrical, hierarchy meter, serta route steam, thermal oil, air, dan chemical.
- Kebijakan retensi, backup, cybersecurity, user role, dan kebutuhan integrasi ERP/CMMS/LIMS.

## 14. Keputusan v1.0

- Backend menggunakan pola edge-to-historian dengan canonical tag registry dan versioned mapping.
- PostgreSQL + TimescaleDB menjadi baseline konseptual untuk relational MES + time-series historian.
- Dashboard hanya membaca API/snapshot; tidak ada akses PLC langsung.
- Batch/process step menjadi context penghubung sensor, alarm, motor, chemical, utility, output, dan quality.
- Detail mapping per tampilan tersedia pada [Tag & Display Mapping Register v1.0](Tag_Display_Mapping_Register_v1.0.md) dan harus menjadi basis commissioning aktual.
