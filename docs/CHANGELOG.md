# Changelog Dokumentasi SCADA / MES

Dokumen ini mencatat perubahan seluruh dokumentasi konsep project. Versi lama tetap dipertahankan sebagai histori dan tidak ditimpa.

---

## Frontend Dashboard V1.33 / Kalender Concept V1.6 / Dashboard Concept V1.12 — 15 Agustus 2026

**Status:** Analisa Motor & Drive Equipment Kalender selesai

### Ditambahkan

- Klik motor untuk analisa equipment individual.
- Pemisahan Live Now, Selected Range, historical trend, dan maintenance target plan.
- Trend dengan pan/drag navigator serta pilihan RMS Amp, Voltage, dan kW.
- Maintenance recommendation read-only.

### Batasan

- Data drive, runtime, dan maintenance masih simulated.

---

## Frontend Dashboard V1.32 / Chemical Dispensing Calator Concept V1.2 / Dashboard Concept V1.11 — 15 Agustus 2026

**Status:** Chemical Dispensing Calator transaction workspace selesai

### Ditambahkan

- Log transaksi request–weighing–transfer dalam bentuk tabel.
- Filter waktu, varian, mode Manual/Automatic, dan status.
- Chemical Variant Summary dalam format tabel.

### Dihapus

- Batch trend dan batch abnormality workspace dari detail Chemical Dispensing Calator.

### Batasan

- Data transaction masih simulated; Dye Kitchen Jetflow belum termasuk scope halaman ini.

---

## Frontend Dashboard V1.31 / Kalender Concept V1.5 / Dashboard Concept V1.10 — 15 Agustus 2026

**Status:** Layout Live Sensor Measurements Kalender dirapikan

### Diubah

- Grid dua kolom untuk enam kartu sensor Kalender.
- Panel mengikuti kontennya sendiri tanpa area kosong berlebih.
- Label, status, nilai, dan target dipisahkan lebih jelas.

---

## Frontend Dashboard V1.30 / Kalender Concept V1.4 / Dashboard Concept V1.9 — 15 Agustus 2026

**Status:** Kalender production dan delivery context selesai

### Diubah

- Quality Context diganti menjadi Production & Delivery Detail.
- Live container berisi sensor terkait tanpa energy atau data output duplikat.
- Kartu utama menjadi energy, power, progress output, dan completed batches.

### Ditambahkan

- Customer, jenis kain, gramasi, lebar target, expected output, delivery target, dan production progress bar.

### Batasan

- Data MES/order masih simulated.

---

## Frontend Dashboard V1.29 / Kalender Concept V1.3 / Dashboard Concept V1.8 — 15 Agustus 2026

**Status:** Kalender parameter configuration selesai

### Diubah

- Upper / Lower Balance diganti menjadi Parameter Configuration berisi delapan parameter.
- Satuan Loadcell dinormalisasi menjadi kg.
- Live Process menjadi Live Process & Utility tanpa mengulang empat kartu PV utama.

### Ditambahkan

- Total energy consumption, power demand, dancing roller (%), inlet speed, expander overspeed, dan plaiter overspeed.

### Batasan

- Configuration dan utility masih simulated.

---

## Frontend Dashboard V1.28 / Jetflow Concept V1.6 / Dashboard Concept V1.7 — 15 Agustus 2026

**Status:** Global process checklist pada batch trend Jetflow selesai

### Ditambahkan

- Filter checkbox untuk seluruh process Jetflow.
- Process band yang konsisten pada semua chart sensor aktif.
- Tombol All On dan All Off untuk process filter.
- Marker SV hanya untuk sensor dan process yang relevan.

### Batasan

- Pilihan filter dan data program masih simulated di frontend.

---

## Frontend Dashboard V1.27 / Jetflow Concept V1.5 / Dashboard Concept V1.6 — 15 Agustus 2026

**Status:** Recipe program overlay untuk investigasi batch Jetflow selesai

### Ditambahkan

- Area process step relevan pada trend PV/SV Jetflow.
- Marker vertikal dan label nilai untuk perubahan SV recipe.
- Ringkasan step, interval waktu, serta perubahan setpoint per sensor.
- Profile SV bertahap dan respons PV simulasi agar pembacaan ramp/cooling dapat diuji.
- Dokumentasi Jetflow v1.5, Dashboard v1.6, dan release frontend v1.27.

### Batasan

- Event recipe, setpoint, timestamp, dan historian PV masih simulated.
- Achievement rule berdasarkan tolerance dan hold time belum tersambung.

---

## Frontend Dashboard V1.26 / Dashboard Concept V1.5 — 15 Agustus 2026

**Status:** Primary utility KPI treatment selesai

### Diubah

- Inner container abu-abu pada Current Utility Usage dan Total Utility Consumption dihapus.
- Nilai utility menggunakan ukuran serta kontras yang lebih kuat.
- Pemisah antarutility menggunakan garis aksen tipis tanpa bentuk sub-card.
- Warning Steam tetap dipertahankan melalui warna status.

### Batasan

- Nilai utility masih simulated.

---

## Frontend Dashboard V1.25 / Dashboard Concept V1.4 — 15 Agustus 2026

**Status:** Declarative Plant Operations Summary selesai

### Diubah

- Management Question Center menjadi Plant Operations Summary.
- Tujuh judul kartu pertanyaan menjadi label operasional deklaratif.
- Struktur data, scope, time range, tabel mesin, dan drill-down tetap dipertahankan.

### Batasan

- Data dashboard masih simulated.

---

## Frontend Dashboard V1.24 / Dashboard Concept V1.3 — 15 Agustus 2026

**Status:** Plant Management Question Center selesai

### Ditambahkan

- Tujuh kartu jawaban utama untuk machine state, output, utility, dan batch.
- Tabel scrollable Mesin Running Sekarang.
- Tabel scrollable Stop / Maintenance / Problem.
- Breakdown utility live dan total consumption dengan satuan masing-masing.
- Active batch unik dan completed batch selected range.
- Pemilih 1H, 8H, 24H, dan 7D pada Management Question Center.
- Navigasi baris status menuju detail mesin.

### Aturan Scope

- Machine state, active batch, dan utility condition menggunakan Live Now.
- Output, completed batch, dan total utility consumption menggunakan Selected Range.

### Batasan

- Data masih simulated; maintenance aktual belum terhubung ke CMMS.

---

## Frontend Dashboard V1.23 / Plant Utility Concept V1.1 — 15 Agustus 2026

**Status:** Machine power meter area-to-machine drill-down selesai

### Ditambahkan

- Panel Machine Electrical Consumption pada Utilities.
- Pie energi per area/lane untuk kelompok Jetflow, Calator, Dryer, Kalender, dan Dispensing.
- Ranking power meter mesin yang mengikuti area terpilih.
- Detail energy, actual demand, load, power factor, voltage, dan meter data status.
- Navigasi dari meter terpilih menuju detail mesin.

### Dipertahankan

- Mapping pie Electrical Cubical, MDP, dan SDP tetap menjadi layer distribusi upstream.

### Batasan

- Nilai meter dan design coverage masih simulated; mapping commissioning aktual belum tersedia.

---

## Frontend Dashboard V1.22 / Dashboard Concept V1.2 — 15 Agustus 2026

**Status:** Full-width Recent Batches table selesai

### Diubah

- Tabel Recent Batches menggunakan seluruh lebar card Batch Historian Lookup.
- Informasi lookup dan form pencarian menjadi header di atas tabel.
- Proporsi Batch No., Start, End, Status, dan Action dirapikan.
- Layout yang sama diterapkan pada seluruh detail jenis mesin.

### Dipertahankan

- Vertical scroll, sticky header, pemuatan batch, dan horizontal scroll pada layar kecil.

### Batasan

- Data recent batch masih simulated.

---

## Frontend Dashboard V1.21 / Kalender Concept V1.2 — 15 Agustus 2026

**Status:** Empat kartu PV/SV utama Kalender selesai

### Diubah

- Kartu utama Kalender menjadi Loadcell Upper, Loadcell Lower, Temperature Upper, dan Temperature Lower.
- PV ditampilkan sebagai angka utama dan SV ditampilkan pada keterangan setiap kartu.
- Jumlah kartu tetap empat.

### Dipertahankan

- Overfeed dan Fabric Width tetap tersedia pada monitoring lanjutan dan investigasi batch.

### Batasan

- PV dan SV masih simulated dan belum berasal dari PLC.

---

## Frontend Dashboard V1.20 / Jetflow Concept V1.4 — 15 Agustus 2026

**Status:** Process start dan end time selesai

### Ditambahkan

- Kolom Start Time dan End Time pada tabel sequence Jetflow.
- Timestamp `HH:mm:ss` untuk proses yang telah mulai atau selesai.
- End Time `In progress` untuk current process dan tanda `—` untuk proses pending.

### Batasan

- Waktu frontend masih simulated dan belum terhubung dengan event sequence PLC.

---

## Frontend Dashboard V1.19 / Jetflow Concept V1.3 — 15 Agustus 2026

**Status:** Compact process sequence table selesai

### Diubah

- Kartu process sequence Jetflow diganti menjadi tabel ringkas berisi Step, Process, dan Status.
- Tinggi daftar dibuat tetap dengan vertical scroll agar sequence hingga sekitar 100 step tidak memakan ruang halaman.
- Header tabel tetap terlihat selama daftar digulir.
- Current Process, Complete, dan Pending tetap memiliki indikator visual tersendiri.
- Layar sempit dapat menggulir tabel secara horizontal.

### Batasan

- Frontend masih menggunakan 12 step simulated; recipe aktual belum terhubung ke PLC.

---

## Frontend Dashboard V1.18 / Jetflow Concept V1.2 — 15 Agustus 2026

**Status:** Jetflow water totalizer dan process sequence selesai

### Ditambahkan

- Current Process Jetflow dengan sequence 12 tahap.
- Visual step Complete, Current, dan Pending pada detail mesin.
- Dokumentasi konsep Jetflow V1.2.

### Diubah

- KPI Water Flow Jetflow menjadi Total Water Consumption.
- KPI Water Level pada detail Jetflow menjadi Current Process.
- Overview, donut per Lane, ranking mesin, dan detail menggunakan total konsumsi dalam `m³`.

### Dipertahankan

- Flow meter dan water level tetap tersedia sebagai sensor teknis untuk historian dan investigasi batch.

### Batasan

- Nilai frontend dan sequence masih simulated.

---

## Frontend Dashboard V1.17 — 15 Agustus 2026

**Status:** Scrollable recent batch table selesai

### Ditambahkan

- Tabel recent batch dengan kolom Batch No., Start, End, Status, dan Action.
- Vertical scroll, sticky header, serta horizontal scroll untuk layar sempit.
- Highlight Loaded pada batch aktif.

### Diubah

- Recent batch shortcut buttons diganti menjadi tabel berisi 18 data contoh per mesin.

### Batasan

- Recent batch masih simulated dan belum memiliki pagination atau server-side filter.

---

## Frontend Dashboard V1.16 — 14 Agustus 2026

**Status:** Standard chemical usage bar chart selesai

### Diubah

- Daily Usage by Variant menjadi standard full-width bar chart.
- Ditambahkan baseline nol, sumbu kilogram, gridline, dan nilai pada setiap batang.
- Transfer Route dipisahkan dari layout dua kolom agar grafik chemical menggunakan lebar penuh.

### Batasan

- Data chemical masih simulated dan belum mendukung drill-down transaksi per batang.

---

## Frontend Dashboard V1.15 — 14 Agustus 2026

**Status:** Standard production bar chart selesai

### Diubah

- Grafik Production Output menjadi bar chart standar full-width.
- Batang dibuat solid, lebih lebar, dan dimulai dari baseline nol.
- Ditambahkan skala sumbu Y, unit meter, serta gridline horizontal yang jelas.
- Tinggi grafik ditambah untuk meningkatkan keterbacaan.

### Batasan

- Nilai output masih simulated dan belum memiliki tooltip atau drill-down.

---

## Frontend Dashboard V1.14 — 14 Agustus 2026

**Status:** Batch-scoped sensor investigation selesai

### Ditambahkan

- Pencarian nomor batch pada detail Jetflow, Calator, Dryer, Kalender, dan Chemical Dispensing.
- Recent batch shortcuts, Batch Loaded context, dan fungsi Clear.
- Chemical Dispensing abnormality log.

### Diubah

- Trend SV/PV dan abnormality log hanya muncul setelah batch dipilih.
- Trend dan log menggunakan satu nomor batch yang sama.
- Workspace investigasi batch ditempatkan setelah seluruh nilai dan panel live.

### Batasan

- Lookup batch, trend, dan log masih simulated serta belum terhubung ke MES/historian aktual.

---

## Frontend Dashboard V1.13 — 14 Agustus 2026

**Status:** Live dan historical Plant Overview dipisahkan

### Ditambahkan

- Label bagian Live Now dan Selected Range pada Plant Overview.
- KPI historical Water Consumption, Energy Consumption, Total Machine Runtime, dan Machine Downtime.

### Diubah

- Seluruh kartu dan panel live ditempatkan sebelum data historical.
- Good Production Output dipindahkan dari KPI live ke KPI Selected Range.
- Pemilih 1H, 8H, 24H, dan 7D ditempatkan pada header historical.
- Utility Snapshot hanya menampilkan nilai aktual dan status koneksi.

### Batasan

- KPI historical masih simulated dan belum terhubung ke meter serta counter aktual.

---

## Frontend Dashboard V1.12 — 14 Agustus 2026

**Status:** Production output bar trend selesai

### Ditambahkan

- Grafik batang good production output pada Plant Overview.
- Total, average, dan peak production output per interval.
- Dataset interval untuk range 1H, 8H, 24H, dan 7D.

### Diubah

- Trend garis Actual versus Target menjadi batang output aktual per interval.
- KPI Active Output menjadi Good Production Output dan mengikuti time range.

### Batasan

- Seluruh nilai output masih simulated dan belum terhubung ke counter aktual mesin.

---

## Frontend Dashboard V1.11 — 14 Agustus 2026

**Status:** Plant water consumption card diperbarui

### Diubah

- Kartu Water Flow pada Plant Overview menjadi Water Consumption.
- Unit `m³/h` diganti menjadi total penggunaan `m³` seluruh mesin pada shift berjalan.

### Batasan

- Total konsumsi masih simulated.

---

## Frontend Dashboard V1.10 — 14 Agustus 2026

**Status:** Production abnormality log selesai

### Ditambahkan

- Tabel abnormal proses pada detail Jetflow, Calator, Dryer, dan Kalender.
- Waktu mulai/selesai, batch, parameter, SV, worst PV, deviation, duration, impact, dan recovery status.
- Summary event dan filter periode 1H, 8H, 24H, serta 7D.

### Diubah

- Chart proses lama diganti menjadi Production Abnormality Log.
- Panel SV/PV per sensor tetap dipertahankan sebagai alat investigasi visual.

### Batasan

- Seluruh abnormal event masih simulated dan export belum aktif.

---

## Frontend Dashboard V1.9 — 14 Agustus 2026

**Status:** Machine sensor SV/PV comparison selesai

### Ditambahkan

- Panel Sensor SV/PV Comparison pada seluruh detail mesin.
- Checkbox ON/OFF per sensor serta tombol All On dan All Off.
- Mini-trend per sensor dengan PV solid dan SV dashed.
- Current PV, SV, deviation, unit, serta tag sensor.
- Pilihan range 1H, 8H, dan 24H.

### Diubah

- Sensor dengan engineering unit berbeda menggunakan chart dan skala terpisah.
- Interaksi sensor mempertahankan posisi scroll halaman.

### Batasan

- Series dan tolerance sensor masih simulated.

---

## Frontend Dashboard V1.8 — 14 Agustus 2026

**Status:** In-place dashboard interaction selesai

### Diubah

- Filter consumption donut, legend, resource tab, time range, dan Electrical Distribution mempertahankan posisi scroll.
- Navigasi menuju halaman proses, area, dan mesin tetap membuka halaman dari bagian atas.

---

## Frontend Dashboard V1.7 — 14 Agustus 2026

**Status:** Area-linked machine ranking selesai

### Ditambahkan

- Filter ranking mesin melalui segmen donut atau legend area.
- Active highlight untuk area/lane yang sedang dipilih.
- Scope area dan jumlah mesin pada judul ranking.
- Tombol reset `All Areas` / `All Lanes`.

### Diubah

- Klik area pada consumption donut tidak lagi langsung membuka halaman area.
- Ranking sebelah kanan diperbarui pada overview yang sama.
- Area machine list tetap dibuka melalui card pada bagian Area Status.

### Batasan

- Ranking masih menggunakan simulated consumption data.

---

## Frontend Dashboard V1.6 — 14 Agustus 2026

**Status:** Electrical Distribution mapping selesai

### Ditambahkan

- Dropdown level Electrical Cubical, MDP, dan SDP.
- Pie chart perbandingan demand untuk 3 Cubical, 6 MDP, dan 17 SDP.
- Pemilihan equipment melalui dropdown, segmen pie, atau legend.
- Panel detail demand, peak, load, power factor, voltage, energy, status data, upstream, dan downstream.
- Legend scroll untuk kelompok SDP dan layout responsive.

### Diubah

- Hierarchy tree Electrical Distribution diganti menjadi visual pie chart dengan detail di samping.
- Electrical Distribution menjadi panel full-width pada halaman Utilities.

### Batasan

- Mapping dan seluruh nilai electrical masih simulated.
- Belum terhubung ke meter, single-line diagram, atau tag aktual.

---

## Frontend Dashboard V1.5 — 14 Agustus 2026

**Status:** Pembaruan identitas dashboard selesai

### Diubah

- Nama produk menjadi `PT.SMM Smart Manufacturing Dashboard`.
- Brand sidebar, browser title, dan metadata description diperbarui.
- Identitas package dan pesan build diselaraskan dengan nama produk baru.

### Dihapus

- Identitas `PulseGrid Textile Operations` dari frontend aktif.

---

## Frontend Dashboard V1.4 — 14 Agustus 2026

**Status:** Management cockpit dan consumption drill-down selesai

### Ditambahkan

- Pemisahan KPI `Live Now` dan `Selected Range` pada overview Jetflow, Calator, Dryer, Kalender, dan Dispensing.
- KPI runtime, unplanned downtime, output, dan konsumsi resource yang mengikuti time range.
- Donut konsumsi per lane/area dengan segmen dan legenda interaktif.
- Pemilihan resource spesifik proses: water, energy, steam, thermal, atau chemical.
- Top five machine consumers dan ranking mesin dalam area.
- Unplanned downtime Pareto serta meter coverage indicator.
- Direct drill-down dari ranking overview menuju detail mesin.

### Diubah

- Area machine list sekarang diurutkan berdasarkan konsumsi resource terpilih.
- Area card menampilkan agregat konsumsi untuk time range terpilih.
- Direct machine navigation otomatis mempertahankan konteks area.

### Batasan

- Seluruh nilai management cockpit masih simulated.
- Belum terhubung ke historian, meter aktual, production order, atau cost model.

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
