# Konsep Induk Sistem SCADA / MES Pabrik Tekstil

**Versi:** 1.0  
**Status:** Baseline konseptual awal  
**Tanggal:** 14 Agustus 2026  
**Jenis dokumen:** Visi, ruang lingkup, model operasional, dan arah pengembangan  
**Catatan:** Dokumen ini belum menetapkan detail mesin, sensor, tag, protokol, atau vendor. Detail tersebut akan ditambahkan setelah referensi mesin tersedia.

---

## 1. Ringkasan Eksekutif

Project ini dirancang sebagai pondasi sistem SCADA / MES terintegrasi untuk pabrik tekstil dengan skala hingga kurang lebih 300 mesin dan jumlah sensor atau tag yang sangat besar.

Sistem tidak hanya ditujukan untuk menampilkan kondisi mesin. Sasaran akhirnya adalah membentuk satu aliran data produksi yang utuh, mulai dari identitas kain milik customer, perencanaan batch, perjalanan kain melalui setiap tahapan proses dan mesin, penggunaan utilitas, kondisi equipment, kejadian alarm, inspeksi kualitas, sampai hasil akhir QC.

Setiap material, batch, lot, atau roll kain harus memiliki identitas digital yang dapat ditelusuri sepanjang proses. Data proses tersebut kemudian dihubungkan dengan kondisi aktual mesin dan sub-equipment seperti motor, pompa, fan, bearing, valve, inverter, serta instrumen lainnya. Dengan hubungan tersebut, sistem diharapkan mampu menjawab pertanyaan penting seperti:

- Di mesin dan tahapan mana penyimpangan mulai terjadi?
- Kondisi proses apa yang berubah sebelum output dinyatakan tidak sesuai?
- Alarm atau gejala abnormal apa yang muncul sebelum kegagalan?
- Equipment apa yang paling mungkin berkontribusi terhadap masalah kualitas?
- Kapan equipment harus diperiksa atau dirawat sebelum menyebabkan downtime?
- Apakah konsumsi listrik, steam, air, compressed air, chemical, atau utilitas lain sesuai dengan output yang dihasilkan?
- Rekomendasi operasional apa yang dapat diberikan untuk batch atau produk berikutnya?

Perjalanan pengembangan akan dilakukan bertahap. Tahap awal berfokus pada fondasi data, visibilitas real-time, struktur asset, traceability, dan konsistensi informasi. Setelah fondasi stabil, sistem dapat berkembang menuju analitik penyebab, predictive maintenance, rekomendasi berbasis AI, optimisasi proses, dan pada tahap matang memungkinkan optimisasi langsung ke mesin dengan mekanisme keselamatan serta persetujuan yang terkontrol.

---

## 2. Visi Sistem

Membangun sistem operasi digital pabrik tekstil yang menyatukan manusia, material, mesin, proses, kualitas, maintenance, dan utilitas dalam satu sumber data yang dapat dipercaya.

Sistem ini diharapkan menjadi pusat informasi operasional yang mampu:

1. Menampilkan kondisi pabrik secara real-time.
2. Menelusuri perjalanan setiap kain, roll, lot, dan batch.
3. Menghubungkan hasil produksi dengan parameter proses dan kondisi mesin.
4. Mendeteksi kondisi abnormal sedini mungkin.
5. Membantu tim menemukan akar penyebab penyimpangan.
6. Mengubah maintenance dari reaktif menjadi condition-based dan predictive.
7. Mengoptimalkan penggunaan utilitas terhadap target produksi dan kualitas.
8. Memberikan analisis dan rekomendasi yang dapat dipertanggungjawabkan.
9. Menjadi fondasi integrasi AI dan optimisasi mesin pada tahap lanjutan.

### 2.1 Pernyataan visi singkat

> Satu identitas material, satu perjalanan proses, satu sumber data pabrik, dan satu sistem intelijen untuk mendukung keputusan dari shop floor sampai manajemen.

---

## 3. Prinsip Dasar Pengembangan

### 3.1 Traceability sebagai inti sistem

Semua informasi proses harus dapat dikaitkan kembali ke identitas produksi yang jelas, misalnya customer, order, artikel kain, lot, batch, roll, recipe, tahapan proses, mesin, waktu, operator, dan hasil QC.

### 3.2 Konteks lebih penting daripada sekadar tag

Nilai sensor tanpa konteks hanya menjadi angka. Setiap data perlu diketahui berasal dari mesin apa, sub-equipment apa, batch mana, proses apa, satuan apa, kondisi operasi apa, dan batas normal yang berlaku untuk produk tersebut.

### 3.3 Bertahap dan modular

Sistem harus dapat dimulai dari satu area atau satu kelompok mesin, tetapi struktur data dan arsitekturnya tetap dapat diperluas hingga seluruh pabrik tanpa perlu dibangun ulang dari nol.

### 3.4 Data real-time dan data historis memiliki kedudukan yang sama penting

Real-time digunakan untuk mengetahui apa yang sedang terjadi. Data historis digunakan untuk memahami mengapa hal tersebut terjadi, bagaimana pola sebelumnya, dan apa yang kemungkinan terjadi berikutnya.

### 3.5 Keamanan proses tidak boleh dikompromikan

Pada tahap awal, sistem bersifat observasional dan advisory. Setiap kemampuan menulis setpoint atau memberikan kontrol ke mesin hanya boleh dilakukan setelah validasi teknis, penilaian risiko, pembatasan akses, audit trail, interlock, dan prosedur keselamatan disetujui.

### 3.6 AI harus dapat dijelaskan

Rekomendasi AI harus menunjukkan data pendukung, periode analisis, tingkat keyakinan, faktor dominan, dan dampak yang diperkirakan. Operator tidak seharusnya menerima rekomendasi tanpa alasan yang dapat dipahami.

### 3.7 Satu definisi untuk satu indikator

KPI seperti OEE, downtime, reject rate, yield, output, cycle time, energy per unit, dan batch duration harus memiliki definisi resmi yang sama untuk semua bagian.

---

## 4. Gambaran Proses Bisnis Tekstil

Alur aktual akan disesuaikan dengan kondisi pabrik setelah daftar proses dan mesin diberikan. Secara konseptual, perjalanan material dipandang sebagai berikut:

**Customer / Sales Order → Identitas Artikel atau Kain → Lot / Roll → Batch Produksi → Rute Proses → Mesin pada Setiap Proses → Pemeriksaan Antarproses → Finishing → Final QC → Packing / Delivery**

Dalam sistem, satu kain atau order customer tidak cukup hanya memiliki nomor. Identitas tersebut harus menjadi pengikat seluruh riwayat produksi, antara lain:

- Data customer dan order.
- Spesifikasi kain dan target kualitas.
- Nomor lot, batch, dan roll.
- Recipe atau parameter standar.
- Urutan proses yang harus dilalui.
- Mesin aktual yang digunakan pada setiap proses.
- Waktu mulai, berhenti, menunggu, dan selesai.
- Operator dan shift.
- Parameter proses aktual.
- Alarm serta downtime yang terjadi.
- Material, chemical, dan utilitas yang digunakan.
- Hasil inspeksi atau QC pada setiap checkpoint.
- Rework, hold, split, merge, atau perubahan rute.
- Status akhir dan keputusan release.

### 4.1 Digital genealogy

Sistem harus menjaga silsilah atau genealogy material apabila terjadi:

- Beberapa roll digabung ke dalam satu batch.
- Satu batch dibagi menjadi beberapa sub-batch atau roll.
- Material mengalami rework.
- Material dipindahkan ke mesin alternatif.
- Recipe diubah saat proses berlangsung.
- Batch ditahan karena quality hold.
- Material reject dipisahkan dari output baik.

Dengan genealogy yang benar, output akhir selalu dapat ditelusuri kembali ke semua input, proses, mesin, kondisi, dan keputusan yang memengaruhinya.

---

## 5. Model Objek Utama

Model berikut adalah konsep awal dan akan disempurnakan setelah proses aktual dipetakan.

| Domain | Objek utama | Fungsi |
|---|---|---|
| Customer | Customer, order, product specification | Menentukan kebutuhan dan target akhir |
| Material | Article, fabric, lot, roll, batch | Identitas fisik dan digital material |
| Process | Route, operation, process step, recipe | Mendefinisikan perjalanan dan cara pemrosesan |
| Production | Work order, schedule, execution, output | Mengelola pelaksanaan produksi |
| Asset | Plant, area, line, machine, equipment, component | Membentuk hierarchy asset |
| Instrumentation | PLC, sensor, meter, tag, signal | Sumber data aktual proses dan kondisi |
| Quality | Parameter, inspection, defect, deviation, disposition | Menilai kesesuaian hasil |
| Event | State, alarm, warning, downtime, changeover | Menjelaskan kejadian dalam waktu |
| Maintenance | Work request, work order, inspection, failure mode | Mengelola kesehatan asset |
| Utility | Electricity, water, steam, air, gas, chemical | Mengukur sumber daya proses |
| People | User, operator, technician, supervisor, approver | Tanggung jawab dan otorisasi |
| Intelligence | Rule, model, anomaly, recommendation, prediction | Analitik dan AI |

### 5.1 Hierarchy asset konseptual

**Enterprise → Site / Plant → Area → Process Line → Machine → Equipment → Component → Sensor / Tag**

Contoh hubungan generik:

**Plant → Finishing Area → Line 01 → Machine A → Main Drive → Motor → Bearing DE → Vibration Sensor**

Hierarchy ini memungkinkan alarm pada satu sensor dikaitkan dengan component, equipment, mesin, line, batch yang sedang berjalan, serta dampaknya terhadap kualitas dan produksi.

### 5.2 Identitas produksi konseptual

Identitas minimum yang perlu dapat saling dihubungkan:

- Customer order.
- Production order atau work order.
- Article atau product code.
- Fabric lot.
- Roll identifier.
- Batch identifier.
- Process route.
- Process operation.
- Machine assignment.
- Recipe version.
- Shift dan operator.
- QC inspection.

---

## 6. Ruang Lingkup Fungsional Jangka Panjang

### 6.1 Plant overview

Memberikan gambaran cepat kondisi seluruh pabrik:

- Status area, line, dan mesin.
- Output aktual terhadap target.
- OEE dan komponennya.
- WIP pada setiap proses.
- Batch yang sedang aktif, menunggu, hold, atau terlambat.
- Alarm aktif dan tingkat keparahannya.
- Kondisi utilitas utama.
- Isu kualitas paling kritis.
- Perkiraan risiko terhadap target shift atau delivery.

### 6.2 Real-time machine monitoring

Setiap mesin memiliki halaman operasional yang dapat menampilkan:

- Mode mesin: run, idle, setup, maintenance, fault, offline, atau status relevan lainnya.
- Batch, roll, atau work order yang sedang diproses.
- Parameter proses aktual dan setpoint.
- Trend jangka pendek.
- Status interlock dan permissive yang diizinkan untuk ditampilkan.
- Alarm aktif.
- Kondisi sub-equipment.
- Output, speed, cycle, dan performance aktual.
- Kualitas data dan waktu update terakhir.

### 6.3 Batch dan material tracking

Fungsi ini menjadi benang merah MES:

- Mengetahui posisi terakhir setiap roll atau batch.
- Mengetahui proses yang sudah dan belum dilalui.
- Membandingkan actual route terhadap planned route.
- Mengetahui waktu proses, waktu tunggu, dan waktu antre.
- Mengidentifikasi bottleneck.
- Menampilkan recipe dan parameter aktual pada setiap tahap.
- Menyimpan genealogy split, merge, hold, dan rework.
- Menghubungkan hasil QC dengan kondisi proses sebelumnya.

### 6.4 Production execution

- Import atau pembuatan work order.
- Dispatch batch ke line atau mesin.
- Pengaturan urutan kerja.
- Start, pause, hold, resume, dan complete.
- Tracking target dan hasil aktual.
- Pencatatan scrap, reject, rework, dan reason code.
- Changeover tracking.
- Electronic production record.
- Handover antar-shift.

### 6.5 Quality management

- Spesifikasi kualitas per customer atau artikel.
- Inspection plan per proses.
- Input hasil manual maupun otomatis dari alat ukur.
- Defect classification dan defect map bila relevan.
- Statistical process control.
- Quality hold dan release workflow.
- Non-conformance record.
- Hubungan defect dengan batch, recipe, mesin, operator, serta kondisi proses.
- Perbandingan antar-mesin, shift, artikel, dan recipe.

### 6.6 Alarm dan event management

Alarm harus dikelola sebagai siklus kejadian, bukan hanya daftar pesan:

1. Kondisi abnormal terdeteksi.
2. Alarm dibuat dengan timestamp yang akurat.
3. Tingkat prioritas dan potensi dampak ditentukan.
4. Operator melakukan acknowledgement.
5. Tindakan atau komentar dicatat.
6. Kondisi kembali normal.
7. Alarm ditutup atau diteruskan menjadi maintenance request.
8. Riwayat digunakan untuk analisis berulang.

Fungsi yang diperlukan:

- Prioritas critical, high, medium, dan low.
- Alarm flood detection.
- Repeated atau chattering alarm detection.
- First-out event untuk membantu analisis urutan kegagalan.
- Alarm suppression atau shelving dengan hak akses dan batas waktu.
- Escalation sesuai durasi dan dampak.
- Analisis frekuensi, durasi, waktu respons, dan dampak produksi.

### 6.7 Equipment health dan maintenance

Satu mesin dapat terdiri dari banyak equipment. Contohnya motor, gearbox, pump, fan, heater, bearing, hydraulic unit, pneumatic unit, valve, dan drive. Setiap equipment perlu memiliki:

- Identitas dan posisi pada hierarchy asset.
- Manufacturer, model, serial number, dan spesifikasi.
- Parameter kondisi yang tersedia.
- Operating hours, start count, dan loading history.
- Alarm dan failure history.
- Maintenance history.
- Spare part terkait.
- Failure mode dan gejala yang dikenal.
- Health score bila model sudah tersedia.

Tahapan maintenance yang dituju:

**Reactive → Preventive berbasis waktu → Condition-based → Predictive → Prescriptive**

### 6.8 Utility and energy management

Optimisasi utilitas harus dikaitkan dengan konteks produksi, tidak hanya total konsumsi.

Analisis dapat mencakup:

- Konsumsi listrik per mesin, line, batch, kilogram, meter, atau unit output.
- Konsumsi steam, water, compressed air, gas, dan chemical.
- Base load saat tidak produksi.
- Peak demand dan demand pattern.
- Kebocoran atau konsumsi tidak wajar.
- Perbandingan utilitas aktual terhadap baseline recipe.
- Hubungan penggunaan utilitas terhadap kualitas.
- Biaya aktual per batch atau produk.
- Peluang scheduling berdasarkan kapasitas dan tarif energi bila relevan.

### 6.9 Analytics dan root cause analysis

Sistem analitik harus dapat menyatukan timeline berikut:

**Material masuk → Recipe dan setpoint → Kondisi proses aktual → Status mesin → Kondisi equipment → Alarm / event → Perubahan operator → Hasil produksi → Hasil QC**

Saat terjadi ketidaksesuaian output, sistem diharapkan dapat membantu:

- Menentukan kapan penyimpangan pertama kali terlihat.
- Membandingkan batch bermasalah dengan batch normal yang setara.
- Menemukan parameter yang keluar dari operating window.
- Mengidentifikasi alarm atau perubahan state sebelum defect.
- Menentukan equipment yang menunjukkan gejala abnormal.
- Mengukur kemungkinan hubungan antar-variabel.
- Menampilkan kandidat penyebab beserta bukti data.
- Menilai dampak produksi, kualitas, energi, dan waktu.

Analisis harus membedakan korelasi dan penyebab. Rekomendasi awal tetap memerlukan validasi personel proses atau engineering.

### 6.10 Recommendation and AI center

AI center pada tahap matang dapat mencakup:

- Anomaly detection untuk proses dan equipment.
- Prediksi kualitas sebelum final QC.
- Prediksi downtime atau failure.
- Remaining useful life equipment tertentu.
- Rekomendasi maintenance window.
- Rekomendasi parameter proses berdasarkan artikel dan kondisi aktual.
- Optimisasi urutan produksi dan changeover.
- Optimisasi konsumsi utilitas.
- Asisten analisis yang menjelaskan kejadian dengan bahasa natural.
- Pencarian riwayat kasus serupa dan tindakan yang pernah berhasil.

Setiap rekomendasi minimal perlu memuat:

- Masalah atau peluang yang terdeteksi.
- Asset, batch, atau proses terdampak.
- Data dan periode yang digunakan.
- Faktor utama.
- Tindakan yang disarankan.
- Perkiraan manfaat dan risiko.
- Confidence level.
- Status review, approval, execution, dan hasil aktual.

---

## 7. Konsep Data Real-Time dan Historis

### 7.1 Kelompok data

Data dapat dikelompokkan menjadi:

- **Master data:** asset, equipment, product, recipe, spesifikasi, user, reason code.
- **Transactional data:** order, batch execution, QC record, maintenance work order.
- **Time-series data:** temperature, pressure, speed, current, vibration, flow, level, dan parameter sensor lainnya.
- **Event data:** start, stop, mode change, alarm, acknowledgement, recipe change.
- **Document data:** manual mesin, SOP, drawing, certificate, laporan.
- **Analytical data:** feature, model output, anomaly score, recommendation, prediction.

### 7.2 Konteks setiap tag

Setiap tag idealnya memiliki metadata minimum:

- Tag identifier yang unik.
- Nama yang mudah dipahami.
- Plant, area, line, machine, equipment, dan component.
- Deskripsi fungsi.
- Data type.
- Engineering unit.
- Normal operating range.
- Alarm limit bila berlaku.
- Sampling atau change behavior.
- Data source.
- Kualitas komunikasi.
- Criticality.
- Retention class.
- Owner atau penanggung jawab.

### 7.3 Kualitas data

Nilai sensor harus disertai status kualitas, misalnya good, uncertain, bad, stale, substituted, atau communication loss. Dashboard tidak boleh menampilkan angka seolah valid ketika sumber datanya bermasalah.

### 7.4 Sinkronisasi waktu

PLC, gateway, server, historian, aplikasi, dan perangkat terkait harus menggunakan referensi waktu yang konsisten. Tanpa sinkronisasi waktu, urutan alarm, hubungan sebab-akibat, dan analisis batch dapat menghasilkan kesimpulan yang salah.

### 7.5 Strategi penyimpanan konseptual

Tidak semua tag harus disimpan dengan frekuensi dan durasi yang sama. Kategori awal:

| Kelas | Contoh | Karakter data | Tujuan |
|---|---|---|---|
| Fast process | Vibration, speed, electrical waveform tertentu | Frekuensi tinggi | Analisis kondisi atau transient |
| Standard process | Temperature, pressure, flow, current | Berkala atau exception-based | Monitoring dan batch history |
| State and event | Run, stop, fault, mode | Saat berubah | Timeline produksi dan downtime |
| Aggregated | Hourly energy, KPI shift | Ringkasan periodik | Laporan dan analitik jangka panjang |

Frekuensi, deadband, compression, dan retention final harus ditentukan berdasarkan kebutuhan analisis masing-masing tag, kapasitas jaringan, dan biaya penyimpanan.

---

## 8. Arsitektur Konseptual

Arsitektur awal dipisahkan menjadi beberapa lapisan agar mudah dikembangkan dan diamankan.

### 8.1 Lapisan mesin dan instrumentasi

- Sensor dan instrument.
- Motor drive, inverter, controller, dan local panel.
- PLC atau machine controller.
- Sistem kontrol existing dari vendor mesin.

### 8.2 Lapisan edge dan konektivitas

- Industrial gateway.
- Protocol adapter.
- Local buffering saat koneksi terputus.
- Normalisasi tag dan timestamp.
- Pemeriksaan data quality.
- Segmentasi komunikasi OT.

### 8.3 Lapisan data operasional

- Real-time data ingestion.
- Event stream.
- Time-series historian.
- Asset model.
- Batch dan production context.
- Alarm and event store.
- Master data management.

### 8.4 Lapisan aplikasi

- SCADA monitoring.
- MES execution dan traceability.
- Quality management.
- Maintenance integration.
- Utility management.
- Reporting dan dashboard.
- Notification dan workflow.

### 8.5 Lapisan intelligence

- Rule engine.
- Statistical analysis.
- Anomaly detection.
- Predictive models.
- Optimization engine.
- AI assistant dan recommendation service.
- Model monitoring dan feedback.

### 8.6 Lapisan integrasi enterprise

Potensi integrasi pada tahap berikutnya:

- ERP.
- Planning dan scheduling.
- Laboratory atau quality system.
- CMMS atau maintenance system.
- Warehouse dan inventory.
- Energy management.
- Identity provider.
- Notification platform.

### 8.7 Arah aliran data

Tahap awal mengutamakan aliran data satu arah dari mesin menuju sistem monitoring. Kemampuan menulis kembali ke mesin ditempatkan sebagai tahap terpisah dan hanya boleh dibuka per use case setelah semua kontrol keselamatan disetujui.

---

## 9. Konsep Analisis Ketidaksesuaian Produksi

Ketika hasil QC atau output dinyatakan tidak sesuai, sistem membentuk sebuah investigation case.

### 9.1 Informasi kasus

- Identitas customer, artikel, lot, batch, dan roll.
- Jenis defect dan tingkat severity.
- Waktu atau bagian material yang terdampak.
- Spesifikasi target dan hasil aktual.
- Proses serta mesin yang telah dilalui.
- Recipe dan revision yang digunakan.
- Operator dan shift.

### 9.2 Jendela analisis

Sistem mengumpulkan data sebelum, selama, dan setelah periode yang diperkirakan menyebabkan masalah:

- Parameter proses.
- Perubahan setpoint.
- Machine state.
- Alarm dan event sequence.
- Kondisi motor dan equipment.
- Utility disturbance.
- Perubahan material atau chemical.
- Maintenance atau intervention terakhir.

### 9.3 Pembanding

Kasus dibandingkan dengan:

- Batch sebelumnya yang normal dengan artikel sama.
- Mesin lain yang memproses artikel setara.
- Golden batch atau baseline terbaik.
- Batas recipe dan statistical control limit.

### 9.4 Output investigasi

- Timeline kejadian.
- Parameter yang paling menyimpang.
- Kandidat penyebab.
- Bukti pendukung.
- Kasus historis serupa.
- Rekomendasi pemeriksaan atau tindakan.
- Keputusan engineer.
- Hasil setelah tindakan.

Keputusan engineer disimpan sebagai feedback agar rule atau model dapat ditingkatkan.

---

## 10. Konsep Dashboard dan Navigasi

Tema visual yang telah dipilih adalah hybrid light industrial: workspace terang, panel bersih, sidebar charcoal, dan signal color yang konsisten.

Struktur navigasi jangka panjang yang dibayangkan:

1. **Plant Overview** — ringkasan seluruh pabrik.
2. **Production** — order, batch, roll, WIP, schedule, dan execution.
3. **Process Tracking** — perjalanan material dan genealogy.
4. **Equipment** — hierarchy mesin sampai component.
5. **Quality** — inspection, defect, deviation, dan SPC.
6. **Alarms & Events** — alarm aktif, history, sequence, dan analysis.
7. **Maintenance** — asset health, work request, dan prediction.
8. **Utilities** — konsumsi, biaya, baseline, dan optimization.
9. **Analytics** — trend, comparison, RCA, dan report.
10. **AI Center** — anomaly, prediction, dan recommendation.
11. **Configuration** — asset, tag, recipe, role, dan integration.

### 10.1 Aturan visual status

| Warna | Makna utama |
|---|---|
| Hijau | Normal, running, within specification |
| Cyan | Informasi aktif, data real-time, navigasi, selected state |
| Amber | Warning, approaching limit, action required soon |
| Merah | Critical, trip, unsafe, significant quality risk |
| Abu-abu | Offline, unknown, not applicable, atau inactive |

Warna tidak boleh menjadi satu-satunya pembeda. Status selalu disertai teks, icon, pattern, atau label.

---

## 11. User dan Hak Akses Konseptual

| Peran | Kebutuhan utama |
|---|---|
| Operator | Monitoring mesin, batch aktif, alarm, instruksi, input reason |
| Shift leader | Kondisi line, target, bottleneck, escalation, handover |
| Process engineer | Trend, recipe, comparison, RCA, optimization |
| Quality | Specification, inspection, defect, hold, release, genealogy |
| Maintenance | Equipment health, alarm, work request, failure history |
| Utility / Energy | Metering, consumption, peak, efficiency, cost |
| Production planner | Schedule, capacity, WIP, due date, route |
| Management | KPI, loss, cost, quality, delivery, improvement trend |
| OT / Automation | Tag, connectivity, PLC interface, gateway, health |
| System administrator | User, role, configuration, audit, integration |
| Data / AI team | Curated data, model, evaluation, monitoring, feedback |

Hak akses perlu mengikuti prinsip least privilege, segregasi tugas, dan audit untuk tindakan penting.

---

## 12. Non-Functional Requirements Awal

### 12.1 Scalability

- Mendukung pertumbuhan hingga sekitar 300 mesin.
- Penambahan mesin tidak membutuhkan perubahan fundamental.
- Mampu menangani peningkatan tag, event, user, dan histori.
- Penyimpanan dapat ditingkatkan sesuai retention policy.

### 12.2 Reliability

- Data lokal dapat dibuffer saat koneksi terputus.
- Koneksi yang pulih dapat mengirim data tertunda dengan urutan benar.
- Status communication loss terlihat jelas.
- Komponen kritis memiliki monitoring dan recovery plan.

### 12.3 Performance

- Dashboard operasional harus merespons cepat.
- Pembaruan nilai disesuaikan dengan kebutuhan proses, bukan semua tag dipaksakan pada frekuensi sama.
- Query historis besar tidak boleh mengganggu monitoring real-time.

### 12.4 Cybersecurity OT / IT

- Segmentasi jaringan OT dan IT.
- Akses melalui jalur yang terkontrol.
- Tidak membuka PLC langsung ke jaringan umum.
- Identity dan role-based access.
- Enkripsi komunikasi jika didukung dan sesuai.
- Audit login, perubahan konfigurasi, acknowledgement, dan command.
- Backup, restore test, patch strategy, dan incident response.
- Remote access hanya melalui mekanisme resmi dan tercatat.

### 12.5 Auditability

Perubahan recipe, batas alarm, konfigurasi tag, master data, keputusan QC, recommendation approval, dan command ke mesin harus dapat diketahui siapa, kapan, apa perubahan sebelumnya, dan alasan perubahannya.

### 12.6 Usability

- Informasi utama dapat dipahami dalam beberapa detik.
- Tampilan operator tidak dipenuhi data yang tidak relevan.
- Drill-down konsisten dari plant hingga sensor.
- Timestamp, unit, status kualitas, dan sumber data selalu jelas.
- Mendukung tampilan desktop besar dan perangkat operasional yang disepakati.

---

## 13. KPI Konseptual

### 13.1 Produksi

- Output aktual versus target.
- Schedule attainment.
- Throughput.
- Cycle atau process time.
- WIP dan queue time.
- Changeover time.
- OEE: availability, performance, quality.

### 13.2 Quality

- First pass yield.
- Defect dan reject rate.
- Rework rate.
- Right-first-time.
- Customer specification compliance.
- Quality hold duration.

### 13.3 Maintenance

- MTBF.
- MTTR.
- Planned versus unplanned downtime.
- Alarm frequency.
- Maintenance compliance.
- Equipment health score.

### 13.4 Utilities

- Energy per unit output.
- Utility per batch atau article.
- Base load.
- Peak demand.
- Cost per unit.
- Waste dan deviation dari baseline.

Definisi dan formula final setiap KPI akan dibuat dalam data dictionary khusus.

---

## 14. Roadmap Pengembangan Bertahap

### Fase 0 — Discovery dan standardisasi

- Inventarisasi proses dan jenis mesin.
- Pemetaan hierarchy asset.
- Inventarisasi PLC, controller, protokol, sensor, dan jaringan.
- Identifikasi data customer, lot, batch, roll, recipe, dan QC.
- Standardisasi naming, unit, timestamp, alarm priority, dan KPI.
- Penentuan satu area pilot.

### Fase 1 — Foundation dan visibility

- Konektivitas read-only untuk pilot.
- Asset registry dan tag registry.
- Real-time machine state.
- Historian untuk parameter terpilih.
- Alarm dan event dasar.
- Dashboard plant, line, dan machine.
- Data quality dan communication health.

### Fase 2 — MES traceability

- Identitas order, lot, roll, dan batch.
- Process route dan work order execution.
- Batch-to-machine context.
- Genealogy split, merge, rework, dan hold.
- Electronic batch atau production record.
- Integrasi QC awal.

### Fase 3 — Equipment, quality, dan utilities

- Equipment hierarchy sampai motor atau component prioritas.
- Condition monitoring.
- Maintenance workflow atau integrasi CMMS.
- Quality deviation workflow.
- Utility metering dan intensity baseline.
- Cross-domain analysis.

### Fase 4 — Advanced analytics

- Golden batch comparison.
- Automated loss analysis.
- Anomaly detection.
- Root cause assistance.
- Predictive quality.
- Predictive maintenance.

### Fase 5 — AI recommendation

- Rekomendasi operasional yang dapat dijelaskan.
- Recommendation approval workflow.
- Pelacakan hasil rekomendasi.
- Model monitoring, drift detection, dan retraining governance.
- Optimisasi scheduling, recipe, dan utility secara advisory.

### Fase 6 — Supervised dan closed-loop optimization

- Write-back terbatas per use case.
- Human approval sebelum eksekusi.
- Hard limit, interlock, rollback, dan fail-safe.
- Pilot terkontrol dan validation protocol.
- Closed-loop hanya untuk proses yang telah terbukti aman dan stabil.

Setiap fase harus menghasilkan manfaat operasional sendiri. Fase AI tidak boleh menjadi alasan untuk menunda perbaikan fundamental pada instrumentasi, data quality, SOP, dan discipline operasional.

---

## 15. Usulan Cakupan Minimum Tahap Pertama

Karena project akan dikembangkan sedikit demi sedikit, baseline implementasi awal sebaiknya dibatasi pada satu area pilot dengan hasil yang dapat diverifikasi.

Cakupan minimum yang disarankan:

1. Satu area proses atau kelompok mesin representatif.
2. Asset hierarchy mesin dan equipment utama.
3. Daftar tag prioritas beserta unit dan batas operasinya.
4. Machine state yang konsisten.
5. Real-time trend dan historian.
6. Alarm aktif dan history.
7. Identitas batch atau roll yang sedang diproses.
8. Output aktual dan satu atau dua KPI yang disepakati.
9. Hasil QC yang dapat dikaitkan dengan batch pilot.
10. Data quality dan connection health.

Keberhasilan tahap pertama bukan diukur dari jumlah layar, melainkan dari apakah data dapat dipercaya dan satu perjalanan batch dapat ditelusuri dengan benar.

---

## 16. Kebutuhan Informasi untuk Versi Berikutnya

Dokumen berikutnya memerlukan referensi dari pemilik project mengenai:

### 16.1 Proses pabrik

- Urutan proses tekstil dari bahan masuk sampai final QC.
- Nama area dan line.
- Proses wajib dan proses opsional.
- Kemungkinan rework, split, merge, atau alternate route.

### 16.2 Daftar mesin

- Jenis dan nama mesin.
- Jumlah mesin per jenis.
- Vendor dan model.
- Tahun atau generasi mesin bila relevan.
- PLC atau controller.
- Protokol komunikasi yang tersedia.
- Equipment utama per mesin.

### 16.3 Data produksi

- Format nomor customer, order, artikel, lot, roll, dan batch.
- Cara batch dibuat dan di-assign ke mesin.
- Recipe dan setpoint.
- Definisi output, reject, rework, dan downtime.

### 16.4 Sensor dan tag

- Existing tag list.
- Sensor terpasang.
- Sampling rate bila diketahui.
- Unit dan range.
- Alarm limit.
- Data yang hanya tersedia pada HMI vendor.

### 16.5 Quality

- Parameter QC per tahap.
- Spesifikasi per customer atau artikel.
- Jenis defect.
- Metode sampling.
- Format pencatatan saat ini.

### 16.6 Maintenance dan utilities

- Equipment kritis.
- Failure history.
- Maintenance schedule.
- Meter listrik dan utilitas yang tersedia.
- Struktur tarif atau biaya bila dibutuhkan untuk analisis.

### 16.7 Infrastruktur

- Kondisi jaringan OT.
- Server atau cloud policy.
- Sistem existing yang perlu diintegrasikan.
- Kebijakan cybersecurity dan akses vendor.

---

## 17. Risiko Awal yang Perlu Dikelola

| Risiko | Dampak | Arah mitigasi |
|---|---|---|
| Mesin berasal dari banyak vendor dan generasi | Format data tidak seragam | Gunakan adapter dan canonical data model |
| Tag banyak tetapi metadata tidak lengkap | Analisis kehilangan konteks | Bangun tag registry dan ownership |
| Timestamp tidak sinkron | Urutan kejadian salah | Standardisasi time synchronization |
| Data customer, batch, dan mesin tidak terhubung | Traceability gagal | Tetapkan identity dan scan / assignment workflow |
| Alarm terlalu banyak | Operator mengabaikan alarm | Alarm rationalization dan priority governance |
| Sensor tidak akurat | Rekomendasi salah | Calibration, quality flag, dan validation |
| Scope terlalu besar pada awal | Implementasi lambat dan sulit divalidasi | Mulai dari pilot yang representatif |
| AI digunakan sebelum data siap | Model tidak dipercaya | Data readiness gate dan human validation |
| Akses kontrol terlalu cepat | Risiko keselamatan dan produksi | Read-only first, staged write-back, interlock |
| Perubahan proses tidak terdokumentasi | Historis tidak dapat dibandingkan | Versioning recipe, configuration, dan master data |

---

## 18. Tata Kelola Dokumentasi dan Versi

### 18.1 Aturan versi

- **v1.0** adalah baseline konsep induk.
- **v1.1, v1.2, dan seterusnya** digunakan untuk penambahan atau perbaikan yang tidak mengubah visi dan arsitektur utama.
- **v2.0** digunakan apabila terdapat perubahan besar pada ruang lingkup, model data, arsitektur, atau arah implementasi.

### 18.2 Aturan file

- Setiap versi konsep disimpan sebagai file baru.
- Versi lama tidak ditimpa atau dihapus.
- Nama file mengikuti pola `SCADA_MES_Master_Concept_vX.Y.md`.
- Semua perubahan dicatat pada `CHANGELOG.md`.
- Referensi detail dapat dipisahkan menjadi dokumen turunan, misalnya machine catalog, tag dictionary, asset hierarchy, alarm philosophy, dan data architecture.

### 18.3 Isi catatan update

Setiap update minimal menjelaskan:

- Nomor versi dan tanggal.
- Ringkasan perubahan.
- Bagian yang ditambahkan.
- Bagian yang direvisi.
- Keputusan baru.
- Asumsi yang berubah.
- Data atau referensi sumber.
- Hal yang masih terbuka.

---

## 19. Dokumen Turunan yang Direncanakan

Dokumen berikut akan dibuat sesuai perkembangan project:

1. Plant Process Map.
2. Asset dan Equipment Hierarchy.
3. Machine Integration Catalog.
4. Tag Naming Standard dan Tag Dictionary.
5. Batch, Lot, dan Roll Traceability Model.
6. Alarm Philosophy.
7. KPI dan Calculation Dictionary.
8. Quality Data Model dan Defect Taxonomy.
9. Utility Metering Plan.
10. OT / IT Data Architecture.
11. Cybersecurity dan Access Control Concept.
12. AI Use Case Register dan Model Governance.
13. Pilot Scope dan Acceptance Criteria.

---

## 20. Keputusan Baseline v1.0

Keputusan yang dianggap disepakati pada versi awal ini:

1. Project merupakan pondasi jangka panjang SCADA / MES terintegrasi, bukan dashboard terpisah.
2. Industri dan konteks utama adalah pabrik tekstil.
3. Skala target mencapai kurang lebih 300 mesin.
4. Customer, kain, lot, roll, dan batch menjadi pusat traceability.
5. Data mesin harus dapat diturunkan sampai equipment atau component relevan.
6. Sistem mencakup monitoring, production tracking, quality, alarm, maintenance, dan utility.
7. Analitik dan AI dikembangkan setelah fondasi data cukup stabil.
8. Optimisasi langsung ke mesin ditempatkan sebagai tahap lanjutan dengan kontrol keselamatan.
9. Pengembangan dilakukan bertahap dan terdokumentasi per versi.
10. Detail mesin dan tag belum ditetapkan sampai referensi tambahan diberikan.

---

## 21. Hal yang Masih Terbuka

- Nama resmi project dan identitas perusahaan.
- Peta proses lengkap pabrik.
- Area pilot pertama.
- Daftar jenis mesin dan jumlahnya.
- Struktur nomor kain, roll, lot, dan batch aktual.
- Platform PLC, HMI, SCADA, atau sistem existing.
- Ketersediaan sensor dan utility meter.
- Sumber data QC.
- Sistem ERP, CMMS, atau aplikasi lain yang akan diintegrasikan.
- Target refresh rate, retention, availability, serta deployment.
- Prioritas use case bisnis pertama.

Hal-hal tersebut sengaja belum diasumsikan agar desain berikutnya tetap berdasarkan kondisi nyata pabrik.

---

## 22. Penutup

Fondasi utama sistem ini adalah keterhubungan konteks. Sensor harus terhubung ke equipment, equipment ke mesin, mesin ke proses, proses ke batch, batch ke kain dan customer, lalu seluruh perjalanan tersebut terhubung ke hasil produksi dan kualitas.

Jika hubungan ini dibangun secara konsisten sejak awal, dashboard dapat berkembang dari sekadar menampilkan data menjadi sistem yang mampu menjelaskan kejadian, memprediksi risiko, merekomendasikan tindakan, dan pada akhirnya membantu mengoptimalkan operasi pabrik secara aman.

