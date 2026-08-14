# Konsep Mesin Dryer

**Versi:** 1.0  
**Status:** Baseline konseptual awal  
**Tanggal:** 14 Agustus 2026  
**Kategori proses:** Pengeringan kain  
**Proses sebelumnya:** Calator  
**Proses berikutnya:** Kalender  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Catatan:** Jumlah chamber, sumber pemanas, sequence, tag, satuan, dan operating window masih harus dikonfirmasi berdasarkan mesin aktual.

---

## 1. Ringkasan Mesin

Dryer merupakan mesin pengering lanjutan setelah proses Calator. Tujuan utamanya adalah mengeringkan kain secara berkelanjutan dari bagian awal hingga akhir material sebelum kain diteruskan ke Kalender.

Kain bergerak melewati beberapa chamber. Setiap chamber memiliki parameter temperatur yang perlu dimonitor karena kondisi panas sepanjang lintasan pengeringan menentukan apakah kain menerima proses pengeringan yang cukup dan merata.

Dua kelompok parameter kritis awal adalah:

- Speed kain atau mesin.
- Temperatur pada masing-masing chamber.

Speed mempunyai dua fungsi utama:

1. Menentukan waktu kain berada di dalam lintasan pengeringan.
2. Menjadi dasar perhitungan output produksi.

Speed yang terlalu tinggi dapat mempersingkat waktu pengeringan. Speed yang terlalu rendah dapat meningkatkan waktu pengeringan tetapi menurunkan throughput dan berpotensi memberikan paparan panas berlebih. Dampak aktual harus divalidasi berdasarkan jenis kain, kondisi kain masuk, panjang lintasan, temperatur chamber, dan hasil QC.

---

## 2. Informasi yang Sudah Dikonfirmasi

Baseline menggunakan informasi berikut sebagai fakta awal:

1. Dryer merupakan proses lanjutan setelah Calator.
2. Tujuan Dryer adalah mengeringkan kain dari awal sampai akhir.
3. Speed merupakan parameter penting.
4. Speed menjadi penentu output hasil kain.
5. Dryer memiliki beberapa chamber.
6. Temperatur perlu dimonitor untuk setiap chamber.

Detail lain dalam dokumen ini merupakan rancangan konseptual yang perlu diperiksa terhadap proses dan mesin aktual.

---

## 3. Posisi Dryer dalam Digital Thread

Hubungan data konseptual:

**Customer Order → Identitas Kain → Lot / Roll → Jetflow History → Calator Process Run → Dryer Process Run → Kalender Process Run → Finishing QC**

Sistem harus mempertahankan identitas kain ketika berpindah dari Calator ke Dryer dan kemudian ke Kalender.

Dengan hubungan ini, sistem diharapkan dapat menjawab:

- Roll atau batch mana yang sedang diproses di Dryer?
- Calator mana yang memproses kain sebelumnya?
- Recipe dan chemical apa yang digunakan sebelumnya?
- Setup Dryer apa yang digunakan untuk jenis kain tersebut?
- Berapa speed setpoint dan actual sepanjang roll?
- Berapa temperatur setpoint dan actual setiap chamber?
- Apakah semua chamber stabil dan seimbang?
- Berapa lama kain berada di dalam area pengeringan?
- Berapa output aktual yang dihasilkan?
- Apakah terdapat stop, slowdown, alarm, atau perubahan setting?
- Bagaimana kondisi kain ketika keluar dari Dryer dan masuk ke Kalender?

---

## 4. Handover Calator ke Dryer

Material handover perlu mencatat:

- Customer dan production order.
- Article atau jenis kain.
- Lot, batch, dan roll.
- Nomor warna bila relevan.
- Calator sumber dan process run ID.
- Recipe pencucian serta chemical atau softener yang digunakan.
- Waktu selesai Calator.
- Input quantity, panjang, atau berat.
- Dryer tujuan.
- Waktu antre dan waktu mulai Dryer.
- Operator dan shift.

### 4.1 Kandidat kondisi kain masuk

Data berikut perlu dievaluasi karena dapat memengaruhi proses pengeringan:

- Moisture kain masuk.
- Temperatur kain masuk.
- Lebar dan gramasi kain.
- Kandungan water pickup.
- Speed proses sebelumnya.
- Hasil quality check sementara.

Data ini belum dikonfirmasi tersedia. Tanpa kondisi input, analisis Dryer tidak dapat membedakan masalah pengeringan dari variasi material yang masuk.

---

## 5. Handover Dryer ke Kalender

Ketika kain keluar dari Dryer, sistem perlu mencatat:

- Dryer process run ID.
- Roll atau batch.
- Waktu keluar.
- Output quantity.
- Speed dan temperature summary.
- Alarm atau deviation selama pengeringan.
- Kondisi kain keluar jika diukur.
- Kalender tujuan.
- Waktu antre menuju Kalender.

Kondisi output Dryer akan menjadi input context untuk analisis Kalender. Jika hasil Kalender tidak sesuai, sistem dapat memeriksa apakah kain sudah terlalu kering, kurang kering, atau menerima profil panas yang tidak konsisten sebelum masuk ke Kalender.

---

## 6. Dryer Process Run Record

Setiap run Dryer perlu memiliki satu record yang mengikat material, setup, speed, temperatur chamber, event, output, dan kualitas.

| Kelompok | Informasi minimum |
|---|---|
| Order | Customer, order, dan production order |
| Material | Article, lot, roll, batch, quantity |
| Upstream | Calator ID, process run, recipe, dan waktu selesai |
| Setup | Dryer setup ID dan version |
| Speed | Setpoint, actual, average, minimum, maximum |
| Chamber | Setpoint dan actual temperature setiap chamber |
| Execution | Dryer ID, start, end, operator, dan shift |
| Output | Counter, panjang, berat, atau roll hasil |
| Event | Start, stop, slowdown, alarm, override, setup change |
| Quality | Kondisi dryness atau moisture dan disposition jika tersedia |

---

## 7. Setup atau Recipe Dryer

Setup Dryer dapat berbeda berdasarkan article, jenis kain, kondisi kain masuk, dan target output.

Struktur konseptual:

- Setup ID dan version.
- Article atau product family.
- Nomor warna atau process family bila relevan.
- Target speed dan tolerance.
- Setpoint temperature per chamber.
- Tolerance temperature per chamber.
- Target residence time bila digunakan.
- Target moisture output bila diukur.
- Airflow, fan, exhaust, atau damper setting jika tersedia.
- Heating source setting jika berlaku.
- Approval status dan masa berlaku.

### 7.1 Setup versioning

Perubahan speed, temperature profile, atau parameter lainnya menghasilkan version baru. History run menunjuk ke version yang benar-benar digunakan.

### 7.2 Planned versus actual

Untuk setiap run, sistem membandingkan:

- Target dan actual speed.
- Setpoint dan actual temperature per chamber.
- Average, minimum, maximum, dan variability.
- Durasi di luar tolerance.
- Manual override dan perubahan setup.
- Hasil output dan quality terhadap target.

---

## 8. Tahapan Operasi Konseptual

Sequence berikut merupakan model awal:

1. Roll atau batch diidentifikasi.
2. Kondisi hasil Calator diverifikasi.
3. Dryer dan setup dipilih.
4. Heating system dan chamber disiapkan.
5. Setiap chamber mencapai kondisi ready.
6. Kain dimasukkan atau dilakukan threading.
7. Mesin mulai berjalan.
8. Speed dinaikkan menuju target.
9. Kain melewati chamber dari awal sampai akhir.
10. Speed dan temperatur setiap chamber dimonitor.
11. Kain keluar dari Dryer.
12. Output direkonsiliasi.
13. Process run diselesaikan.
14. Kain diteruskan ke Kalender.

### 8.1 Machine state konseptual

- Offline.
- Ready.
- Heating.
- Loading atau Threading.
- Preparing.
- Running.
- Slow Running.
- Paused.
- Cooling Down.
- Unloading.
- Completed.
- Idle.
- Hold.
- Fault.
- Cleaning.
- Maintenance.

State final perlu dipetakan terhadap status PLC dan HMI aktual.

---

## 9. Speed sebagai Critical Process Parameter

Speed harus disimpan sebagai time-series karena perubahan speed sepanjang roll memengaruhi residence time, tingkat pengeringan, dan output.

### 9.1 Data speed

- Speed setpoint dan actual.
- Engineering unit.
- Average, minimum, dan maximum speed.
- Waktu mencapai target.
- Durasi di bawah atau di atas tolerance.
- Acceleration dan deceleration event jika relevan.
- Slow-running duration.
- Stop count dan duration.
- Alasan perubahan speed atau stop.

### 9.2 Hubungan speed dengan waktu pengeringan

Jika panjang lintasan efektif diketahui, sistem dapat memperkirakan residence time kain di dalam Dryer.

Hubungan konseptual:

**Speed meningkat → residence time menurun → kapasitas output meningkat → risiko pengeringan tidak cukup perlu dievaluasi**

**Speed menurun → residence time meningkat → output menurun → risiko paparan panas berlebih perlu dievaluasi**

Hubungan ini dipengaruhi oleh temperatur chamber, moisture input, airflow, jenis kain, gramasi, lebar, dan efisiensi perpindahan panas.

### 9.3 Speed operating window

Target speed dapat berbeda berdasarkan:

- Article atau jenis kain.
- Gramasi dan lebar kain.
- Moisture input.
- Setup temperature chamber.
- Target moisture output.
- Proses berikutnya.

Operating window final harus diperoleh dari recipe, pengalaman proses, dan hasil quality.

---

## 10. Temperatur Multi-Chamber

Setiap chamber diperlakukan sebagai zone yang memiliki identitas, setpoint, actual value, dan status sendiri.

Contoh struktur konseptual:

- Chamber 01.
- Chamber 02.
- Chamber 03.
- Chamber berikutnya sesuai konfigurasi aktual.

Jumlah chamber tidak ditetapkan dalam versi ini.

### 10.1 Data per chamber

- Chamber ID dan urutan posisi.
- Temperature setpoint dan actual.
- Heating command dan status jika tersedia.
- Average, minimum, dan maximum.
- Waktu mencapai target.
- Durasi di luar tolerance.
- Heating ready status.
- Alarm dan sensor quality.

### 10.2 Temperature profile

Sistem perlu melihat temperatur sebagai profile sepanjang arah perjalanan kain. Setpoint setiap chamber tidak harus sama. Setup dapat dirancang untuk pemanasan bertahap, mempertahankan panas, atau mengatur kondisi akhir sesuai kebutuhan aktual.

Analisis yang direncanakan:

- Actual versus setpoint setiap chamber.
- Stabilitas temperatur chamber selama run.
- Chamber terlalu lambat mencapai target.
- Overshoot dan undershoot.
- Selisih antar-chamber.
- Chamber yang konsisten lebih dingin atau panas.
- Recovery time setelah stop atau door opening jika berlaku.
- Perbandingan profile dengan golden run.

### 10.3 Chamber imbalance

Nilai rata-rata temperatur seluruh Dryer tidak cukup untuk menunjukkan masalah. Satu chamber yang abnormal dapat memengaruhi bagian proses tertentu walaupun rata-rata total terlihat normal.

Dashboard perlu menampilkan:

- Temperature deviation per chamber.
- Chamber terpanas dan terdingin.
- Spread atau selisih maksimum.
- Durasi imbalance.
- Kontribusi tiap chamber terhadap overall profile compliance.

---

## 11. Interaksi Speed dan Temperatur

Speed dan temperatur tidak boleh dianalisis secara terpisah. Kombinasi keduanya menentukan paparan panas yang diterima kain.

Contoh kondisi yang perlu dievaluasi:

| Speed | Temperature | Potensi kondisi |
|---|---|---|
| Tinggi | Rendah | Risiko kain kurang kering |
| Tinggi | Tinggi | Output tinggi, tetapi quality dan batas material perlu dipantau |
| Rendah | Tinggi | Risiko paparan panas berlebih |
| Rendah | Rendah | Output rendah dan hasil tetap dapat kurang kering |

Tabel tersebut hanya kerangka analisis. Keputusan aktual memerlukan data moisture, article, setup, dan hasil QC.

Sistem perlu membangun baseline per jenis kain, bukan menggunakan satu hubungan yang sama untuk seluruh produk.

---

## 12. Konsep Perhitungan Output

### 12.1 Output berbasis panjang

Jika speed menggunakan satuan panjang per waktu, estimasi panjang produksi dapat diperoleh dari akumulasi speed aktual selama mesin efektif berjalan.

Perhitungan perlu mempertimbangkan:

- Effective running time.
- Variasi speed terhadap waktu.
- Stop, idle, dan slowdown.
- Encoder atau length counter.
- Kain ketika threading.
- Material yang masih berada di mesin.
- Rework atau pengulangan proses.

### 12.2 Output berbasis berat

Jika satuan resmi menggunakan kilogram, dibutuhkan actual weight atau metode konversi yang disepakati. Data pendukung dapat mencakup panjang, lebar, gramasi, dan kondisi moisture.

Konversi tidak boleh menjadi angka resmi sebelum basis perhitungannya divalidasi.

### 12.3 Output reconciliation

- Planned quantity.
- Input quantity.
- Machine counter.
- Good output.
- Rework.
- Reject atau loss.
- Quantity yang masih berada di Dryer.

### 12.4 Output rate

- Instantaneous rate berdasarkan speed saat ini.
- Effective rate setelah stop dan slowdown.
- Average rate untuk seluruh run.
- Good output rate setelah quality disposition.

---

## 13. Moisture sebagai Kandidat Critical Quality Parameter

Tujuan Dryer adalah mengeringkan kain, sehingga moisture merupakan kandidat data penting. Namun, ketersediaan sensor dan standar pengukurannya belum dikonfirmasi.

### 13.1 Kandidat moisture data

- Moisture inlet.
- Moisture outlet.
- Target moisture.
- Average, minimum, dan maximum.
- Posisi measurement.
- Sensor quality dan calibration status.
- Hasil pengukuran manual atau laboratory.

### 13.2 Analisis moisture

- Moisture reduction dari inlet ke outlet.
- Hubungan speed dan temperature profile terhadap moisture outlet.
- Bagian roll yang terlalu basah atau terlalu kering.
- Stabilitas moisture sepanjang run.
- Pengaruh moisture output Dryer terhadap hasil Kalender.

Jika belum tersedia sensor online, tahap awal dapat menggunakan sample manual yang diberi timestamp atau posisi roll.

---

## 14. Kandidat Parameter Tambahan

| Kandidat data | Potensi fungsi |
|---|---|
| Length counter / encoder | Output dan positional mapping |
| Moisture inlet / outlet | Efektivitas pengeringan |
| Air temperature per chamber | Profile termal aktual |
| Airflow, fan speed, atau damper | Distribusi panas dan drying performance |
| Exhaust temperature / humidity | Efisiensi pengeringan |
| Heating command / valve position | Respons temperature control |
| Steam, gas, atau energy consumption | Utility efficiency |
| Fabric width dan tension | Kualitas dan kestabilan running |
| Motor current dan load | Equipment health |
| Door atau access status | Penyebab temperature disturbance |

Sumber pemanas belum dikonfirmasi. Steam, gas, listrik, thermal oil, atau sumber lain hanya boleh didokumentasikan sebagai aktual setelah survey.

---

## 15. Equipment Hierarchy Awal

Placeholder hierarchy:

**Dryer Machine**

- Fabric feeding atau entry system.
- Main transport atau conveyor system.
- Drive motor dan transmission.
- Chamber 01 sampai chamber terakhir.
- Temperature sensor per chamber.
- Heating system per chamber.
- Fan dan air circulation jika tersedia.
- Exhaust dan damper jika tersedia.
- Fabric output atau take-up system.
- Encoder atau length counter.
- Safety dan interlock system.
- PLC atau machine controller.

Setiap chamber perlu menjadi child asset agar alarm, sensor, maintenance, dan performance dapat dianalisis secara individual.

---

## 16. Prioritas Data

### Priority 1 — Baseline wajib

| Data | Fungsi |
|---|---|
| Machine ID dan state | Identitas serta kondisi Dryer |
| Roll, lot, atau batch ID | Traceability kain |
| Calator source | Hubungan proses sebelumnya |
| Setup ID dan version | Standar pengeringan |
| Speed setpoint dan actual | Parameter proses dan output |
| Temperature setpoint per chamber | Target profile |
| Temperature actual per chamber | Kondisi termal aktual |
| Start, stop, dan end time | Timeline process run |
| Alarm dan event | Analisis abnormal condition |
| Machine counter jika tersedia | Rekonsiliasi output |

### Priority 2 — Sangat disarankan

- Moisture inlet dan outlet.
- Heating command atau status per chamber.
- Fan, airflow, dan exhaust data.
- Operator dan shift.
- Stop reason dan slowdown reason.
- Manual override dan setup change.
- Input serta output quantity.
- Kalender destination.

### Priority 3 — Analitik lanjutan

- Utility atau energy consumption.
- Fabric width dan tension.
- Motor current, power, vibration, dan bearing temperature.
- Exhaust humidity.
- High-frequency drive atau airflow data.

---

## 17. Alarm dan Abnormal Condition

### Process alarm

- Speed terlalu tinggi atau rendah.
- Speed tidak stabil.
- Mesin gagal mencapai target speed.
- Temperature chamber terlalu tinggi atau rendah.
- Chamber gagal mencapai target tepat waktu.
- Temperature profile tidak seimbang.
- Stop atau slowdown tidak direncanakan.
- Moisture outlet di luar target jika tersedia.

### Equipment alarm kandidat

- Heating fault per chamber.
- Temperature sensor fault.
- Fan atau exhaust trip.
- Drive atau motor fault.
- Encoder atau counter fault.
- Communication loss.
- Door atau access interlock.
- Safety interlock active.

### Quality risk warning

- Kombinasi speed tinggi dan temperatur rendah.
- Kombinasi speed rendah dan temperatur tinggi.
- Satu atau beberapa chamber mengalami deviation terlalu lama.
- Kondisi kain masuk tidak sesuai setup.
- Pola proses menyerupai run historis yang menghasilkan quality problem.

Batas alarm final harus ditentukan melalui engineering review dan alarm rationalization.

---

## 18. Positional Process Mapping

Karena kain bergerak dari awal sampai akhir, parameter perlu dapat dipetakan ke posisi sepanjang roll.

Kandidat metode:

- Length counter.
- Encoder position.
- Timestamp dan speed integration.
- Segment ID.
- Marker atau sample event.

Dengan positional mapping, sistem dapat mengetahui bagian roll mana yang melewati Dryer ketika chamber tertentu mengalami masalah.

Contoh penggunaan:

- Chamber 03 berada di bawah target selama lima menit.
- Sistem menghitung segmen kain yang melewati chamber tersebut.
- Segmen diberi quality-risk flag.
- QC dapat mengambil sample pada posisi yang relevan.
- Hasil QC dikembalikan ke timeline process run.

---

## 19. Konsep Root Cause Analysis

Jika kain kurang kering, terlalu kering, atau hasil Kalender berikutnya tidak sesuai, investigation view perlu menggabungkan:

1. Customer, article, lot, roll, dan batch.
2. Riwayat Jetflow dan Calator.
3. Kondisi kain masuk Dryer.
4. Dryer setup dan version.
5. Speed profile sepanjang roll.
6. Temperature profile setiap chamber.
7. Moisture input dan output jika tersedia.
8. Fan, airflow, exhaust, dan heating status jika tersedia.
9. Stop, slowdown, alarm, dan override.
10. Posisi segmen kain terdampak.
11. Kondisi kain masuk Kalender.
12. Hasil QC dan perbandingan dengan golden run.

### Kandidat penyebab

- Speed terlalu tinggi atau rendah.
- Satu atau beberapa chamber tidak mencapai target.
- Temperature profile tidak sesuai setup.
- Heating, fan, airflow, atau exhaust bermasalah.
- Moisture kain masuk terlalu tinggi atau tidak stabil.
- Sensor temperatur atau speed tidak valid.
- Setup tidak sesuai article.
- Gangguan berasal dari proses Calator sebelumnya.

Sistem memberikan kandidat dan bukti. Penyebab final mengikuti workflow investigasi dan approval.

---

## 20. KPI Dryer Konseptual

### Produksi

- Output panjang atau berat per shift.
- Average dan effective speed.
- Effective running time.
- Throughput.
- Availability dan utilization.
- Stop count dan duration.
- Target attainment.

### Process

- Speed compliance.
- Temperature compliance per chamber.
- Overall temperature profile compliance.
- Chamber imbalance.
- Setup adherence.
- Manual override count.

### Quality

- Moisture compliance jika tersedia.
- First pass quality.
- Under-dry dan over-dry occurrence.
- Rework dan hold rate.
- Quality risk length.

### Utility dan equipment

- Energy atau heating utility per meter, kilogram, roll, atau run.
- Heating time dan recovery time.
- Chamber alarm frequency.
- Unplanned downtime.

Formula final dan target belum ditetapkan.

---

## 21. Konsep Tampilan Dashboard

### Dryer fleet overview

- Semua Dryer dan state.
- Roll atau batch aktif.
- Calator sumber dan Kalender tujuan.
- Setup aktif.
- Speed setpoint versus actual.
- Temperature summary seluruh chamber.
- Output, progress, estimated completion, dan alarm.

### Machine detail

- Machine state dan communication health.
- Material, setup, operator, dan shift.
- Live speed dan output counter.
- Chamber heatmap: setpoint, actual, dan deviation.
- Temperature trend per chamber.
- Moisture inlet dan outlet jika tersedia.
- Stop, alarm, dan override timeline.

### Process run history

- Handover dari Calator.
- Planned versus actual speed.
- Temperature profile setiap chamber.
- Positional deviation map.
- Output reconciliation.
- Kondisi output menuju Kalender.
- Hasil QC dan disposition.

### Comparison view

- Perbandingan run dengan article dan setup sama.
- Perbandingan antar-Dryer.
- Golden run overlay.
- Run pass versus rework.

---

## 22. Peluang Analitik dan AI

### Tahap awal

- Deteksi speed dan temperature deviation.
- Perhitungan output otomatis.
- Chamber imbalance detection.
- Quality-risk segment marking.
- Loss analysis akibat stop dan slowdown.

### Tahap menengah

- Prediksi moisture output dari speed dan chamber profile.
- Prediksi waktu selesai roll.
- Rekomendasi speed berdasarkan article dan kondisi input.
- Deteksi penurunan performa heating, fan, atau chamber.
- Energy baseline dan anomaly detection.

### Tahap lanjutan

- Optimisasi kombinasi speed dan temperature profile.
- Feed-forward setup berdasarkan kondisi output Calator.
- Feed-forward context menuju Kalender.
- Prediksi kualitas sebelum QC selesai.
- Predictive maintenance.
- Controlled write-back setelah safety dan quality validation.

AI tidak mengubah speed atau temperature setpoint secara langsung pada tahap awal. Rekomendasi harus menunjukkan data, faktor, confidence, limit, dan approval.

---

## 23. Tahapan Implementasi

### DR-0 — Survey

- Verifikasi jumlah Dryer, vendor, model, chamber, sumber pemanas, PLC, HMI, sequence, sensor, dan quality check.
- Pilih satu Dryer pilot.

### DR-1 — Visibility

- State, material, setup, speed, temperature per chamber, alarm, historian, dan communication health.

### DR-2 — Traceability dan output

- Handover Calator, roll tracking, output calculation, stop reason, operator, dan handover Kalender.

### DR-3 — Quality, utility, dan equipment

- Moisture, airflow, heating utility, chamber hierarchy, motor, fan, serta maintenance.

### DR-4 — Analytics

- Golden run, positional mapping, multivariable analysis, root cause assistance, dan quality prediction.

### DR-5 — Optimization

- Speed-temperature recommendation, energy optimization, feed-forward, dan controlled write-back setelah validasi.

---

## 24. Acceptance Criteria Pilot Awal

Pilot dianggap berhasil apabila:

1. Machine state dapat dibaca konsisten.
2. Roll atau batch aktif terhubung ke Dryer yang benar.
3. Hubungan ke Calator sebelumnya dapat ditelusuri.
4. Setup ID dan version tersedia.
5. Speed setpoint dan actual memiliki timestamp serta unit benar.
6. Setpoint dan actual temperature tersedia untuk setiap chamber.
7. Alarm, stop, slowdown, dan override dapat direkonstruksi.
8. Output dapat dihitung dan direkonsiliasi.
9. Process run history dapat dibuka kembali.
10. Handover ke Kalender dapat ditelusuri.
11. Operator dan process engineer memvalidasi data.

---

## 25. Informasi yang Diperlukan untuk v1.1

### Mesin dan chamber

- Jumlah Dryer.
- Vendor, model, kapasitas, PLC, HMI, dan protocol.
- Jumlah, posisi, dan fungsi masing-masing chamber.
- Sumber pemanas.
- Fan, airflow, exhaust, damper, dan heating system.
- Sequence aktual dari kain masuk sampai keluar.

### Parameter

- Unit speed dan panjang lintasan efektif.
- Operating window speed per jenis kain.
- Temperature setpoint dan tolerance setiap chamber.
- Existing tag list dan alarm limit.
- Sensor moisture, airflow, humidity, width, atau tension yang tersedia.

### Produksi dan quality

- Satuan output resmi.
- Cara perhitungan output saat ini.
- Definisi kain cukup kering, kurang kering, atau terlalu kering.
- Metode dan lokasi pengukuran moisture.
- Parameter QC setelah Dryer.
- Contoh kasus hasil pengeringan tidak sesuai.

### Integrasi

- Data Calator yang diteruskan ke Dryer.
- Data Dryer yang dibutuhkan Kalender.
- Utility meter dan sistem maintenance yang tersedia.

---

## 26. Keputusan Baseline Dryer v1.0

1. Dryer dimodelkan sebagai proses pengeringan setelah Calator dan sebelum Kalender.
2. Identitas kain dipertahankan antarproses.
3. Speed menjadi parameter kritis untuk residence time dan output.
4. Setiap chamber menjadi asset tersendiri dengan temperatur setpoint dan actual.
5. Speed dan temperatur disimpan sebagai time-series.
6. Speed dan temperature profile dianalisis secara bersamaan.
7. Output memperhitungkan speed actual, effective runtime, stop, dan counter.
8. Positional mapping digunakan untuk menghubungkan deviation dengan bagian kain.
9. Moisture menjadi kandidat parameter quality utama yang perlu dikonfirmasi.
10. Pilot dimulai read-only dan AI digunakan setelah validasi data.

---

## 27. Batasan Versi Ini

Versi ini belum menetapkan jumlah chamber, sumber pemanas, sequence final, target speed, temperature profile, moisture limit, panjang lintasan, formula output resmi, equipment detail, nama tag PLC, protokol, atau tindakan otomatis. Detail memerlukan referensi aktual dan persetujuan process owner, production, quality, engineering, maintenance, utility, serta safety.

