# Konsep Utilitas Pabrik

**Versi:** 1.0  
**Status:** Baseline konseptual awal  
**Tanggal:** 14 Agustus 2026  
**Kategori:** Electrical, water, steam, dan thermal oil utilities  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Catatan:** Topologi aktual, kapasitas, meter, tag, batas alarm, serta jenis perangkat masih harus dikonfirmasi melalui drawing dan survey lapangan.

---

## 1. Ringkasan

Utilitas pabrik menjadi backbone yang mendukung seluruh mesin produksi. Sistem utilitas perlu dimonitor sebagai satu jaringan supply dan consumption, bukan sebagai kumpulan meter yang berdiri sendiri.

Domain utilitas awal yang sudah diidentifikasi:

1. Distribusi listrik melalui beberapa cubicle utama.
2. Distribusi lanjutan melalui MDP dan SDP pada beberapa titik.
3. Energy monitoring pada setiap mesin.
4. Konsumsi air proses per mesin.
5. Boiler steam untuk memasok Jetflow dan Kalender.
6. Boiler thermal oil untuk memasok Dryer.

Meter pada cubicle, MDP, dan SDP berfungsi sebagai main reference. Meter tiap mesin berfungsi sebagai detail consumption. Dengan hierarchy ini, sistem dapat membandingkan energi masuk dengan total konsumsi downstream, mengalokasikan biaya, menemukan penggunaan abnormal, dan menghubungkan konsumsi dengan output produksi.

---

## 2. Informasi yang Sudah Dikonfirmasi

Baseline menggunakan informasi berikut sebagai fakta awal:

1. Terdapat beberapa cubicle utama sebagai supply listrik.
2. Terdapat beberapa MDP dan SDP yang dipasang pada titik tertentu.
3. Meter utama digunakan sebagai pembanding konsumsi listrik.
4. Setiap mesin direncanakan memiliki energy monitoring masing-masing.
5. Konsumsi air akan diambil dari proses per mesin.
6. Boiler memasok steam dan oil ke beberapa mesin.
7. Boiler steam memasok Jetflow dan Kalender.
8. Boiler oil memasok Dryer.

Detail lain merupakan rancangan konseptual yang perlu diverifikasi.

---

## 3. Tujuan Sistem Utility Monitoring

Sistem dirancang untuk:

- Menampilkan kondisi supply utilitas secara real-time.
- Mengetahui jalur supply dari sumber sampai mesin.
- Mengukur konsumsi listrik dan air setiap mesin.
- Menghubungkan konsumsi dengan batch, recipe, article, output, dan quality.
- Membandingkan meter utama dengan jumlah meter downstream.
- Menemukan base load, peak demand, loss, dan konsumsi tidak wajar.
- Mengetahui pengaruh keterbatasan utility terhadap performa mesin.
- Menghitung utility intensity per unit produksi.
- Mendukung alokasi biaya per mesin, proses, batch, atau produk.
- Memprediksi kebutuhan steam, thermal oil, air, dan listrik.
- Menjadi fondasi optimisasi utility dan production scheduling.

---

## 4. Utility Digital Thread

Hubungan data konseptual:

**Utility Source → Distribution Node → Consumer Machine → Process Run / Batch → Output → Quality → Utility Cost and Efficiency**

Contoh hubungan:

- Cubicle utama → MDP → SDP → Jetflow → dyeing batch → kilogram kain.
- Cubicle utama → MDP → SDP → Calator → process run → meter kain.
- Steam boiler → steam header → Jetflow → heating step → dyeing batch.
- Steam boiler → steam header → Kalender → upper/lower heating → finishing run.
- Thermal oil boiler → thermal oil loop → Dryer → chamber heating → drying run.
- Water distribution → machine water meter → recipe step → batch.

Setiap nilai konsumsi perlu memiliki konteks waktu, source, destination, machine, state, batch, dan output.

---

## 5. Utility Asset Hierarchy

### 5.1 Electrical hierarchy

**Plant Electrical Supply → Main Cubicle → MDP → SDP → Machine Feeder → Machine Energy Meter → Machine / Equipment**

Hierarchy final mengikuti single-line diagram aktual. Tidak semua mesin harus melewati struktur yang sama, sehingga hubungan parent-child perlu dikonfigurasi berdasarkan jalur supply nyata.

### 5.2 Water hierarchy

**Water Source → Main Distribution → Area / Line Branch → Machine Water Meter → Process Consumer**

Sumber, tank, pump, dan jalur distribusi air belum diberikan dan perlu dipetakan.

### 5.3 Steam hierarchy

**Steam Boiler → Main Steam Header → Area / Branch Header → Consumer Machine → Process Step**

Consumer yang sudah dikonfirmasi:

- Jetflow.
- Kalender.

### 5.4 Thermal oil hierarchy

**Thermal Oil Boiler → Supply Header / Loop → Dryer → Chamber Heating System → Return Header / Loop**

Jumlah loop, header, pump, dan cabang belum dikonfirmasi.

### 5.5 Utility point identity

Setiap meter, feeder, header, atau distribution point perlu memiliki:

- Utility point ID.
- Nama dan deskripsi.
- Utility type.
- Parent supply point.
- Area dan lokasi.
- Consumer yang disuplai.
- Meter atau sensor terkait.
- Unit engineering.
- Capacity atau rating jika tersedia.
- Criticality.
- Communication status.
- Calibration atau verification status.
- Owner atau penanggung jawab.

---

## 6. Electrical Distribution Concept

### 6.1 Cubicle utama

Cubicle utama berfungsi sebagai titik supply dan referensi konsumsi tingkat atas. Setiap cubicle perlu dipetakan ke MDP, SDP, area, dan consumer downstream yang benar.

Informasi konseptual:

- Cubicle ID dan location.
- Incoming source.
- Outgoing feeder.
- MDP atau SDP yang disuplai.
- Meter utama.
- Rated capacity bila tersedia.
- Breaker status dan trip event jika dapat dibaca.
- Communication dan meter health.

### 6.2 MDP

MDP menjadi distribution node antara cubicle utama dan beban downstream.

Data konseptual:

- MDP ID dan parent cubicle.
- Incoming dan outgoing feeder.
- SDP atau machine group yang disuplai.
- Main meter dan sub-meter.
- Breaker status jika tersedia.
- Capacity utilization.
- Alarm dan trip.

### 6.3 SDP

SDP menjadi distribution node yang lebih dekat ke mesin atau kelompok mesin.

Data konseptual:

- SDP ID dan parent MDP atau cubicle.
- Area atau line.
- Machine feeder yang disuplai.
- Meter dan breaker status.
- Capacity utilization.
- Alarm dan trip.

### 6.4 Machine energy monitoring

Setiap mesin direncanakan memiliki meter energi sendiri. Meter harus dihubungkan dengan machine ID dan supply path yang benar.

Data minimum yang perlu dievaluasi:

- Active energy.
- Active power.
- Voltage.
- Current.
- Power factor.
- Frequency.
- Demand atau peak demand jika tersedia.
- Meter status dan communication quality.

Kandidat data lanjutan:

- Reactive power dan energy.
- Apparent power.
- Phase imbalance.
- Harmonic distortion.
- Breaker status.
- Event atau power-quality alarm.

Data final mengikuti kemampuan energy meter aktual.

---

## 7. Electrical Energy Balance

Energy balance membandingkan energi yang tercatat di titik upstream dengan total energi di semua titik downstream dalam periode waktu yang sama.

Konsep dasar:

**Upstream Energy = Sum of Downstream Energy + Distribution Loss + Unmetered Load + Measurement Difference**

Selisih tidak boleh langsung dianggap sebagai pencurian atau loss teknis. Kandidat penyebab dapat berupa:

- Beban belum memiliki sub-meter.
- Meter tidak sinkron waktu.
- Periode pembacaan berbeda.
- Meter memiliki accuracy class berbeda.
- Communication gap.
- Current transformer ratio atau konfigurasi meter salah.
- Distribution loss.
- Topologi supply di sistem tidak sesuai kondisi aktual.

### 7.1 Level reconciliation

- Cubicle versus total MDP dan direct consumer.
- MDP versus total SDP dan direct consumer.
- SDP versus total machine meter.
- Machine meter versus production output.

### 7.2 Metering coverage

Dashboard perlu menunjukkan persentase beban yang sudah memiliki meter, belum memiliki meter, atau meternya tidak sehat. Energy balance hanya dapat dipercaya bila coverage dan data quality diketahui.

---

## 8. Machine Energy Context

Konsumsi energi mesin perlu dipisahkan berdasarkan state:

- Offline.
- Idle.
- Ready.
- Setup atau changeover.
- Running.
- Hold.
- Fault.
- Maintenance.

Dengan state context, sistem dapat membedakan:

- Energi untuk menghasilkan output.
- Base load saat mesin idle.
- Energi selama setup.
- Energi yang terbuang ketika fault atau menunggu.
- Energi saat maintenance.

Konsumsi juga perlu dihubungkan dengan:

- Batch atau process run.
- Recipe dan article.
- Nomor warna bila relevan.
- Output good dan total.
- Quality disposition.
- Operator dan shift.
- Alarm dan downtime.

---

## 9. Water Monitoring Concept

Air proses akan dimonitor pada tingkat mesin. Tujuannya adalah mengetahui konsumsi aktual setiap mesin dan menghubungkannya dengan proses produksi.

### 9.1 Data minimum

- Machine ID.
- Water meter ID.
- Instantaneous flow jika tersedia.
- Totalizer.
- Start dan end reading.
- Consumption per batch atau run.
- Meter dan communication status.

### 9.2 Process context

Konsumsi air perlu dikaitkan dengan:

- Recipe step.
- Filling, washing, rinsing, cooling, atau cleaning state jika berlaku.
- Batch, roll, atau process run.
- Article dan nomor warna.
- Output quantity.
- Operator dan shift.

### 9.3 Water balance

Jika main meter dan branch meter tersedia, sistem dapat membandingkan:

- Main water supply versus total area branch.
- Area branch versus total machine consumption.
- Machine totalizer versus recipe expected consumption.

### 9.4 Analisis yang direncanakan

- Water per batch, meter, atau kilogram kain.
- Target versus actual water consumption.
- Flow saat mesin seharusnya tidak menggunakan air.
- Base flow atau potensi kebocoran.
- Filling atau rinsing lebih lama dari baseline.
- Konsumsi antar-mesin untuk recipe setara.
- Hubungan water consumption dengan wastewater load.

---

## 10. Steam Boiler Concept

Steam boiler memasok uap ke Jetflow dan Kalender.

### 10.1 Supply-consumer mapping

**Steam Boiler → Main Steam Header → Branch Header → Jetflow / Kalender → Process Step**

Untuk Jetflow, steam context dihubungkan dengan heating dan holding step.

Untuk Kalender, steam context dihubungkan dengan upper dan lower heating.

### 10.2 Kandidat data boiler

- Boiler state dan mode.
- Steam pressure.
- Steam temperature.
- Steam production flow atau total.
- Water level jika tersedia dan diizinkan untuk monitoring.
- Fuel consumption.
- Feedwater consumption.
- Boiler load atau firing rate.
- Alarm, warning, dan trip.
- Operating hour dan start count.

### 10.3 Kandidat data distribusi

- Header pressure dan temperature.
- Branch pressure.
- Steam flow atau totalizer per area atau machine.
- Valve command dan feedback.
- Condensate return jika tersedia.
- Trap atau distribution condition jika dimonitor.

### 10.4 Steam balance

Konsep reconciliation:

**Steam Produced = Sum of Measured Consumer Steam + Distribution Loss + Unmetered Consumption + Measurement Difference**

Balance hanya diterapkan jika instrumentation memadai dan basis satuan telah disepakati.

### 10.5 Analisis Jetflow

- Steam demand per recipe heating step.
- Heating rate versus header pressure.
- Steam per dyeing batch atau kilogram kain.
- Batch delay akibat keterbatasan steam.
- Simultaneous demand dari beberapa Jetflow.

### 10.6 Analisis Kalender

- Steam demand upper dan lower jika dapat dipisahkan.
- Waktu mencapai temperature target.
- Temperature stability versus steam condition.
- Steam per finishing run atau unit output.
- Recovery setelah stop.

---

## 11. Thermal Oil Boiler Concept

Boiler oil memasok thermal oil ke Dryer. Istilah final dan jenis fluida perlu dikonfirmasi berdasarkan sistem aktual.

### 11.1 Supply-consumer mapping

**Thermal Oil Boiler → Supply Header / Pumping Loop → Dryer → Chamber Heating → Return Header → Thermal Oil Boiler**

### 11.2 Kandidat data boiler oil

- Boiler state dan mode.
- Supply temperature.
- Return temperature.
- Temperature difference.
- Thermal oil flow.
- Pump status.
- Pressure jika diukur.
- Fuel atau energy consumption.
- Boiler load.
- Alarm, warning, dan trip.
- Operating hour dan start count.

### 11.3 Kandidat data Dryer

- Thermal oil supply dan return temperature di Dryer.
- Flow atau valve position per Dryer.
- Heating command per chamber.
- Chamber temperature actual dan setpoint.
- Dryer speed.
- Moisture output jika tersedia.

### 11.4 Analisis yang direncanakan

- Supply-return temperature difference.
- Heating performance per Dryer dan chamber.
- Thermal energy per roll, meter, atau kilogram kain.
- Boiler oil load versus jumlah Dryer yang running.
- Temperature recovery setelah stop.
- Simultaneous demand dan capacity constraint.
- Deteksi penurunan heat transfer atau circulation.

---

## 12. Utility Consumption Record

Setiap batch atau process run perlu memiliki utility summary.

| Domain | Data ringkasan |
|---|---|
| Electrical | Start energy, end energy, consumption, peak power |
| Water | Start totalizer, end totalizer, consumption |
| Steam | Consumption atau allocation, pressure context |
| Thermal oil | Supply-return condition dan estimated energy bila tersedia |
| Production | Machine, batch, recipe, start, end, output |
| Quality | Good output, rework, reject, disposition |

Utility summary sebaiknya dihitung setelah process run selesai dan dapat dihitung ulang apabila meter data diperbaiki.

---

## 13. Utility Intensity dan Baseline

Total consumption tidak cukup untuk membandingkan efisiensi. Sistem perlu menghitung consumption intensity dengan denominator yang sesuai.

Kandidat denominator:

- Per batch.
- Per roll.
- Per meter kain.
- Per kilogram kain.
- Per unit good output.
- Per operating hour.

Baseline perlu dipisahkan berdasarkan:

- Machine.
- Article atau jenis kain.
- Recipe.
- Nomor warna atau kelompok warna jika berpengaruh.
- Batch size.
- Shift.
- Operating state.

Satu baseline untuk seluruh mesin dan produk berisiko menghasilkan alarm atau rekomendasi yang salah.

---

## 14. Peak Demand dan Capacity Monitoring

Sistem perlu mengetahui beban saat ini terhadap kapasitas distribution point dan utility source.

### Electrical

- Active power saat ini.
- Peak demand period.
- Capacity utilization cubicle, MDP, dan SDP.
- Machine contribution terhadap peak.

### Steam

- Boiler load.
- Header pressure.
- Concurrent Jetflow heating.
- Concurrent Kalender heating.

### Thermal oil

- Boiler oil load.
- Jumlah Dryer running.
- Chamber heating demand.
- Supply-return condition.

### Water

- Main dan branch flow.
- Concurrent filling atau washing demand.
- Capacity constraint jika tersedia.

Capacity rating final perlu berasal dari engineering document, bukan perkiraan dashboard.

---

## 15. Data Quality dan Time Alignment

Energy balance dan utility allocation sangat bergantung pada timestamp yang konsisten.

Setiap data perlu memiliki:

- Source timestamp.
- Data quality.
- Communication status.
- Last update time.
- Unit.
- Multiplier atau ratio configuration.
- Meter reset atau rollover event.
- Calibration atau verification date.

Masalah yang harus dideteksi:

- Stale data.
- Missing interval.
- Counter reset.
- Counter rollover.
- Negative consumption yang tidak valid.
- Spike atau nilai di luar physical range.
- Unit mismatch.
- CT atau PT ratio configuration issue.
- Duplicate meter mapping.

---

## 16. Alarm dan Abnormal Condition

### Electrical alarm kandidat

- Overload cubicle, MDP, SDP, atau machine feeder.
- Voltage terlalu tinggi atau rendah.
- Current imbalance.
- Low power factor.
- Demand mendekati limit.
- Breaker trip.
- Meter communication loss.
- Abnormal energy consumption.

### Water alarm kandidat

- Flow ketika mesin idle atau offline.
- Consumption melebihi recipe baseline.
- Flow atau pressure rendah jika diukur.
- Meter communication loss.

### Steam alarm kandidat

- Boiler unavailable atau trip.
- Header pressure terlalu rendah atau tinggi.
- Steam production tidak mencukupi demand.
- Consumer flow abnormal.
- Temperature atau heating performance menurun.

### Thermal oil alarm kandidat

- Boiler oil unavailable atau trip.
- Supply temperature terlalu rendah atau tinggi.
- Return temperature abnormal.
- Flow atau circulation rendah.
- Pump trip.
- Dryer heating demand tidak terpenuhi.

Batas alarm final harus mengikuti engineering design, equipment manual, operating procedure, dan safety review.

---

## 17. Root Cause dan Impact Analysis

Saat mesin mengalami gangguan proses, sistem perlu memeriksa kondisi utility pada waktu yang sama.

### Contoh Jetflow

Jika heating rate lambat:

- Periksa steam header pressure.
- Periksa boiler load dan alarm.
- Periksa Jetflow lain yang meminta steam bersamaan.
- Periksa steam valve dan temperature response mesin.

### Contoh Kalender

Jika upper atau lower temperature tidak stabil:

- Periksa steam supply.
- Periksa valve command-feedback.
- Periksa demand Kalender lain dan Jetflow.
- Periksa sensor serta heating equipment.

### Contoh Dryer

Jika chamber tidak mencapai target:

- Periksa thermal oil boiler state.
- Periksa supply-return temperature.
- Periksa pump, flow, valve, dan concurrent Dryer demand.
- Periksa chamber heating system dan sensor.

### Contoh electrical

Jika mesin trip atau performance turun:

- Periksa feeder, SDP, MDP, dan cubicle upstream.
- Periksa voltage, current, imbalance, dan event.
- Periksa apakah gangguan terjadi pada consumer lain di jalur sama.

Sistem menampilkan kandidat penyebab dan impacted consumer, tetapi keputusan final memerlukan validasi teknis.

---

## 18. Utility Cost Allocation

Pada tahap lanjut, konsumsi dapat dikonversi menjadi biaya apabila struktur tarif dan metode alokasi telah disetujui.

Kandidat alokasi:

- Biaya listrik per machine dan process run.
- Biaya water per batch.
- Biaya steam per Jetflow batch atau Kalender run.
- Biaya thermal oil heating per Dryer run.
- Total utility cost per article atau customer order.
- Utility cost per good output.

Biaya tidak boleh dihitung hanya dari total konsumsi jika tariff memiliki demand charge, time-of-use, fuel variation, atau komponen lain yang belum dimodelkan.

---

## 19. KPI Utilitas Konseptual

### Electrical

- Total energy dan peak demand.
- Energy per good output.
- Power factor.
- Cubicle, MDP, dan SDP capacity utilization.
- Energy balance difference.
- Metering coverage.
- Idle energy percentage.

### Water

- Total water consumption.
- Water per batch, meter, atau kilogram kain.
- Base flow dan suspected leakage.
- Water balance difference.

### Steam

- Steam production dan consumption.
- Steam per Jetflow batch.
- Steam per Kalender run.
- Peak steam demand.
- Header pressure compliance.
- Boiler availability.

### Thermal oil

- Boiler oil availability.
- Supply-return temperature difference.
- Heating utility per Dryer run.
- Thermal oil demand versus Dryer output.
- Pump dan circulation availability.

### Cross-domain

- Total utility cost per good output.
- Utility deviation from baseline.
- Production loss caused by utility constraint.
- Utility-related alarm dan downtime.

Formula final dan target belum ditetapkan.

---

## 20. Konsep Dashboard Utilitas

### Plant utility overview

- Status listrik, water, steam boiler, dan thermal oil boiler.
- Current consumption dan daily total.
- Peak demand.
- Active alarm dan affected area.
- Utility intensity terhadap output.
- Data quality dan metering coverage.

### Electrical single-line view

- Cubicle → MDP → SDP → machine.
- Live power dan energy.
- Breaker status jika tersedia.
- Capacity utilization.
- Alarm dan downstream impact.
- Energy balance per node.

### Machine utility view

- Electrical power dan energy.
- Water flow dan consumption.
- Steam atau thermal oil context sesuai machine type.
- State, batch, recipe, output, dan quality.
- Actual consumption versus baseline.

### Steam utility view

- Boiler state dan load.
- Header pressure dan flow.
- Jetflow dan Kalender demand.
- Trend, balance, peak, dan alarm.

### Thermal oil view

- Boiler oil state dan load.
- Supply-return temperature.
- Pump dan loop status.
- Dryer demand dan chamber performance.
- Trend, alarm, dan utility intensity.

### Water view

- Main, branch, dan machine flow.
- Totalizer dan consumption.
- Water balance.
- Batch consumption dan anomaly.

---

## 21. Peluang Analitik dan AI

### Tahap awal

- Consumption baseline per machine dan state.
- Detection of idle energy dan abnormal water flow.
- Energy balance dan missing meter detection.
- Utility-related production loss analysis.

### Tahap menengah

- Forecast electrical demand.
- Forecast steam demand dari schedule Jetflow dan Kalender.
- Forecast thermal oil demand dari schedule Dryer.
- Forecast water demand dari batch recipe.
- Anomaly detection meter dan equipment utility.
- Utility cost allocation.

### Tahap lanjutan

- Rekomendasi production scheduling untuk meratakan peak demand.
- Koordinasi Jetflow dan Kalender terhadap kapasitas steam.
- Koordinasi Dryer terhadap thermal oil load.
- Optimisasi setpoint utility yang tetap berada dalam safety limit.
- Predictive maintenance boiler, pump, meter, dan distribution equipment.
- Utility-aware production optimization.

AI tidak mengendalikan boiler, breaker, valve, pump, atau mesin secara langsung pada tahap awal. Rekomendasi harus melalui review, approval, interlock, operating limit, dan safety validation.

---

## 22. Safety dan Cybersecurity

Utility system merupakan infrastructure kritis. Prinsip awal:

- Monitoring dimulai read-only.
- Sistem dashboard tidak menggantikan proteksi lokal.
- Boiler safety system, burner management, interlock, dan trip tetap independen.
- Electrical protection dan breaker trip tetap mengikuti sistem proteksi resmi.
- PLC atau controller tidak dihubungkan langsung ke jaringan umum.
- Command future memerlukan role, approval, audit, hard limit, dan fail-safe.
- Semua perubahan konfigurasi meter dan asset mapping dicatat.
- Remote access mengikuti prosedur OT cybersecurity.

---

## 23. Tahapan Implementasi

### UT-0 — Survey dan topology mapping

- Kumpulkan single-line diagram electrical.
- Petakan cubicle, MDP, SDP, feeder, dan machine.
- Petakan water distribution.
- Petakan steam boiler, header, branch, Jetflow, dan Kalender.
- Petakan thermal oil boiler, loop, Dryer, dan chamber.
- Inventarisasi meter, PLC, protocol, dan network.

### UT-1 — Main utility visibility

- Meter utama cubicle, MDP, SDP, water, steam boiler, dan oil boiler.
- Live status, trend, alarm, historian, dan communication health.

### UT-2 — Machine metering

- Energy meter tiap mesin.
- Water meter tiap mesin.
- Steam dan thermal oil consumption point sesuai ketersediaan.
- Supply path mapping.

### UT-3 — Production context

- Hubungkan utility dengan machine state, batch, recipe, output, dan quality.
- Bangun utility summary per process run.

### UT-4 — Balance dan analytics

- Electrical dan water balance.
- Steam serta thermal oil performance.
- Baseline, anomaly, loss, dan cost allocation.

### UT-5 — Optimization

- Demand forecast.
- Utility-aware scheduling.
- Recommendation dan controlled optimization setelah safety validation.

---

## 24. Acceptance Criteria Pilot Awal

Pilot utilitas dapat dianggap berhasil apabila:

1. Satu supply path cubicle–MDP–SDP–machine dipetakan benar.
2. Meter utama dan machine meter memiliki timestamp serta unit konsisten.
3. Communication dan data quality terlihat jelas.
4. Consumption mesin dapat dipisahkan berdasarkan state.
5. Consumption dapat dihubungkan dengan satu batch atau process run.
6. Satu machine water consumption dapat dihitung.
7. Steam boiler state dapat dihubungkan dengan Jetflow atau Kalender demand.
8. Thermal oil boiler state dapat dihubungkan dengan Dryer demand.
9. Energy balance menampilkan metered dan unmetered portion.
10. Operator utility dan engineering memvalidasi hasil terhadap meter aktual.

---

## 25. Informasi yang Diperlukan untuk v1.1

### Electrical

- Single-line diagram.
- Jumlah dan nama cubicle, MDP, serta SDP.
- Hubungan feeder sampai tiap mesin.
- Meter brand, model, protocol, dan existing tag.
- CT atau PT ratio dan meter configuration.
- Capacity atau rating setiap distribution point.
- Tarif listrik bila cost analysis dibutuhkan.

### Water

- Sumber air dan distribution diagram.
- Main, branch, serta machine meter.
- Meter brand, model, unit, dan protocol.
- Proses mesin yang menggunakan air.
- Baseline atau recipe expectation bila tersedia.

### Steam boiler

- Jumlah, vendor, model, kapasitas, fuel, PLC, dan protocol.
- Steam distribution diagram.
- Header, branch, valve, flow meter, dan condensate system.
- Daftar Jetflow dan Kalender consumer.
- Operating limit dan alarm philosophy.

### Thermal oil boiler

- Jumlah, vendor, model, kapasitas, fuel, PLC, dan protocol.
- Jenis thermal oil.
- Supply-return loop diagram.
- Pump, valve, flow meter, dan temperature sensor.
- Daftar Dryer consumer dan chamber heating structure.
- Operating limit dan alarm philosophy.

### Production context

- Satuan output resmi per machine type.
- Batch, recipe, dan state mapping.
- Shift calendar.
- Definisi idle, production, setup, hold, dan maintenance.

---

## 26. Keputusan Baseline Utility v1.0

1. Cubicle, MDP, SDP, dan machine meter membentuk electrical hierarchy.
2. Meter utama menjadi reference dan machine meter menjadi detail consumption.
3. Energy balance selalu menampilkan metering coverage dan data quality.
4. Setiap mesin direncanakan memiliki energy monitoring.
5. Air proses dimonitor per mesin dan dikaitkan dengan batch atau run.
6. Steam boiler memasok Jetflow dan Kalender.
7. Thermal oil boiler memasok Dryer.
8. Utility consumption dikaitkan dengan machine state, recipe, output, dan quality.
9. Utility intensity menggunakan denominator yang sesuai per proses.
10. Implementasi dimulai read-only dan proteksi lokal tetap independen.

---

## 27. Batasan Versi Ini

Versi ini belum menetapkan topology final, jumlah asset, kapasitas, vendor, protocol, tag, meter accuracy, tariff, utility limit, alarm setpoint, formula cost, atau tindakan kontrol. Semua detail memerlukan drawing aktual, survey, data engineering, serta persetujuan utility, electrical, production, maintenance, OT, cybersecurity, dan safety.

