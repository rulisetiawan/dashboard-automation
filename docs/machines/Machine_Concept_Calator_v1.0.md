# Konsep Mesin Calator

**Versi:** 1.0  
**Status:** Baseline konseptual awal  
**Tanggal:** 14 Agustus 2026  
**Kategori proses:** Pencucian kain setelah pencelupan  
**Proses sebelumnya:** Jetflow / proses celup  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Catatan:** Nama equipment, urutan proses, tag, sensor, operating window, dan metode perhitungan output masih harus dikonfirmasi berdasarkan mesin aktual.

---

## 1. Ringkasan Mesin

Calator merupakan mesin lanjutan setelah proses pencelupan kain di Jetflow. Kain yang telah selesai dicelup diteruskan ke Calator untuk menjalani proses pencucian.

Proses Calator menggunakan chemical atau obat tertentu, termasuk softener, sesuai kebutuhan proses dan karakter hasil kain yang dituju. Keberhasilan proses bergantung pada kecocokan recipe, jumlah chemical yang digunakan, dan kemampuan mesin menjalankan kain pada speed yang sesuai.

Speed menjadi parameter utama karena berkaitan dengan dua kebutuhan yang harus dijaga secara bersamaan:

1. Memberikan waktu proses atau waktu kontak yang cukup agar chemical dapat bekerja dan terserap sesuai kebutuhan.
2. Menentukan throughput dan output produksi aktual.

Speed yang tinggi dapat meningkatkan output, tetapi dapat mengurangi waktu kontak apabila tidak diimbangi dengan kondisi proses lain. Speed yang terlalu rendah dapat meningkatkan waktu proses tetapi menurunkan produktivitas. Hubungan tersebut belum dianggap sebagai formula final karena harus divalidasi berdasarkan konstruksi mesin, recipe, jenis kain, dan hasil QC aktual.

---

## 2. Informasi yang Sudah Dikonfirmasi

Baseline ini menggunakan informasi berikut sebagai fakta awal:

1. Calator merupakan proses lanjutan setelah proses celup di Jetflow.
2. Kain hasil pencelupan menjalani proses pencucian di Calator.
3. Proses menggunakan chemical atau obat, termasuk softener.
4. Speed merupakan parameter penting.
5. Speed digunakan untuk mengevaluasi kemungkinan penyerapan chemical yang baik.
6. Speed menjadi salah satu dasar perhitungan output produksi.

Detail lain dalam dokumen ini merupakan desain konseptual yang perlu dikonfirmasi terhadap mesin dan proses aktual.

---

## 3. Posisi Calator dalam Digital Thread

Hubungan data konseptual:

**Customer Order → Identitas Kain → Lot / Roll → Dyeing Batch → Jetflow History → Calator Process Run → Washing / Softener Recipe → Actual Speed and Chemical History → Output → QC Result**

Hubungan Jetflow dan Calator harus mempertahankan identitas kain yang sama. Ketika satu batch Jetflow menghasilkan beberapa roll atau bagian kain, setiap bagian harus tetap dapat dilacak ketika masuk ke Calator.

Sistem diharapkan dapat menjawab:

- Kain, roll, atau batch Jetflow mana yang masuk ke Calator?
- Jetflow dan recipe pencelupan apa yang digunakan sebelumnya?
- Recipe pencucian atau softener apa yang digunakan di Calator?
- Chemical apa yang direncanakan dan benar-benar digunakan?
- Berapa speed aktual selama kain diproses?
- Berapa lama kain berada dalam tahapan proses?
- Apakah speed berada dalam operating window untuk recipe dan jenis kain tersebut?
- Berapa output aktual yang dihasilkan?
- Apakah terdapat stop, speed reduction, alarm, atau perubahan recipe?
- Apakah hasil akhir memenuhi standar QC?

---

## 4. Handover dari Jetflow ke Calator

Perpindahan material dari Jetflow ke Calator merupakan titik penting untuk traceability. Sistem perlu mencatat:

- Customer order dan production order.
- Article atau jenis kain.
- Lot, roll, dan dyeing batch.
- Nomor warna.
- Jetflow sumber.
- Recipe version pada proses celup.
- Waktu selesai Jetflow.
- Status QC atau release dari proses sebelumnya jika berlaku.
- Calator tujuan.
- Waktu antre dan waktu mulai di Calator.
- Operator dan shift yang menerima material.

Jika satu batch Jetflow diproses pada beberapa Calator, atau beberapa roll digabung dalam satu run, hubungan split dan merge harus disimpan.

### 4.1 Identifikasi material

Metode identifikasi aktual belum ditetapkan. Kandidatnya dapat berupa barcode, QR code, RFID, input operator, atau integrasi dari sistem produksi. Metode yang dipilih harus mampu mencegah roll atau batch yang salah masuk ke recipe yang tidak sesuai.

---

## 5. Calator Process Run Record

Setiap pelaksanaan proses Calator perlu memiliki satu record yang mengikat material, recipe, chemical, speed, waktu, mesin, dan hasil.

| Kelompok | Informasi minimum |
|---|---|
| Order | Customer, customer order, production order |
| Material | Article atau jenis kain, lot, roll, batch, quantity |
| Upstream | Jetflow ID, dyeing recipe, nomor warna, waktu selesai |
| Calator recipe | Recipe ID, version, target proses |
| Chemical | Softener atau chemical lain, target quantity, unit, urutan |
| Execution | Calator ID, start, end, operator, shift |
| Speed | Setpoint, actual, average, minimum, maximum, deviation |
| Output | Counter awal, counter akhir, panjang atau berat hasil |
| Event | Start, stop, slowdown, alarm, override, recipe change |
| Quality | Hasil pemeriksaan, disposition, rework bila ada |

---

## 6. Recipe Pencucian dan Softener

Recipe Calator secara konseptual dapat memuat:

- Recipe ID dan version.
- Article, jenis kain, atau product family.
- Nomor warna atau kelompok warna bila berpengaruh.
- Target proses pencucian.
- Chemical atau softener yang digunakan.
- Target quantity atau concentration.
- Urutan penambahan chemical.
- Target speed atau speed range.
- Target waktu proses atau contact time bila relevan.
- Target water usage atau bath condition jika tersedia.
- Target temperatur jika proses aktual menggunakannya.
- Tolerance dan operating window.
- Approval status dan masa berlaku.

Parameter final akan disesuaikan setelah contoh recipe dan urutan proses aktual tersedia.

### 6.1 Recipe versioning

Perubahan target speed, chemical, quantity, urutan proses, atau parameter lainnya harus menghasilkan recipe version baru. History run tetap menunjuk ke version yang benar-benar digunakan.

### 6.2 Planned versus actual

Untuk setiap process run, sistem perlu membandingkan:

- Target chemical versus actual chemical.
- Target speed versus actual speed.
- Target duration versus actual duration.
- Tolerance dan durasi deviation.
- Manual override.
- Stop dan alarm selama proses.

---

## 7. Tahapan Operasi Konseptual

Sequence berikut merupakan model awal dan belum dianggap sebagai urutan final:

1. Roll atau batch diidentifikasi.
2. Calator dan recipe ditentukan.
3. Kain dimuat atau dimasukkan ke mesin.
4. Water atau washing medium disiapkan jika berlaku.
5. Chemical atau softener disiapkan dan ditambahkan.
6. Mesin mulai menjalankan kain.
7. Speed dinaikkan menuju target.
8. Proses pencucian berjalan pada operating window.
9. Speed, chemical, dan kondisi proses dimonitor.
10. Kain keluar dari mesin.
11. Output dan sisa material direkonsiliasi.
12. Process run diselesaikan.
13. Material diteruskan ke proses atau QC berikutnya.

### 7.1 Machine state konseptual

- Offline.
- Ready.
- Loading atau Threading.
- Preparing.
- Running.
- Slow Running.
- Paused.
- Unloading.
- Completed.
- Idle.
- Hold.
- Fault.
- Cleaning.
- Maintenance.

State final perlu dipetakan dengan bit, status, atau mode pada PLC dan HMI aktual.

---

## 8. Speed sebagai Critical Process Parameter

Speed perlu direkam sebagai time-series, bukan hanya satu nilai akhir. Perubahan speed selama run dapat memengaruhi waktu kontak, konsistensi proses, dan output.

### 8.1 Data speed yang dibutuhkan

- Speed setpoint.
- Speed actual.
- Engineering unit, misalnya meter per minute jika sesuai mesin aktual.
- Average speed selama effective run.
- Minimum dan maximum speed.
- Waktu mencapai target speed.
- Durasi di bawah atau di atas tolerance.
- Acceleration dan deceleration event jika relevan.
- Stop count dan stop duration.
- Slow-running duration.
- Alasan perubahan speed atau stop.

### 8.2 Hubungan speed dengan penyerapan chemical

Secara konseptual, speed memengaruhi waktu kain berada di dalam area proses. Jika panjang lintasan efektif diketahui, sistem dapat memperkirakan residence atau contact time.

Hubungan konseptual:

**Speed meningkat → waktu kontak cenderung menurun → risiko proses atau penyerapan tidak cukup perlu dievaluasi**

**Speed menurun → waktu kontak cenderung meningkat → output menurun dan potensi efek proses lain perlu dievaluasi**

Hubungan ini tidak selalu linear. Penyerapan juga dapat dipengaruhi oleh jenis kain, berat kain, kondisi hasil celup, jenis dan konsentrasi chemical, metode aplikasi, temperatur, pressure, flow, serta kondisi equipment. Faktor-faktor tersebut masih perlu divalidasi.

### 8.3 Speed operating window

Target speed ideal tidak seharusnya berupa satu angka yang sama untuk semua kain. Operating window dapat berbeda berdasarkan:

- Article atau jenis kain.
- Berat dan lebar kain.
- Nomor warna atau kelompok proses.
- Recipe pencucian.
- Jenis chemical atau softener.
- Target kualitas.
- Kondisi mesin dan batas keselamatan.

Sistem perlu menampilkan target, tolerance, actual, dan durasi deviation.

---

## 9. Chemical dan Softener Management

Chemical perlu dilacak sampai ke batch atau roll yang menggunakannya.

### 9.1 Data chemical

- Chemical ID dan nama.
- Chemical category, misalnya softener.
- Recipe ID dan version.
- Target quantity atau concentration.
- Actual quantity jika tersedia.
- Unit.
- Waktu persiapan dan aplikasi.
- Manual atau automatic dosing.
- Lot chemical jika dibutuhkan.
- Operator confirmation.
- Deviation atau dosing alarm.

### 9.2 Kandidat sumber data

- Dosing system otomatis.
- Flow meter atau totalizer.
- Tank level.
- Weighing system.
- Manual confirmation operator.
- Inventory atau warehouse system.

Sumber data final belum ditetapkan. Implementasi dapat dimulai dari recipe target dan konfirmasi operator, kemudian ditingkatkan menuju actual consumption otomatis.

### 9.3 Analisis chemical

- Chemical usage per roll, batch, meter, atau kilogram kain.
- Target versus actual usage.
- Chemical consumption antar-recipe dan jenis kain.
- Hubungan chemical, speed, dan hasil QC.
- Deteksi penggunaan berlebih atau kurang.
- Rekonsiliasi konsumsi dengan inventory.

---

## 10. Konsep Perhitungan Output

Output Calator dapat dihitung dari pergerakan kain, tetapi metode final bergantung pada sensor dan satuan produksi aktual.

### 10.1 Kandidat output berbasis panjang

Jika speed dinyatakan sebagai panjang per waktu, estimasi panjang produksi diperoleh dari akumulasi speed selama mesin benar-benar berjalan.

Perhitungan harus mempertimbangkan:

- Effective running time.
- Speed aktual yang berubah terhadap waktu.
- Stop dan idle time.
- Counter atau encoder aktual.
- Material yang tertinggal di mesin.
- Rework atau kain yang diproses ulang.
- Selisih antara input length dan output length.

### 10.2 Output berbasis berat

Jika output produksi menggunakan kilogram, data panjang memerlukan hubungan dengan berat kain. Kandidat data tambahan:

- Actual weight.
- Fabric width.
- Grammage atau GSM.
- Moisture condition pada saat ditimbang.

Konversi tidak boleh digunakan sebagai angka resmi sebelum metode penimbangan dan basis perhitungannya disepakati.

### 10.3 Rekonsiliasi output

Untuk satu process run, sistem idealnya membandingkan:

- Planned quantity.
- Input quantity.
- Machine counter.
- Good output.
- Rework quantity.
- Reject atau loss.
- Quantity yang masih berada di mesin.

### 10.4 Output rate

KPI output rate perlu membedakan:

- Instantaneous rate berdasarkan speed saat ini.
- Effective rate setelah stop dan slowdown.
- Average rate untuk seluruh run.
- Good output rate setelah memperhitungkan hasil QC.

---

## 11. Kandidat Parameter dan Sensor Tambahan

Data berikut belum dikonfirmasi, tetapi perlu diperiksa saat survey mesin:

| Kandidat data | Potensi fungsi |
|---|---|
| Encoder atau length counter | Perhitungan panjang aktual |
| Chemical flow / totalizer | Actual chemical consumption |
| Water flow / totalizer | Water consumption per run |
| Bath atau tank level | Stabilitas medium proses |
| Temperatur | Pengaruh kondisi washing atau softener jika relevan |
| Fabric tension | Risiko kualitas atau ketidakstabilan running |
| Roller speed synchronization | Slip atau ketidaksesuaian drive |
| Motor current / load | Beban mesin dan condition monitoring |
| Pressure | Kondisi aplikasi atau squeezing jika berlaku |
| pH atau conductivity | Kondisi proses jika tersedia dan relevan |

Data hanya dimasukkan ke desain final apabila benar-benar tersedia atau memiliki use case yang disetujui.

---

## 12. Equipment Hierarchy Awal

Placeholder hierarchy yang harus disesuaikan berdasarkan konstruksi aktual:

**Calator Machine**

- Fabric feeding atau unwinding system.
- Guide roller dan transport system.
- Main drive dan motor.
- Washing chamber atau bath section.
- Chemical atau softener dosing system.
- Water supply system.
- Output roller atau take-up system.
- Length measurement atau encoder.
- Drain system.
- Safety dan interlock system.
- PLC atau machine controller.

Kandidat seperti squeezing, pressure roller, heating, drying, atau tension control belum dianggap tersedia sampai dikonfirmasi.

---

## 13. Prioritas Data

### Priority 1 — Baseline wajib

| Data | Fungsi |
|---|---|
| Machine ID dan state | Identitas dan kondisi Calator |
| Roll atau batch ID | Traceability material |
| Jetflow source | Hubungan dengan proses celup |
| Recipe ID dan version | Standar proses pencucian |
| Chemical atau softener target | Konteks recipe |
| Speed setpoint dan actual | Parameter proses dan output |
| Start, stop, dan end time | Timeline produksi |
| Machine counter jika tersedia | Rekonsiliasi output |
| Alarm dan event | Analisis abnormal condition |
| QC result | Hubungan proses dan kualitas |

### Priority 2 — Sangat disarankan

- Actual chemical usage dan dosing timestamp.
- Water consumption.
- Roll length atau weight input.
- Good output, rework, dan reject.
- Operator dan shift.
- Stop reason dan slowdown reason.
- Manual override dan recipe change.
- Drive atau motor status.

### Priority 3 — Analitik lanjutan

- Fabric tension.
- Motor current, power, vibration, atau bearing temperature.
- Process temperature, pressure, flow, pH, atau conductivity jika relevan.
- High-frequency encoder atau drive data.

---

## 14. Alarm dan Abnormal Condition

### Process alarm

- Speed terlalu tinggi atau rendah terhadap recipe.
- Speed tidak stabil.
- Mesin gagal mencapai target speed.
- Stop atau slowdown tidak direncanakan.
- Chemical target tidak tercapai.
- Dosing sequence tidak sesuai.
- Counter atau output tidak bertambah ketika state running.

### Equipment alarm kandidat

- Motor atau drive fault.
- Roller synchronization problem.
- Sensor atau encoder fault.
- Pump atau dosing system trip.
- Communication loss.
- Safety interlock active.

### Material dan quality warning

- Roll atau batch tidak sesuai dengan recipe.
- Speed berada di luar operating window terlalu lama.
- Chemical belum dikonfirmasi tetapi proses akan dimulai.
- Actual consumption berbeda signifikan dari target.

Setiap alarm perlu menyimpan machine, equipment, material, recipe, speed, timestamp, operator response, dan dampak terhadap output atau kualitas. Limit final harus divalidasi oleh process owner dan engineering.

---

## 15. Konsep Analisis Ketidaksesuaian

Jika hasil pencucian, kelembutan, penyerapan, atau parameter QC lainnya tidak sesuai, sistem perlu menggabungkan:

1. Identitas customer, kain, lot, roll, dan batch.
2. Riwayat proses Jetflow dan nomor warna.
3. Recipe dan version Calator.
4. Jenis, target, dan actual chemical atau softener.
5. Speed profile dari awal sampai akhir run.
6. Stop, slowdown, alarm, dan override.
7. Output counter dan actual quantity.
8. Kondisi equipment.
9. Hasil QC.
10. Perbandingan dengan run normal yang setara.

Kandidat penyebab dapat berupa:

- Speed terlalu tinggi sehingga waktu kontak tidak cukup.
- Speed terlalu rendah atau tidak stabil.
- Chemical kurang, berlebih, terlambat, atau salah.
- Recipe version tidak sesuai.
- Dosing system atau circulation tidak normal.
- Material yang masuk berbeda dari identitas pada sistem.
- Sensor speed atau counter tidak valid.
- Masalah berasal dari hasil Jetflow sebelumnya.

Sistem menyajikan kandidat penyebab dan bukti, bukan menetapkan penyebab final tanpa review.

---

## 16. KPI Calator Konseptual

### Produksi

- Output panjang atau berat per shift.
- Average speed dan effective speed.
- Effective running time.
- Throughput.
- Availability dan utilization.
- Stop count dan stop duration.
- Schedule atau target attainment.

### Process

- Speed compliance.
- Durasi di luar speed tolerance.
- Recipe adherence.
- Chemical consumption compliance.
- Manual override count.

### Quality

- First pass quality.
- Rewash atau rework rate.
- Non-conformance rate.
- Hold rate.

### Resource

- Chemical per meter, kilogram, roll, atau batch.
- Water per unit output jika metering tersedia.
- Energy per unit output jika tersedia.
- Wastewater per process run jika dapat diukur.

Formula dan basis perhitungan final belum ditetapkan.

---

## 17. Konsep Tampilan Dashboard

### Calator fleet overview

- Semua Calator dan state masing-masing.
- Roll atau batch aktif dan Jetflow sumber.
- Recipe aktif dan jenis chemical.
- Speed setpoint versus actual.
- Progress dan estimated completion.
- Output aktual terhadap target.
- Alarm aktif.

### Machine detail

- Machine state dan communication health.
- Material, recipe, operator, dan shift.
- Live speed dan trend.
- Chemical dosing status.
- Output counter.
- Stop dan alarm timeline.
- Equipment status.

### Process run history

- Handover dari Jetflow.
- Target versus actual speed.
- Chemical target versus actual.
- Running, slowdown, dan stop timeline.
- Output reconciliation.
- QC result dan disposition.

### Comparison view

- Perbandingan run dengan recipe dan jenis kain sama.
- Perbandingan antar-Calator.
- Golden run overlay.
- Run pass versus rework.

---

## 18. Peluang Analitik dan AI

### Tahap awal

- Deteksi speed deviation dan instability.
- Perhitungan output otomatis.
- Deteksi konsumsi chemical yang menyimpang.
- Loss analysis akibat stop dan slowdown.

### Tahap menengah

- Rekomendasi operating speed berdasarkan article, recipe, dan hasil historis.
- Prediksi waktu selesai roll atau batch.
- Prediksi risiko hasil proses tidak sesuai.
- Deteksi penurunan performa drive, motor, roller, atau dosing.
- Optimisasi konsumsi softener dan water.

### Tahap lanjutan

- Optimisasi speed terhadap quality, output, dan konsumsi chemical.
- Rekomendasi recipe untuk review process engineer.
- Predictive maintenance.
- Koordinasi schedule Calator dengan output Jetflow dan proses berikutnya.

AI tidak mengubah speed, recipe, atau dosing secara langsung pada tahap awal. Rekomendasi harus melalui review, approval, safety limit, dan evaluasi hasil.

---

## 19. Tahapan Implementasi

### CL-0 — Survey

- Verifikasi jumlah, vendor, model, kapasitas, PLC, HMI, sequence, sensor, dan chemical system.
- Tentukan satu Calator pilot.

### CL-1 — Visibility

- Machine state, material context, recipe, speed, alarm, counter, historian, dan communication health.

### CL-2 — Traceability dan output

- Handover Jetflow, roll dan batch tracking, output calculation, operator, stop reason, dan QC.

### CL-3 — Chemical dan equipment

- Actual chemical, water, equipment hierarchy, motor atau drive data, dan maintenance.

### CL-4 — Analytics

- Golden run, speed-quality analysis, loss analysis, root cause assistance, dan prediction.

### CL-5 — Optimization

- Operating speed recommendation, chemical optimization, scheduling, dan controlled write-back setelah safety validation.

---

## 20. Acceptance Criteria Pilot Awal

Pilot Calator dapat dianggap berhasil apabila:

1. Machine state dapat dibaca secara konsisten.
2. Roll atau batch aktif dapat dikaitkan dengan Calator yang benar.
3. Hubungan ke batch dan Jetflow sebelumnya dapat ditelusuri.
4. Recipe ID, version, dan chemical target tersedia.
5. Speed setpoint dan actual memiliki timestamp serta unit yang benar.
6. Stop dan slowdown dapat direkonstruksi menjadi timeline.
7. Output aktual dapat dihitung dan direkonsiliasi dengan catatan produksi.
8. Alarm dan event memiliki urutan waktu yang dapat dipercaya.
9. Satu process run dapat dibuka kembali setelah selesai.
10. Hasil QC dapat dihubungkan dengan process run.
11. Operator dan process engineer memvalidasi kesesuaian data.

---

## 21. Informasi yang Diperlukan untuk v1.1

### Mesin dan proses

- Jumlah Calator.
- Vendor, model, kapasitas, PLC, HMI, dan protocol.
- Foto, manual, atau diagram aliran mesin.
- Sequence aktual dari kain masuk sampai keluar.
- Apakah mesin continuous atau menggunakan mode operasi lain.
- Panjang lintasan efektif kain di dalam proses.

### Recipe dan chemical

- Contoh recipe yang telah disamarkan bila diperlukan.
- Jenis softener dan chemical lainnya.
- Metode dosing dan sumber actual consumption.
- Operating window speed per jenis kain atau recipe.

### Instrumentasi

- Existing tag list.
- Unit speed.
- Lokasi sensor speed dan encoder.
- Length counter atau weighing system.
- Sensor water, chemical, temperature, tension, pressure, atau flow yang tersedia.
- Motor dan drive yang digunakan.

### Produksi dan QC

- Satuan output resmi: meter, kilogram, roll, atau lainnya.
- Cara perhitungan output saat ini.
- Definisi good output, rework, reject, dan loss.
- Parameter QC setelah Calator.
- Contoh kejadian hasil proses tidak sesuai.

---

## 22. Keputusan Baseline Calator v1.0

1. Calator dimodelkan sebagai proses lanjutan setelah Jetflow.
2. Identitas kain, roll, dan batch dipertahankan dari proses sebelumnya.
3. Recipe pencucian dan chemical atau softener menjadi konteks wajib.
4. Speed menjadi critical process parameter awal.
5. Speed disimpan sebagai time-series untuk analisis kualitas dan output.
6. Output harus memperhitungkan speed aktual, effective runtime, stop, dan counter.
7. Target dan actual chemical perlu disimpan bersama.
8. QC dikaitkan dengan history Jetflow dan Calator.
9. Detail sensor, equipment, operating window, dan formula output menunggu data aktual.
10. Pilot dimulai read-only dan AI dikembangkan setelah validasi data.

---

## 23. Batasan Versi Ini

Versi ini belum menetapkan sequence final, konstruksi mesin, target speed, formula contact time, formula output resmi, dosis chemical, quality limit, nama tag PLC, protokol, atau tindakan otomatis ke mesin. Detail tersebut memerlukan data aktual dan persetujuan process owner, production, quality, engineering, maintenance, dan safety.

