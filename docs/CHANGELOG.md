# Changelog Dokumentasi SCADA / MES

Dokumen ini mencatat perubahan seluruh dokumentasi konsep project. Versi lama tetap dipertahankan sebagai histori dan tidak ditimpa.

---

## Frontend Dashboard V1.3 — 14 Agustus 2026

**Status:** Remote display placeholder selesai

### Ditambahkan

- Kotak Remote Display pada detail Jetflow, Calator, Dryer, Kalender, dan Dispensing.
- Machine ID context pada header remote display.
- Status `IP not configured`.
- Layout responsive untuk desktop dan mobile.

### Batasan

- Belum ada koneksi IP, streaming, authentication, atau remote control.
- Viewport masih berupa placeholder kosong.

---

## Frontend Dashboard V1.2 — 14 Agustus 2026

**Status:** Hierarchical process navigation selesai

### Ditambahkan

- Fleet overview sebagai halaman awal tab proses.
- Jetflow Lane A–F serta area Depan, Belakang, dan Timur untuk proses lain.
- Area machine list dengan search dan state filter.
- Breadcrumb process–area–machine.
- Drill-down hingga machine detail.
- Jumlah asset mapping aktual pada sidebar dan Plant Overview.

### Diubah

- Tab proses tidak lagi langsung membuka satu machine detail.
- Machine selector pada halaman detail hanya menampilkan mesin dalam area aktif.
- Chemical/Dispensing menggunakan pola area yang sama.

### Batasan

- Machine state dan process value masih simulated.
- ID konseptual belum menjadi nomor mesin produksi resmi.

---

## Frontend Dashboard V1.1 — 14 Agustus 2026

**Status:** Custom range dan interactive historical trend selesai

### Ditambahkan

- Preset 1H, 8H, 24H, 7D, dan 30D.
- Custom Start Date & Time dan End Date & Time.
- Validasi custom range.
- Drag, touch swipe, mouse wheel, serta keyboard navigation pada trend.
- Timeline navigator yang dapat digeser.
- Zoom in, zoom out, dan Fit Range.
- Label sumbu waktu yang menyesuaikan visible duration.

### Batasan

- Historical series masih menggunakan simulated data.
- Query historian, downsampling server-side, Save View, dan Export CSV belum terhubung.

---

## Plant Machine and Area Mapping v1.1 — 14 Agustus 2026

**Status:** Mapping dispensing ditambahkan

### Ditambahkan

- Satu dispensing Calator di area Depan.
- Dua dispensing Calator di area Belakang.
- Dua dispensing Calator di area Timur.
- Total lima dispensing yang mendukung 18 Calator.
- Usulan ID `DSP-DPN-01`, `DSP-BLK-01`–`02`, dan `DSP-TMR-01`–`02`.
- Rasio jumlah dispensing terhadap Calator per area.

### Diubah

- Total aset mesin terpetakan berubah dari 133 menjadi 138.
- Total tetap dibedakan menjadi 133 mesin proses produksi dan 5 mesin dispensing pendukung.
- Chemical Dispensing and Transfer Concept diperbarui menjadi v1.1.

---

## Chemical Dispensing and Transfer Concept v1.1 — 14 Agustus 2026

**Status:** Topology area dispensing diperbarui

### Ditambahkan

- Jumlah serta lokasi lima mesin dispensing.
- Hubungan awal lima dispensing dengan 18 Calator berdasarkan area.
- Kebutuhan mapping source–route–destination untuk setiap dispensing.

---

## Plant Machine and Area Mapping v1.0 — 14 Agustus 2026

**Status:** Baseline master mapping dibuat

### Ditambahkan

- Enam area Jetflow: Lane A–F.
- 88 Jetflow: Lane A 6, B 18, C 18, D 18, E 13, dan F 15.
- Area Depan: 2 Calator, 7 Kalender, dan 1 Dryer.
- Area Belakang: 9 Calator, 7 Kalender, dan 2 Dryer.
- Area Timur: 7 Calator, 7 Kalender, dan 3 Dryer.
- Rekapitulasi 18 Calator, 21 Kalender, 6 Dryer, dan total 133 mesin produksi terdata.
- Usulan machine ID, asset hierarchy, filter dashboard, dan status onboarding integrasi.

### Catatan

- Penyebutan Lane A–E dinormalisasi menjadi Lane A–F karena daftar aktual mencakup enam lane.
- Nomor mesin aktual, subtype, PLC, protocol, dan integration status masih diperlukan.

---

## Frontend Dashboard V1.0 — 14 Agustus 2026

**Status:** Prototype frontend selesai

### Dibangun

- Responsive SPA frontend dengan hybrid-light industrial theme.
- Plant Overview, process flow, dan active process run.
- Detail monitoring Jetflow, Calator, Dryer, dan Kalender.
- Utility, chemical, alarm, historical trend, dan data health pages.
- Dynamic winch, chamber, Calator subtype, dan Kalender equipment layout.
- Canvas chart, live-value simulation, machine selection, time-range, alarm filter, serta acknowledgement.
- Read-only deployment build.

### Batasan

- Menggunakan simulated data.
- Belum ada PLC, historian, API, authentication, atau write-back.
- KPI, alarm limit, dan tag mapping belum menggunakan data aktual.

---

## Dashboard V1 Concept v1.1 — 14 Agustus 2026

**Status:** Halaman Calator diperbarui

### Ditambahkan

- Multi-speed panel Calator umum.
- Speed matrix khusus Calator Bianco.
- Overfeed In dan Overfeed Out channel view.
- Overfeed Out dan dancing roller sebagai primary cards.
- Speed ratio dan synchronization monitoring.
- Configuration-driven layout berdasarkan machine subtype.

### Diubah

- Referensi aktif Calator diperbarui ke v1.1.
- Acceptance criteria dan keputusan dashboard diperluas.
- Daftar informasi dashboard berikutnya dipindahkan ke v1.2.

---

## Machine Concept: Calator v1.1 — 14 Agustus 2026

**Status:** Multi-speed dan dancing roller ditambahkan

### Ditambahkan

- Speed Feeding, Squeezing 1–2, Overfeed Atas/Bawah, Folder, dan Plaiter untuk Calator umum.
- Template speed khusus Calator Bianco.
- Overfeed In Bawah 1–2 dan Atas 3–4.
- Overfeed Out Bawah 1–2 dan Atas 3–4.
- Dancing roller sebagai critical process parameter.
- Speed synchronization, ratio, equipment hierarchy, alarm, KPI, dan historical template.

### Diubah

- Speed tidak lagi dimodelkan sebagai satu nilai umum.
- Standard Calator dan Bianco menggunakan configuration berbeda.
- Overfeed Out menjadi primary process parameter.
- Informasi update berikutnya dipindahkan ke v1.2.

### Masih diperlukan

- Jumlah Speed Feeding aktual pada Bianco.
- Mapping channel speed terhadap motor, drive, dan roller.
- Existing PLC tag, unit, range, setpoint, actual, serta alarm limit.
- Unit, center reference, range, dan limit dancing roller.
- Reference speed atau counter resmi untuk output.

---

## Dashboard V1 Concept v1.0 — 14 Agustus 2026

**Status:** Baseline konsep dashboard

### Ditambahkan

- Scope Dashboard V1 untuk data collection, real-time, historical, alarm, dan data health.
- Information architecture dan navigasi utama.
- Plant overview, fleet view, machine detail, dan process flow.
- Konsep halaman Jetflow, Calator, Dryer, dan Kalender.
- Utility dan chemical monitoring.
- Historical Trend Explorer dan Alarm/Event Center.
- Data Health Center, Asset Registry, dan Tag Registry.
- Data flow, classification, retention, scalability, security, serta non-functional requirements.
- Wireframe konseptual dan dashboard behavior.
- Tahapan implementasi, pilot scope, dan acceptance criteria.

### Di luar scope V1

- Machine write-back atau remote control.
- AI recommendation dan predictive model.
- Automatic root-cause conclusion.
- Full MES execution, scheduling, dan quality workflow.
- Closed-loop optimization.

### Belum ditetapkan

- Pilot area dan machine ID.
- PLC, protocol, gateway, dan tag list.
- Technology stack dan deployment architecture.
- Update rate, retention, alarm limit, serta KPI formula.

---

## Machine Concept: Kalender v1.1 — 14 Agustus 2026

**Status:** Detail sensor dan motor ditambahkan

### Ditambahkan

- Temperature inlet.
- Dancing roller.
- Fabric width measurement.
- Inlet motor.
- Expander L dan Expander R motor.
- Upper Felt dan Lower Felt motor.
- Cooling Belt dan Conveyor Belt motor.
- Plaiter, Conveyor Table, dan Up Down Table motor.
- Equipment relationship, motor monitoring, balance, dan synchronization concept.

### Diubah

- Temperature analysis mencakup inlet, upper, dan lower.
- Priority data, alarm, root-cause analysis, KPI, dashboard, dan multivariable analysis diperluas.
- Informasi update berikutnya dipindahkan menjadi target v1.2.

### Masih diperlukan

- Existing PLC tag dan alamatnya.
- Unit, range, accuracy, alarm limit, dan calibration sensor.
- Arti serta unit dancing roller measurement.
- Metode dan lokasi fabric width measurement.
- Sinyal motor, drive, interlock, serta synchronization yang tersedia.

---

## Machine Concept: Jetflow v1.1 — 14 Agustus 2026

**Status:** Detail sensor dan motor ditambahkan

### Ditambahkan

- Level air dan flow meter.
- Temperature main tank.
- Temperature Dosing Tank 1 dan Dosing Tank 2.
- Level Dosing Tank 1 dan Dosing Tank 2.
- Limit tangle per winch.
- Dynamic winch model untuk mesin dengan 2 sampai 8 winch.
- Winch motor yang mengikuti jumlah winch aktual.
- Main pump, circulation, Dosing Pump 1–2, dan Mixer 1–2 sebagai equipment terpisah.
- Konsep motor monitoring, equipment relationship, alarm, dan naming.

### Diubah

- Jetflow tidak lagi menggunakan asumsi jumlah winch tetap.
- Sensor dan motor menjadi child asset sesuai konfigurasi setiap mesin.
- Prioritas data, alarm, root-cause context, dan acceptance information diperluas.
- Daftar informasi berikutnya dipindahkan menjadi target v1.2.

### Masih diperlukan

- Winch count aktual untuk setiap Jetflow.
- Existing PLC tag dan alamatnya.
- Unit, range, accuracy, alarm limit, serta calibration sensor.
- Sinyal motor dan drive yang tersedia.
- Lokasi serta fungsi detail flow meter dan circulation equipment.

---

## Chemical Dispensing and Transfer Concept v1.0 — 14 Agustus 2026

**Status:** Baseline konsep chemical processing

### Ditambahkan

- Chemical request dari Calator berdasarkan process run dan recipe.
- Master data untuk tujuh varian chemical.
- Dispensing dan pipe-transfer workflow.
- Source–route–destination traceability.
- Target, dispensed, transferred, received, dan consumed quantity concept.
- Daily usage per chemical variant dan per Calator.
- Consumption intensity terhadap batch, roll, output, dan quality.
- Route conflict, cleaning, cross-contamination, dan safety context.
- Inventory, stock reconciliation, alarm, KPI, dashboard, serta peluang AI.
- Tahapan implementasi dan acceptance criteria pilot chemical transfer.

### Belum ditetapkan

- Nama dan fungsi ketujuh varian.
- Unit, density, compatibility, SDS, dan cleaning requirement.
- P&ID, source tank, pipe route, pump, valve, dan meter.
- Vendor, PLC, protocol, existing tag, dan alarm limit.
- Request, approval, transfer, receipt, retry, dan cancel workflow aktual.
- Inventory source dan metode reporting saat ini.

---

## Plant Utility Concept v1.0 — 14 Agustus 2026

**Status:** Baseline konsep utilitas

### Ditambahkan

- Electrical hierarchy cubicle–MDP–SDP–machine energy meter.
- Main meter sebagai reference dan downstream meter sebagai detail consumption.
- Konsep electrical energy balance dan metering coverage.
- Machine energy monitoring berdasarkan state, batch, recipe, output, dan quality.
- Water monitoring dan water balance per mesin.
- Steam boiler supply untuk Jetflow dan Kalender.
- Thermal oil boiler supply untuk Dryer.
- Utility intensity, peak demand, capacity monitoring, dan cost allocation.
- Alarm, root cause, dashboard, analitik, AI, safety, dan cybersecurity.
- Tahapan implementasi dan acceptance criteria pilot utilitas.

### Belum ditetapkan

- Single-line diagram dan topology aktual.
- Jumlah, kapasitas, vendor, protocol, meter, dan existing tag.
- Electrical rating dan configuration ratio.
- Water distribution.
- Steam serta thermal oil distribution loop.
- Utility tariff, baseline, operating limit, dan alarm setpoint.

---

## Machine Concept: Dryer v1.0 — 14 Agustus 2026

**Status:** Baseline konsep mesin

### Ditambahkan

- Posisi Dryer sebagai proses pengeringan setelah Calator dan sebelum Kalender.
- Traceability handover Calator–Dryer–Kalender.
- Speed sebagai parameter kritis untuk residence time dan output.
- Temperatur setpoint dan actual untuk setiap chamber.
- Konsep temperature profile, chamber imbalance, dan interaksi speed-temperature.
- Konsep output calculation dan positional process mapping.
- Moisture sebagai kandidat parameter quality utama.
- Equipment hierarchy, prioritas data, alarm, KPI, dashboard, dan peluang AI.
- Tahapan implementasi dan acceptance criteria pilot Dryer.

### Belum ditetapkan

- Jumlah dan fungsi chamber aktual.
- Sumber pemanas, airflow, exhaust, dan utility.
- Vendor, model, PLC, protocol, dan existing tag.
- Operating window speed dan temperature.
- Sensor serta target moisture.
- Formula output resmi dan quality limit.

---

## Machine Concept: Kalender v1.0 — 14 Agustus 2026

**Status:** Baseline konsep mesin

### Ditambahkan

- Posisi Kalender sebagai proses finishing setelah Dryer.
- Traceability handover kain semi-kering dari Dryer.
- Upper felt dan lower felt sebagai equipment utama awal.
- Loadcell upper-lower, temperature upper-lower, dan overfeed sebagai parameter kritis.
- Konsep balance upper-lower dan integrasi steam.
- Hubungan parameter proses dengan gramasi, bowing, dan shrinkage.
- Positional quality mapping dan multivariable analysis.
- Equipment hierarchy, prioritas data, alarm, KPI, dashboard, serta peluang AI.
- Tahapan implementasi dan acceptance criteria pilot Kalender.

### Belum ditetapkan

- Konstruksi, sequence, vendor, PLC, protocol, dan existing tag.
- Makna fisik serta unit loadcell.
- Definisi dan formula overfeed.
- Operating window setiap jenis kain.
- Metode dan limit QC gramasi, bowing, dan shrinkage.
- Data Dryer yang tersedia untuk feed-forward analysis.

---

## Machine Concept: Calator v1.0 — 14 Agustus 2026

**Status:** Baseline konsep mesin

### Ditambahkan

- Posisi Calator sebagai proses pencucian setelah Jetflow.
- Traceability handover dari batch Jetflow ke process run Calator.
- Konsep recipe pencucian serta penggunaan softener dan chemical.
- Speed sebagai parameter kritis untuk waktu kontak, penyerapan, dan output.
- Konsep perhitungan output berbasis speed, runtime, dan counter.
- Kandidat sensor, equipment hierarchy, dan prioritas data.
- Alarm, analisis ketidaksesuaian, KPI, dashboard, serta peluang AI.
- Tahapan implementasi dan acceptance criteria pilot Calator.

### Belum ditetapkan

- Sequence dan konstruksi aktual mesin.
- Vendor, model, PLC, protocol, dan existing tag.
- Operating window speed dan formula contact time.
- Metode dosing serta actual chemical consumption.
- Satuan dan formula resmi output produksi.
- Parameter QC setelah Calator.

---

## Machine Concept: Jetflow v1.0 — 14 Agustus 2026

**Status:** Baseline konsep mesin

### Ditambahkan

- Digital thread Jetflow dari batch hingga QC.
- Konsep recipe, nomor warna, chemical, dan planned-versus-actual.
- Temperatur dan level air sebagai parameter kritis awal.
- Hubungan heating dengan steam dan boiler.
- Hubungan drain event dengan WWTP.
- Equipment hierarchy dan prioritas data awal.
- Alarm, root cause analysis, KPI, dashboard, dan peluang AI.
- Tahapan implementasi dan acceptance criteria pilot Jetflow.

### Belum ditetapkan

- Sequence, equipment, tag, serta alarm limit aktual.
- Vendor, model, PLC, dan protokol.
- Detail dosing, instrumentasi boiler, dan WWTP.

---

## v1.0 — 14 Agustus 2026

**Status:** Baseline awal

### Ditambahkan

- Visi sistem SCADA / MES pabrik tekstil.
- Prinsip pengembangan dan keselamatan.
- Konsep digital thread dari customer hingga final QC.
- Model objek customer, material, batch, process, asset, equipment, tag, quality, maintenance, utility, dan AI.
- Ruang lingkup fungsional jangka panjang.
- Konsep data real-time, historis, event, dan metadata tag.
- Arsitektur konseptual berlapis.
- Konsep analisis ketidaksesuaian produksi.
- Konsep equipment health dan maintenance.
- Konsep utility optimization.
- Roadmap pengembangan fase 0 sampai fase 6.
- Usulan cakupan tahap pertama.
- Daftar informasi yang diperlukan untuk versi berikutnya.
- Risiko awal dan arah mitigasi.
- Aturan versioning dokumentasi.

### Keputusan

- Sistem diposisikan sebagai pondasi operasi digital jangka panjang, bukan hanya dashboard.
- Traceability lot, roll, dan batch menjadi inti desain.
- Pengembangan dilakukan modular dan bertahap.
- Implementasi awal menggunakan pendekatan read-only sebelum kemampuan kontrol.
- AI dan optimisasi mesin dikembangkan setelah data foundation tervalidasi.

### Belum ditetapkan

- Detail proses aktual.
- Daftar mesin dan equipment.
- Daftar sensor dan tag.
- Area pilot.
- Teknologi dan protokol integrasi.
- Detail KPI dan formula.
