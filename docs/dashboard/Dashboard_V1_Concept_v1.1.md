# Konsep Dashboard V1 — Real-Time dan Historical Monitoring

**Versi:** 1.1  
**Status:** Konsep dashboard diperbarui dengan multi-speed Calator  
**Tanggal:** 14 Agustus 2026  
**Fokus:** Data collection, real-time monitoring, historical monitoring, alarm, dan data quality  
**Mode awal:** Read-only  
**Target skala arsitektur:** Hingga kurang lebih 300 mesin  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`

---

## Ringkasan Update v1.1

Versi ini mempertahankan seluruh konsep Dashboard V1.0 dan memperbarui halaman Calator dengan:

- Template speed Calator umum.
- Template speed khusus Calator Bianco.
- Multi-speed panel dari Feeding sampai Plaiter.
- Overfeed In dan Overfeed Out matrix untuk Bianco.
- Overfeed Out dan dancing roller sebagai primary monitoring.
- Speed synchronization dan ratio monitoring.
- Configuration-driven layout per machine subtype.

---

## 1. Ringkasan

Dashboard V1 merupakan tahap pertama dari pembangunan platform SCADA / MES pabrik tekstil. Tujuan versi ini bukan langsung melakukan optimisasi atau memberikan kontrol ke mesin, melainkan membangun lapisan visibilitas operasional dan pengumpulan data yang dapat dipercaya.

Dashboard V1 harus mampu menunjukkan:

- Kondisi mesin saat ini.
- Sensor dan parameter proses secara real-time.
- Trend historis sensor.
- Status motor, pump, mixer, valve, dan equipment.
- Alarm dan event beserta timeline.
- Kondisi utilitas pabrik.
- Penggunaan listrik, air, steam, thermal oil, dan chemical.
- Data yang sehat, terlambat, tidak valid, atau terputus.
- Hubungan awal antara mesin, batch, recipe, dan process run jika identitas produksi tersedia.

Dashboard ini menjadi pondasi data untuk tahap selanjutnya seperti batch traceability penuh, quality correlation, root-cause analysis, predictive maintenance, AI recommendation, dan optimisasi mesin.

---

## 2. Tujuan Dashboard V1

### 2.1 Data collection

- Menghubungkan PLC, controller, energy meter, utility system, dan dispensing system.
- Mengumpulkan time-series, state, alarm, event, dan totalizer.
- Menyimpan timestamp, unit, dan data quality.
- Menjaga data ketika koneksi terputus melalui buffering jika infrastructure mendukung.
- Menyediakan historian yang dapat dicari kembali.

### 2.2 Real-time monitoring

- Menampilkan machine state dan communication health.
- Menampilkan nilai aktual serta setpoint.
- Menampilkan alarm aktif.
- Menampilkan perubahan sensor dalam trend jangka pendek.
- Memungkinkan drill-down dari plant sampai equipment.

### 2.3 Historical monitoring

- Memilih machine, tag, dan rentang waktu.
- Membandingkan actual dengan setpoint.
- Menampilkan alarm, state change, dan event pada timeline.
- Membandingkan beberapa periode atau machine.
- Menyediakan export terkontrol jika diperlukan.

### 2.4 Operational trust

- Menampilkan data quality, last update, dan communication status.
- Membedakan mesin berhenti dari data yang terputus.
- Mencatat perubahan konfigurasi.
- Menggunakan definisi status, warna, satuan, dan waktu yang konsisten.

---

## 3. Prinsip Desain V1

### 3.1 Read-only first

Dashboard hanya membaca dan menampilkan data. Tidak ada tombol untuk mengubah setpoint, menjalankan motor, membuka valve, mengontrol boiler, atau mengirim command ke PLC.

### 3.2 Plant-to-sensor drill-down

User dapat bergerak melalui hierarchy:

**Plant → Area → Machine Type → Machine → Equipment → Sensor / Tag**

### 3.3 Real-time tidak berarti semua data ditampilkan sekaligus

Plant overview hanya menampilkan informasi penting. Tag detail dimuat ketika user membuka machine atau equipment tertentu. Pendekatan ini penting untuk menjaga dashboard tetap terbaca ketika jumlah mesin mencapai ratusan.

### 3.4 Data quality selalu terlihat

Setiap nilai real-time minimal memiliki:

- Nilai.
- Unit.
- Timestamp terakhir.
- Status quality.
- Status source connection.

### 3.5 Context before analytics

Sensor perlu dikaitkan dengan machine, equipment, state, dan process run. Data tanpa context tidak cukup untuk analisis lanjutan.

### 3.6 Alarm bukan dekorasi

Warna merah atau amber hanya digunakan untuk kondisi yang benar-benar membutuhkan perhatian. Data normal tidak dibuat terlalu ramai.

### 3.7 Configuration-driven dashboard

Jumlah winch Jetflow, jumlah chamber Dryer, jumlah machine, dan daftar sensor dapat berbeda. Halaman harus dibangun dari asset configuration, bukan layout hard-coded untuk satu mesin.

---

## 4. Scope Dashboard V1

### 4.1 Termasuk dalam V1

- Asset dan equipment registry.
- Tag registry dan metadata.
- Data acquisition dan historian.
- Plant overview.
- Machine fleet overview.
- Machine detail real-time.
- Historical trend explorer.
- Alarm dan event viewer.
- Utility monitoring.
- Chemical dispensing monitoring.
- Communication dan data quality monitoring.
- Basic production context jika batch atau process run tersedia.
- Basic report dan export sesuai hak akses.
- User role dan audit konfigurasi.

### 4.2 Belum termasuk dalam V1

- Write-back atau remote control mesin.
- Automatic setpoint optimization.
- Full production scheduling.
- Full electronic batch record workflow.
- Full quality management workflow.
- Automatic root-cause conclusion.
- Predictive maintenance model.
- AI recommendation.
- Closed-loop optimization.
- ERP atau CMMS integration lengkap, kecuali interface minimum yang disepakati.

V1 tetap menyiapkan struktur data agar fungsi tersebut dapat ditambahkan tanpa membangun ulang pondasi.

---

## 5. Pengguna Utama

| Peran | Kebutuhan V1 |
|---|---|
| Operator | Machine state, parameter proses, alarm aktif, trend singkat |
| Shift leader | Kondisi semua mesin, downtime, output, dan alarm prioritas |
| Process engineer | Historical trend, setpoint-actual comparison, event timeline |
| Maintenance | Motor, pump, equipment status, runtime, fault, dan alarm history |
| Utility team | Electrical, water, steam, thermal oil, dan utility alarm |
| Production | Machine availability, run status, progress, dan output |
| Quality | Riwayat parameter yang terkait dengan roll atau batch |
| OT / Automation | PLC connection, tag quality, update rate, gateway health |
| Management | KPI operasional tingkat tinggi dan exception summary |
| Administrator | Asset, tag, user role, dan configuration audit |

---

## 6. Information Architecture

Navigasi utama yang disarankan:

1. **Overview**
   - Plant Overview.
   - Area Overview.
   - Process Flow.
2. **Machines**
   - Jetflow.
   - Calator.
   - Dryer.
   - Kalender.
   - Machine types berikutnya.
3. **Utilities**
   - Electrical.
   - Water.
   - Steam Boiler.
   - Thermal Oil Boiler.
4. **Chemical**
   - Dispensing Overview.
   - Transfer Queue.
   - Daily Usage.
5. **Alarms & Events**
   - Active Alarms.
   - Alarm History.
   - Event Timeline.
6. **Trends**
   - Historical Explorer.
   - Saved Views.
   - Comparison.
7. **Data Health**
   - Connection Health.
   - Bad / Stale Tags.
   - Gateway Status.
8. **Configuration**
   - Asset Registry.
   - Tag Registry.
   - User dan Role.

---

## 7. Gambaran Layout Utama

Tema menggunakan hybrid light industrial yang sudah dipilih:

- Workspace abu-abu terang.
- Card putih.
- Sidebar charcoal.
- Cyan untuk informasi aktif.
- Hijau untuk normal.
- Amber untuk warning.
- Merah untuk critical.
- Abu-abu untuk offline, unknown, atau inactive.

### 7.1 Desktop shell

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Plant / Area / Page                 Shift     Alarm     User      │
├─────────┼───────────────────────────────────────────────────────────────────┤
│ Overview│ Page title                         Last sync / Live indicator     │
│ Machines│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                     │
│ Utility │ │ KPI 01 │ │ KPI 02 │ │ KPI 03 │ │ KPI 04 │                     │
│ Chemical│ └────────┘ └────────┘ └────────┘ └────────┘                     │
│ Alarms  │ ┌────────────────────────────┐ ┌──────────────────────────────┐  │
│ Trends  │ │ Main real-time visualization│ │ Alarm / machine status       │  │
│ Health  │ │ or process flow             │ │                              │  │
│ Config  │ └────────────────────────────┘ └──────────────────────────────┘  │
│         │ ┌─────────────────────────────────────────────────────────────┐  │
│         │ │ Detail table / event timeline / historical trend           │  │
│         │ └─────────────────────────────────────────────────────────────┘  │
└─────────┴───────────────────────────────────────────────────────────────────┘
```

### 7.2 Global behavior

- Sidebar menentukan domain.
- Topbar menunjukkan location context, shift, waktu, alarm, dan user.
- Breadcrumb menunjukkan hierarchy saat ini.
- Filter mempertahankan area, machine, dan time range selama navigasi relevan.
- Live mode dan historical mode dibedakan jelas.
- Critical alarm tetap terlihat ketika user berpindah halaman.

---

## 8. Plant Overview

Plant Overview menjadi halaman pertama setelah login.

### 8.1 KPI utama

- Machines running.
- Machines idle.
- Machines fault.
- Machines offline atau communication loss.
- Active critical alarm.
- Current electrical demand.
- Steam boiler status.
- Thermal oil boiler status.
- Water consumption hari ini.
- Chemical usage hari ini.

KPI produksi seperti output dan batch progress ditampilkan jika data production context tersedia.

### 8.2 Process flow

```text
JETFLOW                  CALATOR                 DRYER                  KALENDER
Pencelupan       →       Pencucian       →      Pengeringan     →      Finishing
Batch / Recipe           Chemical / Speed       Speed / Chamber        Load / Temp
Temp / Level             Output                 Temperature            Overfeed / Width
```

Setiap blok menunjukkan:

- Jumlah running, idle, fault, dan offline.
- Alarm tertinggi.
- Machine yang memerlukan perhatian.
- Link ke fleet view.

### 8.3 Plant exception list

Daripada menampilkan semua tag, overview menampilkan exception:

- Critical alarm.
- Mesin kehilangan komunikasi.
- Parameter di luar tolerance.
- Utility constraint.
- Dispensing transfer gagal.
- Sensor bad atau stale.

---

## 9. Area dan Machine Fleet Overview

Fleet view menampilkan semua mesin dari satu jenis.

### 9.1 Card atau table mode

User dapat memilih:

- Card mode untuk visual status cepat.
- Table mode untuk jumlah mesin besar dan perbandingan.

### 9.2 Informasi setiap machine

- Machine ID dan name.
- State.
- Communication health.
- Batch atau process run aktif jika tersedia.
- Recipe atau setup aktif.
- Parameter penting per machine type.
- Active alarm count.
- Runtime atau progress.
- Last update.

### 9.3 Sorting dan filtering

- State.
- Alarm severity.
- Communication status.
- Area.
- Machine type.
- Batch atau recipe.
- Parameter deviation.

Default sorting menempatkan critical dan fault paling atas.

---

## 10. Machine Detail — Struktur Umum

Setiap machine detail menggunakan struktur konsisten:

### Header

- Machine name dan ID.
- State dan communication status.
- Batch, roll, atau process run.
- Recipe atau setup.
- Operator dan shift jika tersedia.
- Start time dan elapsed time.

### Real-time process panel

- Nilai utama.
- Setpoint versus actual.
- Mini-trend 15–60 menit.
- Data quality.

### Equipment panel

- Hierarchy equipment.
- Run, stop, ready, fault.
- Motor atau drive data jika tersedia.
- Alarm count.

### Timeline panel

- Machine state.
- Alarm.
- Operator action jika tersedia.
- Recipe step atau process phase.
- Communication event.

### Historical shortcut

- Last hour.
- Current shift.
- Last process run.
- Custom range.
- Compare previous run.

---

## 11. Jetflow Dashboard V1

Referensi aktif: `Machine_Concept_Jetflow_v1.1.md`.

### 11.1 Ringkasan real-time

- Batch, recipe, version, dan nomor warna.
- Active recipe step.
- Main tank temperature.
- Main tank water level.
- Flow meter.
- Dosing Tank 1 temperature dan level.
- Dosing Tank 2 temperature dan level.
- Steam atau heating status.
- Drain atau WWTP context jika tersedia.

### 11.2 Dynamic winch panel

Jumlah winch mengikuti konfigurasi setiap mesin, antara 2 sampai 8.

Setiap Winch n menampilkan:

- Winch motor run dan fault.
- Speed atau current jika tersedia.
- Limit tangle state.
- Alarm.

Dashboard tidak menampilkan Winch 3–8 pada mesin yang hanya memiliki dua winch.

### 11.3 Equipment panel

- Main pump.
- Circulation.
- Dosing Pump 1 dan 2.
- Mixer 1 dan 2.
- Winch Motor 1–n.

### 11.4 Historical template

- Main tank temperature actual versus recipe target.
- Main tank level.
- Flow.
- Dosing tank temperature dan level.
- Winch state dan limit tangle events.
- Pump dan mixer events.
- Steam context.
- Alarm timeline.

---

## 12. Calator Dashboard V1

Referensi aktif: Machine_Concept_Calator_v1.1.md.

### 12.1 Ringkasan real-time

- Roll, batch, dan Jetflow source.
- Recipe pencucian.
- Chemical atau softener.
- Machine subtype: Standard Calator atau Bianco.
- Current process state.
- Output counter.
- Dispensing request atau transfer status jika tersedia.

Primary process cards:

- Overfeed Out.
- Dancing roller.
- Output.
- Active speed mismatch.
- Alarm.

### 12.2 Calator umum — multi-speed panel

**Feeding → Squeezing 1 → Squeezing 2 → Overfeed Atas/Bawah → Folder → Plaiter**

Setiap speed point menampilkan:

- Setpoint jika tersedia.
- Actual.
- Deviation.
- State dan data quality.
- Mini-trend.
- Alarm.

### 12.3 Calator Bianco — speed matrix

Alur konseptual:

**Overfeed In Bawah 1–2 dan Atas 3–4 → Feeding TBD → Squeezing 1–2 → Overfeed Out Bawah 1–2 dan Atas 3–4 → Folder → Plaiter**

Jumlah Speed Feeding Bianco mengikuti configuration dan belum ditetapkan.

Matrix menampilkan:

- Actual dan setpoint per channel.
- Upper-lower balance.
- Channel spread.
- Deviation.
- Data quality.
- Fault atau synchronization warning.

### 12.4 Overfeed Out dan dancing roller

Panel utama menampilkan:

- Overfeed Out per channel.
- Average dan spread.
- Balance atas-bawah.
- Dancing roller position atau measurement.
- Distance to limit.
- Stability atau oscillation indication.
- Trend gabungan Overfeed Out, dancing roller, Folder, dan Plaiter.

### 12.5 Speed synchronization

Dashboard menghitung dan menampilkan ratio atau difference untuk pasangan yang dikonfigurasi:

- Feeding terhadap Squeezing 1.
- Squeezing 1 terhadap Squeezing 2.
- Overfeed In terhadap Overfeed Out.
- Overfeed Out terhadap Folder.
- Folder terhadap Plaiter.
- Channel bawah terhadap atas.

Limit final mengikuti recipe dan engineering configuration.

### 12.6 Historical template

- Semua speed channel sesuai machine subtype.
- Overfeed In dan Out matrix history untuk Bianco.
- Overfeed Out serta dancing roller trend.
- Speed ratio dan synchronization event.
- Slowdown dan stop timeline.
- Chemical target versus actual.
- Output accumulation.
- Alarm dan event.
- QC result jika tersedia.

### 12.7 Consumption summary

- Chemical per process run.
- Water per process run jika tersedia.
- Electrical energy per process run.
- Consumption intensity terhadap output.

---

## 13. Dryer Dashboard V1

Referensi: `Machine_Concept_Dryer_v1.0.md`.

### 13.1 Ringkasan real-time

- Roll, batch, dan Calator source.
- Dryer setup.
- Speed setpoint dan actual.
- Output counter.
- Chamber ready count.
- Alarm dan process state.

### 13.2 Chamber heatmap

Setiap chamber menjadi asset dinamis.

```text
CH-01      CH-02      CH-03      CH-04      ...      CH-n
Actual     Actual     Actual     Actual              Actual
Setpoint   Setpoint   Setpoint   Setpoint            Setpoint
Δ Temp     Δ Temp     Δ Temp     Δ Temp              Δ Temp
Status     Status     Status     Status               Status
```

Jumlah chamber mengikuti konfigurasi Dryer.

### 13.3 Historical template

- Speed actual versus setpoint.
- Temperature actual versus setpoint per chamber.
- Chamber deviation heatmap terhadap waktu.
- Stop, slowdown, dan alarm.
- Thermal oil boiler context.
- Moisture inlet atau outlet jika tersedia.
- Output accumulation.

---

## 14. Kalender Dashboard V1

Referensi aktif: `Machine_Concept_Kalender_v1.1.md`.

### 14.1 Ringkasan real-time

- Roll, batch, dan Dryer source.
- Setup Kalender.
- Loadcell upper dan lower.
- Temperature inlet, upper, dan lower.
- Overfeed.
- Dancing roller.
- Fabric width.
- Steam status.
- Output dan process state.

### 14.2 Balance panel

- Upper versus lower loadcell.
- Upper versus lower temperature.
- Expander L versus Expander R.
- Upper Felt versus Lower Felt.
- Fabric width terhadap target.

### 14.3 Motor panel

- Inlet.
- Expander L dan R.
- Upper dan Lower Felt.
- Cooling Belt.
- Conveyor Belt.
- Plaiter.
- Conveyor Table.
- Up Down Table.

### 14.4 Historical template

- Loadcell upper-lower.
- Temperature inlet-upper-lower.
- Overfeed.
- Dancing roller dan fabric width.
- Motor state, speed, current, atau fault jika tersedia.
- Steam context.
- Gramasi, bowing, dan shrinkage jika tersedia.

---

## 15. Utility Dashboard V1

Referensi: `utilities/Plant_Utility_Concept_v1.0.md`.

### 15.1 Electrical overview

- Cubicle utama.
- MDP.
- SDP.
- Machine energy meter.
- Current power dan daily energy.
- Communication status.
- Capacity utilization jika rating tersedia.
- Energy balance dan metering coverage.

### 15.2 Electrical topology

```text
MAIN SUPPLY
   │
   ├── CUBICLE A ── MDP A ── SDP A1 ── Machine 01, 02, 03
   │                         └─ SDP A2 ── Machine 04, 05
   └── CUBICLE B ── MDP B ── SDP B1 ── Machine 06, 07
```

Topology aktual mengikuti single-line diagram.

### 15.3 Water monitoring

- Main dan branch meter jika tersedia.
- Machine water flow.
- Daily total.
- Consumption per batch atau process run.
- Flow saat machine idle sebagai anomaly.

### 15.4 Steam boiler

- Boiler state dan alarm.
- Header pressure dan temperature jika tersedia.
- Steam flow atau production.
- Jetflow dan Kalender demand.
- Consumer yang terdampak jika supply abnormal.

### 15.5 Thermal oil boiler

- Boiler state dan alarm.
- Supply dan return temperature.
- Pump atau circulation status.
- Dryer demand.
- Chamber yang terdampak.

---

## 16. Chemical Dashboard V1

Referensi: `chemicals/Chemical_Dispensing_Transfer_Concept_v1.0.md`.

### 16.1 Operation overview

- Tujuh varian chemical.
- Dispensing machine state.
- Request queue.
- Transfer aktif.
- Source, route, dan destination Calator.
- Target dan actual quantity.
- Alarm dan transfer status.

### 16.2 Daily usage

- Total per varian.
- Total per Calator.
- Target versus actual.
- Usage per batch, recipe, dan output.
- Completed, partial, failed, dan cancelled transaction.

### 16.3 Pipe route view

- Available, reserved, transfer, cleaning, fault, atau maintenance.
- Current chemical.
- Last chemical.
- Destination.
- Valve atau pump status jika tersedia.

---

## 17. Historical Trend Explorer

Historical Trend Explorer menjadi fungsi utama V1.

### 17.1 Selection

- Plant, area, machine, dan equipment.
- Tag atau parameter.
- Rentang waktu.
- Current shift.
- Previous shift.
- Process run atau batch jika tersedia.
- Saved view.

### 17.2 Chart behavior

- Multi-axis hanya jika unit berbeda dan benar-benar diperlukan.
- Actual dan setpoint memakai style berbeda.
- Alarm ditampilkan sebagai marker.
- Machine state ditampilkan sebagai timeline band.
- Bad atau missing data tidak disambungkan seolah valid.
- Zoom dan pan.
- Tooltip dengan timestamp, value, unit, dan quality.
- Aggregation mengikuti range waktu.

### 17.3 Compare mode

- Machine versus machine.
- Current run versus previous run.
- Current shift versus previous shift.
- Golden run versus actual jika baseline tersedia.

### 17.4 Export

Export harus mempertahankan:

- Tag identity.
- Unit.
- Timestamp dan timezone.
- Data quality.
- Query range.
- Aggregation.
- User dan export time.

Hak export dapat dibatasi berdasarkan role.

---

## 18. Alarm dan Event Center

### 18.1 Active alarm view

- Severity.
- Start time dan duration.
- Plant, area, machine, dan equipment.
- Alarm description.
- Current value dan limit jika tersedia.
- Batch atau process run context.
- Acknowledgement status jika terintegrasi.

### 18.2 Alarm history

- Search berdasarkan waktu, machine, equipment, severity, dan alarm type.
- Start, acknowledge, return-to-normal, dan close.
- Duration dan recurrence.
- Event sequence.

### 18.3 Event timeline

Satu timeline menggabungkan:

- Machine state change.
- Alarm.
- Sensor quality change.
- Communication loss dan recovery.
- Recipe step.
- Motor start, stop, dan trip.
- Operator action jika tersedia.

### 18.4 Severity

| Severity | Makna visual |
|---|---|
| Critical | Merah; potensi trip, safety, major quality, atau production impact |
| High | Merah atau amber kuat; membutuhkan respons cepat |
| Medium | Amber; perlu perhatian |
| Low | Biru atau neutral; informational |

Severity final mengikuti alarm philosophy, bukan ditetapkan hanya dari warna UI.

---

## 19. Data Health Center

Data Health Center wajib ada sejak V1 karena monitoring tidak dapat dipercaya tanpa mengetahui kondisi sumber data.

### 19.1 Connection overview

- PLC online dan offline.
- Gateway online dan offline.
- Meter communication.
- Boiler connection.
- Dispensing connection.
- Last successful data time.

### 19.2 Tag health

- Good.
- Bad.
- Uncertain.
- Stale.
- No data.
- Out of physical range.
- Frozen value candidate.

### 19.3 Data quality KPI

- Connection availability.
- Good-data percentage.
- Stale tag count.
- Missing-data duration.
- Unmapped tag count.
- Meter reset atau counter anomaly.

### 19.4 OT engineer view

- Source endpoint.
- Protocol.
- Scan atau update behavior.
- Last value dan timestamp.
- Quality code.
- Error summary.
- Asset mapping.

Credential, password, atau sensitive configuration tidak ditampilkan pada dashboard umum.

---

## 20. Asset dan Tag Registry

### 20.1 Asset registry

Setiap asset menyimpan:

- Asset ID.
- Name dan description.
- Type.
- Parent asset.
- Plant, area, dan location.
- Vendor, model, dan serial jika tersedia.
- Configuration version.
- Active dan commissioning status.

### 20.2 Flexible machine configuration

- Jetflow menyimpan winch count 2–8.
- Dryer menyimpan chamber count.
- Kalender menyimpan sensor dan motor hierarchy.
- Electrical asset menyimpan parent cubicle, MDP, dan SDP.
- Chemical route menyimpan source dan destination.

### 20.3 Tag registry

- Tag ID dan source address.
- Display name.
- Asset dan equipment.
- Measurement type.
- Data type.
- Engineering unit.
- Normal range.
- Alarm limit reference.
- Update atau exception behavior.
- Retention class.
- Data owner.
- Active status.

Tag configuration harus memiliki audit trail.

---

## 21. Data Flow Konseptual

```text
SENSOR / PLC / METER / BOILER / DISPENSING
                    │
                    ▼
             EDGE / GATEWAY
       protocol adapter + local buffer
                    │
                    ▼
             DATA INGESTION
     timestamp + quality + normalization
          ┌─────────┴─────────┐
          ▼                   ▼
    REAL-TIME STREAM      HISTORIAN
          │                   │
          └─────────┬─────────┘
                    ▼
             API / DATA SERVICE
          asset + tag + alarm context
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    LIVE DASHBOARD      HISTORICAL VIEW
```

Pendukung lintas lapisan:

- Asset registry.
- Tag registry.
- User dan role.
- Audit log.
- System monitoring.
- Backup dan recovery.

Teknologi final belum ditetapkan dalam dokumen ini.

---

## 22. Data Classification dan Update Strategy

Tidak semua data membutuhkan frekuensi sama.

| Kelas | Contoh | Perilaku konseptual |
|---|---|---|
| State / event | Run, stop, fault, tangle limit | Disimpan saat berubah |
| Standard process | Temperature, level, speed, loadcell | Periodik atau exception-based |
| Totalizer | Energy, water, chemical | Periodik dan saat process boundary |
| Fast condition | Vibration atau drive data tertentu | Hanya untuk use case yang disetujui |
| Configuration | Setpoint, recipe, asset mapping | Disimpan saat berubah dengan audit |

Update rate, deadband, compression, dan retention ditentukan per tag class setelah survey.

---

## 23. Historical Storage dan Retention

Konsep retention bertingkat:

- Raw atau high-resolution untuk periode operasional yang disepakati.
- Compressed time-series untuk analisis menengah.
- Hourly, shift, dan daily aggregate untuk jangka panjang.
- Alarm dan event history sesuai kebutuhan audit.
- Batch atau process run summary untuk traceability.

Retention final mempertimbangkan:

- Jumlah tag.
- Sampling behavior.
- Kebutuhan root-cause analysis.
- Kebutuhan quality dan audit.
- Storage capacity.
- Backup dan recovery objective.

Data tidak dihapus hanya berdasarkan usia tanpa retention policy yang disetujui.

---

## 24. Scalability hingga 300 Mesin

Prinsip agar dashboard tetap responsif:

- Asset hierarchy dan machine type template.
- Dynamic machine configuration.
- Server-side filtering dan aggregation.
- Lazy loading untuk tag detail.
- Table virtualization untuk daftar besar.
- Tidak subscribe semua tag pada semua halaman.
- Historian query dibatasi range dan resolution.
- Pre-calculated KPI untuk overview.
- Edge buffering dan distributed collection jika diperlukan.
- Health monitoring per connector.

Deployment dimulai dari pilot, tetapi ID, hierarchy, naming, dan data model harus siap untuk scale-out.

---

## 25. Security dan Access Control

### Role concept

- Viewer.
- Operator.
- Supervisor.
- Process Engineer.
- Maintenance.
- Utility Engineer.
- OT Engineer.
- Administrator.

### Prinsip

- Least privilege.
- Read-only untuk machine control.
- Authentication terpusat jika tersedia.
- Session timeout.
- Audit login dan configuration change.
- Network segmentation OT dan IT.
- Dashboard tidak membuka PLC langsung ke user network.
- Export dibatasi berdasarkan role.
- Sensitive configuration disembunyikan.

---

## 26. Non-Functional Requirements Awal

### Reliability

- Communication loss terlihat jelas.
- Local buffer dipertimbangkan.
- Recovery tidak menghasilkan duplicate atau urutan waktu salah.
- Historian memiliki backup.

### Performance

- Overview memuat ringkasan, bukan raw tags.
- Live detail hanya subscribe asset yang sedang dibuka.
- Historical query menggunakan aggregation sesuai rentang waktu.

### Time consistency

- Semua source menggunakan waktu yang sinkron.
- Timezone ditampilkan konsisten.
- Source timestamp dibedakan dari server receive time jika diperlukan.

### Usability

- Status dapat dipahami dalam beberapa detik.
- Warna tidak menjadi satu-satunya pembeda.
- Unit selalu terlihat.
- Tidak ada chart dengan terlalu banyak garis secara default.
- Mobile dapat digunakan untuk overview, tetapi detail engineering diprioritaskan untuk desktop.

### Auditability

- Asset mapping, tag, unit, alarm metadata, dan user role memiliki history perubahan.

---

## 27. Rencana Implementasi Dashboard V1

### DV1-0 — Discovery dan inventory

- Daftar mesin dan ID.
- Asset hierarchy.
- PLC, controller, protocol, dan network.
- Existing tag list.
- Utility topology.
- Alarm inventory.
- Pilih area pilot.

### DV1-1 — Data foundation

- Asset registry.
- Tag registry.
- Connector dan gateway.
- Timestamp serta quality normalization.
- Historian.
- Connection health.

### DV1-2 — Pilot real-time

- Plant overview sederhana.
- Fleet view pilot.
- Machine detail.
- Alarm aktif.
- Data health.

### DV1-3 — Historical monitoring

- Trend explorer.
- Event timeline.
- Saved views.
- Basic compare dan export.

### DV1-4 — Utility dan chemical

- Electrical topology.
- Machine energy.
- Water.
- Steam dan thermal oil boiler.
- Dispensing dan daily chemical usage.

### DV1-5 — Production context

- Batch, roll, recipe, process run, dan output context sesuai data yang tersedia.

### DV1-6 — Validation dan scale-out

- Operator validation.
- Tag quality review.
- Performance test.
- Alarm rationalization.
- Tambahkan machine secara bertahap.

---

## 28. Pilot yang Disarankan

Pilot awal sebaiknya tidak langsung mencakup semua mesin.

Satu pilot representatif dapat mencakup:

- Satu Jetflow dengan asset detail lengkap.
- Satu Calator.
- Satu Dryer dengan semua chamber.
- Satu Kalender.
- Satu jalur cubicle–MDP–SDP–machine meter.
- Satu water meter machine.
- Steam boiler context.
- Thermal oil boiler context.
- Satu dispensing route ke Calator.

Pilot ini menguji seluruh pola data tanpa harus menghubungkan 300 mesin sekaligus.

---

## 29. Acceptance Criteria Dashboard V1

Dashboard V1 dapat dianggap berhasil apabila:

1. Asset hierarchy pilot sesuai kondisi fisik.
2. Setiap tag memiliki identity, unit, timestamp, dan quality.
3. Machine state dapat dibedakan dari communication loss.
4. Real-time value sesuai HMI atau instrument aktual dalam tolerance yang disepakati.
5. Historical trend dapat dibuka kembali untuk periode sebelumnya.
6. Bad, stale, dan missing data terlihat jelas.
7. Alarm dan event memiliki urutan waktu yang dapat dipercaya.
8. Jetflow dynamic winch ditampilkan sesuai jumlah aktual.
9. Calator menggunakan template speed sesuai subtype.
10. Overfeed Out dan dancing roller dapat dimonitor real-time dan historical.
11. Dryer chamber ditampilkan sesuai jumlah aktual.
12. Kalender sensor dan motor hierarchy dapat ditelusuri.
13. Electrical supply path dapat ditelusuri sampai machine meter.
14. Water, steam, dan thermal oil context dapat ditampilkan sesuai instrumentasi.
15. Chemical request dan usage dapat dikaitkan ke Calator.
16. Historical chart dapat membandingkan actual, setpoint, state, dan alarm.
17. Operator, process, maintenance, utility, dan OT menyetujui validitas pilot.
18. Tidak ada write-back atau control command ke mesin.

---

## 30. Keputusan yang Perlu Dibuat Sebelum Coding

- Area dan mesin pilot.
- Daftar user dan role awal.
- Asset naming standard.
- Tag naming dan metadata standard.
- Protocol dan gateway per machine.
- Historian deployment location.
- Target update behavior per tag class.
- Retention policy.
- Alarm severity standard.
- Batch atau process run source.
- Network dan cybersecurity architecture.
- Backup dan recovery requirement.
- Desktop resolution dan perangkat operasional.

---

## 31. Informasi yang Diperlukan untuk Dashboard v1.2

### Plant dan pilot

- Nama area pabrik.
- Jumlah aktual setiap jenis mesin.
- Machine ID yang digunakan saat ini.
- Mesin yang dipilih sebagai pilot.

### PLC dan data source

- Vendor dan model PLC atau controller.
- Protocol komunikasi.
- Existing tag list.
- HMI screenshot atau manual bila tersedia.
- Network topology.

### Operation

- Definisi machine state.
- Shift calendar.
- Batch, roll, recipe, dan output source.
- Alarm list dan priority.

### Infrastruktur

- Server atau deployment preference.
- On-premise, cloud, atau hybrid policy.
- User authentication source.
- Data retention requirement.
- Backup policy.

### Tampilan

- Resolusi monitor control room.
- Bahasa tampilan.
- Informasi yang paling penting bagi operator setiap machine type.
- Kebutuhan mobile atau tablet.

---

## 32. Keputusan Dashboard V1.1

1. Dashboard V1 berfokus pada data collection, real-time, historical, alarm, dan data health.
2. Sistem dimulai read-only.
3. Plant overview menampilkan exception, bukan semua tag.
4. Machine detail menggunakan asset configuration dinamis.
5. Historical Trend Explorer menjadi fungsi utama V1.
6. Data quality selalu ditampilkan bersama nilai.
7. Alarm dan event menggunakan timestamp yang tersinkronisasi.
8. Utility dan chemical termasuk dalam monitoring V1.
9. Basic batch dan recipe context digunakan jika tersedia.
10. Pilot dilakukan sebelum scale-out ke seluruh mesin.
11. Dashboard disiapkan untuk sekitar 300 mesin tanpa subscribe semua tag sekaligus.
12. AI, optimization, dan control tidak termasuk V1.
13. Halaman Calator dibangun dari machine subtype configuration.
14. Overfeed Out dan dancing roller menjadi primary Calator monitoring.
15. Jumlah Speed Feeding Bianco tetap TBD sampai data aktual diberikan.

---

## 33. Batasan Versi Ini

Dokumen ini belum menetapkan teknologi frontend, backend, historian, database, message broker, protocol gateway, server topology, cloud provider, refresh interval, retention duration, alarm limit, atau formula KPI final.

Pemilihan teknologi dilakukan setelah mesin pilot, sumber data, network, security, dan kebutuhan operasional dikonfirmasi.



