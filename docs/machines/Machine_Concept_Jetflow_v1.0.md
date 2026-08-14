# Konsep Mesin Jetflow

**Versi:** 1.0  
**Status:** Baseline konseptual awal  
**Tanggal:** 14 Agustus 2026  
**Kategori proses:** Pencelupan kain  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Catatan:** Urutan proses, nama tag, batas alarm, jenis sensor, dan konektivitas masih harus dikonfirmasi berdasarkan mesin aktual.

---

## 1. Ringkasan Mesin

Jetflow merupakan mesin utama untuk proses pencelupan kain. Mesin bekerja berdasarkan recipe yang berhubungan dengan identitas kain, nomor warna, serta jenis chemical atau obat tertentu.

Keberhasilan proses tidak hanya ditentukan oleh hasil warna akhir. Mesin harus mampu menjalankan urutan recipe, mengikuti profil temperatur, mempertahankan level air, menggunakan chemical pada tahapan yang benar, dan memperoleh dukungan utilitas yang stabil.

Dalam sistem SCADA / MES, Jetflow harus terhubung dengan:

- Customer order dan identitas kain.
- Nomor lot, roll, dan batch.
- Nomor warna dan target warna.
- Recipe beserta versinya.
- Daftar chemical atau obat.
- Operator dan shift.
- Boiler sebagai penyedia steam.
- WWTP sebagai penerima beban wastewater.
- QC sebagai penentu kesesuaian hasil.
- Maintenance sebagai pengelola kesehatan equipment.

Tujuan integrasinya adalah membentuk satu riwayat digital lengkap yang menjelaskan apa yang diproses, bagaimana proses dijalankan, apakah mesin mengikuti recipe, kondisi utilitas selama proses, abnormal alarm yang terjadi, dan bagaimana hasil akhirnya.

---

## 2. Informasi yang Sudah Dikonfirmasi

Baseline ini menggunakan informasi berikut sebagai fakta awal:

1. Jetflow adalah mesin utama pencelupan kain.
2. Mesin berjalan berdasarkan recipe.
3. Recipe berkaitan dengan nomor warna dan chemical atau obat tertentu.
4. Temperatur merupakan parameter penting terhadap keberhasilan warna.
5. Level air merupakan parameter penting terhadap keberhasilan proses.
6. Mesin menggunakan steam yang berhubungan dengan boiler.
7. Proses Jetflow memiliki hubungan dengan WWTP.

Detail lainnya dalam dokumen ini merupakan desain konseptual yang harus diperiksa terhadap mesin dan proses aktual.

---

## 3. Posisi Jetflow dalam Digital Thread

Aliran hubungan data:

**Customer Order → Identitas Kain → Lot / Roll → Dyeing Batch → Nomor Warna → Recipe Version → Jetflow Assignment → Actual Process History → Wastewater Event → QC Result**

Dengan hubungan ini, sistem diharapkan dapat menjawab:

- Batch mana yang sedang atau pernah diproses pada Jetflow tertentu?
- Recipe, version, dan nomor warna apa yang digunakan?
- Chemical apa yang direncanakan dan benar-benar digunakan?
- Apakah profil temperatur aktual mengikuti recipe?
- Apakah level air sesuai target pada setiap tahapan?
- Apakah steam tersedia cukup selama heating?
- Apakah ada alarm atau gangguan utilitas selama proses?
- Kapan wastewater batch dialirkan menuju WWTP?
- Apakah hasil QC memenuhi target warna dan spesifikasi customer?
- Jika hasil tidak sesuai, pada tahapan mana penyimpangan mulai terlihat?

---

## 4. Batch Run Record

Setiap eksekusi Jetflow perlu memiliki satu catatan batch yang mengikat seluruh data.

| Kelompok | Informasi minimum |
|---|---|
| Order | Customer, customer order, production order |
| Material | Article atau jenis kain, lot, roll, berat atau quantity |
| Color | Nomor warna, nama warna bila ada, target specification |
| Recipe | Recipe ID, version, dan tanggal berlaku |
| Chemical | Daftar obat, target quantity, unit, dan urutan |
| Execution | Jetflow ID, start, end, operator, dan shift |
| Process | Recipe step, target, actual, dan deviation |
| Utility | Steam availability atau usage dan water usage bila tersedia |
| Wastewater | Drain event yang terkait dengan batch |
| Quality | Sample, hasil pengujian, disposition, dan rework |

Jika satu batch berisi beberapa roll, semua roll dihubungkan ke batch. Jika batch dibagi, digabung, atau diulang, genealogy tetap disimpan.

---

## 5. Recipe sebagai Pusat Proses

Recipe dipandang sebagai definisi urutan proses, bukan hanya daftar chemical. Secara konseptual recipe dapat memuat:

- Recipe ID dan version.
- Nomor warna.
- Jenis kain atau product family.
- Range berat atau kapasitas batch.
- Chemical, target quantity, unit, dan urutan penambahan.
- Target level air per step.
- Target temperatur per step.
- Heating rate.
- Holding temperature dan holding time.
- Cooling profile bila digunakan.
- Circulation time.
- Rinse dan drain sequence.
- Tolerance atau operating window.
- Approval status dan masa berlaku.

Elemen final hanya digunakan jika memang berlaku pada proses aktual.

### 5.1 Recipe versioning

Perubahan recipe menghasilkan version baru dan tidak menimpa histori. Sistem mencatat pembuat perubahan, waktu, nilai sebelum dan sesudah, alasan, approval, serta batch pertama yang memakai version tersebut.

### 5.2 Planned versus actual

Untuk setiap recipe step, sistem membandingkan:

- Target recipe dan nilai aktual.
- Besar serta durasi deviation.
- Kepatuhan terhadap tolerance.
- Manual override.
- Alarm yang terjadi pada waktu bersamaan.

---

## 6. Tahapan Operasi Konseptual

Urutan awal berikut belum dianggap sebagai sequence final:

1. Batch dan recipe dipilih.
2. Kain dimuat.
3. Pengisian air.
4. Sirkulasi awal.
5. Penambahan chemical sesuai recipe.
6. Heating menggunakan steam.
7. Temperatur dinaikkan mengikuti profile.
8. Temperatur dipertahankan selama waktu tertentu.
9. Cooling jika diperlukan.
10. Drain menuju sistem wastewater.
11. Rinsing atau washing sesuai recipe.
12. Unloading kain.
13. Batch selesai dan diteruskan ke QC.

### 6.1 Machine state konseptual

- Offline, Ready, Idle.
- Loading, Filling, Circulating, Dosing.
- Heating, Holding, Cooling.
- Draining, Rinsing, Unloading.
- Completed, Hold, Fault, Maintenance.

Daftar state harus dipetakan terhadap bit, status, atau step number yang tersedia di PLC dan HMI aktual.

---

## 7. Critical Process Parameters

### 7.1 Temperatur

Data yang perlu direkam:

- Temperatur aktual dan setpoint.
- Selisih actual terhadap setpoint.
- Heating start dan end.
- Heating rate aktual.
- Waktu mencapai target.
- Holding temperature dan duration.
- Nilai maksimum dan minimum per step.
- Durasi berada di luar tolerance.

Analisis yang direncanakan:

- Kurva temperatur aktual versus recipe.
- Heating terlalu cepat atau lambat.
- Overshoot dan undershoot.
- Temperatur tidak stabil ketika holding.
- Perbandingan batch dengan recipe sama.
- Hubungan deviation temperatur dengan hasil QC warna.

### 7.2 Level air

Data yang perlu direkam:

- Level aktual dan target per recipe step.
- Status filling.
- Waktu mencapai target.
- Nilai minimum dan maksimum.
- Durasi di luar tolerance.
- Perubahan level yang tidak sesuai dengan step aktif.

Analisis yang direncanakan:

- Target versus actual level.
- Filling terlalu lambat.
- Level turun ketika seharusnya stabil.
- Potensi overfill.
- Hubungan level dengan konsentrasi recipe dan hasil warna.
- Penggunaan air per batch jika flow atau volume tersedia.

### 7.3 Chemical atau obat

Chemical perlu dihubungkan ke recipe step dan batch:

- Chemical ID dan nama.
- Target dan actual quantity jika tersedia.
- Unit dan waktu dosing.
- Urutan dosing.
- Status dosing complete.
- Manual atau automatic addition.
- Lot chemical bila diperlukan.
- Deviation dan operator confirmation.

Jika actual quantity belum tersedia otomatis, implementasi dapat dimulai dari target recipe dan konfirmasi operator.

---

## 8. Integrasi Steam dan Boiler

Jetflow membutuhkan steam untuk menaikkan dan mempertahankan temperatur. Analisis performa heating harus menghubungkan data mesin dengan kondisi boiler dan distribusi steam.

### 8.1 Hubungan data yang diinginkan

- Steam demand dari Jetflow.
- Status atau command steam valve jika tersedia.
- Temperatur aktual dan target.
- Heating rate.
- Kondisi supply steam dari boiler atau header.
- Batch lain yang meminta steam pada waktu sama.
- Alarm boiler atau gangguan distribusi.

### 8.2 Kandidat data yang perlu dikonfirmasi

- Steam pressure dan temperature pada header.
- Steam flow per mesin atau line.
- Steam valve command dan feedback.
- Boiler running status, load, alarm, dan trip.
- Fuel consumption.
- Condensate return bila diukur.

### 8.3 Analisis yang direncanakan

- Heating time aktual versus standar recipe.
- Penurunan heating rate ketika banyak Jetflow meminta steam.
- Keterlambatan batch akibat kekurangan steam.
- Steam per batch atau kilogram kain.
- Demand peak dan rekomendasi urutan start heating.
- Pemisahan gangguan mesin dari gangguan supply utility.

Jika temperatur naik lambat, sistem tidak langsung menyimpulkan mesin rusak. Kandidat penyebab dapat berupa supply steam rendah, demand bersamaan, valve bermasalah, perpindahan panas menurun, sensor bermasalah, atau load batch berbeda. Kesimpulan harus didukung data dan validasi engineer.

---

## 9. Integrasi Wastewater dan WWTP

Setiap drain atau discharge perlu dikaitkan dengan batch sumber agar WWTP mengetahui asal beban yang masuk.

### 9.1 Informasi discharge

- Jetflow dan batch sumber.
- Nomor warna, recipe ID, dan version.
- Recipe step yang melakukan drain.
- Waktu mulai dan selesai.
- Estimasi atau actual volume jika tersedia.
- Chemical yang digunakan.
- Jalur atau destination drain jika lebih dari satu.

### 9.2 Kandidat data WWTP

- Inlet flow, tank level, dan inlet temperature.
- pH dan conductivity.
- COD atau parameter lain jika tersedia.
- Status pump, blower, aerator, dan equipment kritis.
- Current loading atau kapasitas penerimaan.
- Alarm dan trip.

### 9.3 Analisis yang direncanakan

- Prediksi beban masuk berdasarkan schedule batch dan drain step.
- Hubungan warna atau recipe dengan karakter wastewater.
- Deteksi beberapa Jetflow drain bersamaan.
- Peringatan kapasitas WWTP mendekati batas.
- Penelusuran batch sumber ketika inlet WWTP berubah abnormal.
- Rekomendasi waktu drain untuk meratakan beban.

Kondisi WWTP dapat menjadi constraint untuk production scheduling, bukan hanya penerima data akhir.

---

## 10. Equipment Hierarchy Awal

Placeholder awal yang harus disesuaikan dengan mesin aktual:

**Jetflow Machine**

- Main vessel atau chamber.
- Circulation system, main pump, dan drive motor.
- Steam atau heating system dan steam control valve.
- Water filling system dan level measurement.
- Temperature measurement.
- Chemical dosing system.
- Drain system.
- Safety dan interlock system.
- PLC atau machine controller.

Setiap equipment yang dikonfirmasi nantinya memiliki tag, operating condition, alarm, failure mode, dampak terhadap kualitas, serta strategi maintenance.

---

## 11. Prioritas Data

### Priority 1 — Baseline wajib

| Data | Fungsi |
|---|---|
| Machine ID dan state | Identitas serta status Jetflow |
| Batch ID | Menghubungkan data mesin dan kain |
| Recipe ID, version, nomor warna | Konteks standar proses |
| Active recipe step | Konteks nilai sensor |
| Temperatur actual dan setpoint | Parameter kritis |
| Level actual dan target | Parameter kritis |
| Process start dan end | Timeline batch |
| Alarm dan event | Analisis abnormal condition |
| Heating state atau steam demand | Hubungan ke boiler |
| Drain event | Hubungan ke WWTP |

### Priority 2 — Sangat disarankan

- Chemical target, actual, dan dosing timestamp.
- Steam valve command dan feedback.
- Steam pressure atau flow.
- Water filling status, flow, atau total volume.
- Pump status dan motor current atau load.
- Operator, shift, manual override, dan interlock.
- Target duration per recipe step.
- QC result.

### Priority 3 — Condition monitoring dan optimisasi

- Vibration pump atau motor.
- Bearing temperature.
- Motor power dan energy.
- Valve position actual.
- Process flow tambahan.
- High-frequency condition data.

Priority 3 hanya digunakan bila use case dan nilai bisnisnya jelas.

---

## 12. Alarm dan Abnormal Condition

### Process alarm

- Temperatur terlalu tinggi atau rendah.
- Target temperatur tidak tercapai tepat waktu.
- Heating rate terlalu cepat atau lambat.
- Temperatur tidak stabil ketika holding.
- Level terlalu tinggi, terlalu rendah, atau gagal mencapai target.
- Recipe step timeout.
- Dosing gagal atau urutannya tidak sesuai.

### Equipment alarm kandidat

- Pump trip dan motor overload.
- Valve command-feedback mismatch.
- Sensor fault dan communication loss.
- Safety interlock active.

### Utility alarm

- Steam supply rendah atau boiler unavailable.
- Water supply tidak mencukupi.
- Drain line atau WWTP tidak siap menerima discharge.

Setiap alarm perlu menyimpan machine, equipment, batch, recipe step, timestamp, nilai proses, respons operator, dan dampaknya. Batas alarm final harus berasal dari manual mesin, recipe, engineering review, dan validasi proses.

---

## 13. Quality dan Root Cause Analysis

Saat hasil warna tidak sesuai, sistem menampilkan:

1. Identitas kain, lot, roll, dan batch.
2. Nomor warna serta recipe version.
3. Kurva target dan actual temperatur.
4. Level air per recipe step.
5. Urutan dan waktu dosing chemical.
6. Heating performance dan kondisi steam.
7. Alarm, override, dan equipment abnormality.
8. Drain dan rinse history.
9. Perbandingan dengan batch normal yang memakai recipe sama.

Kandidat penyebab dapat mencakup temperatur, holding time, level, dosing, steam, circulation, sensor, override, recipe version, atau machine assignment. Sistem memberikan kandidat dan bukti; keputusan final mengikuti workflow investigasi dan approval.

---

## 14. KPI Konseptual

### Produksi

- Batch completed, batch cycle time, utilization, availability, dan downtime.
- Recipe adherence dan on-time completion.

### Process

- Temperature profile compliance.
- Heating time dan holding compliance.
- Level compliance.
- Recipe step deviation dan manual override count.

### Quality

- First pass quality.
- Re-dye atau rework rate.
- Color non-conformance dan batch hold rate.

### Utility

- Steam, water, energy, dan wastewater per batch atau berat kain.
- Peak steam demand contribution.

Formula final, unit basis, dan target belum ditetapkan.

---

## 15. Konsep Tampilan Dashboard

### Jetflow fleet overview

- Semua Jetflow dan state.
- Batch aktif, nomor warna, dan recipe step.
- Temperatur actual versus setpoint.
- Level actual versus target.
- Progress, estimated completion, alarm, dan steam demand.

### Machine detail

- Machine state dan communication health.
- Batch, roll, recipe, operator, dan step timeline.
- Live temperature, level, serta trend target versus actual.
- Chemical dosing progress, equipment state, alarm, dan utility status.

### Batch history

- Planned versus actual recipe.
- Kurva temperatur, level, chemical event, dan utility.
- Alarm, override, downtime, drain event, WWTP context, dan QC result.

### Comparison

- Perbandingan batch dengan recipe sama.
- Perbandingan antar-Jetflow.
- Golden batch overlay.
- Batch pass versus rework.

---

## 16. Peluang Analitik dan AI

### Tahap awal

- Deteksi deviation recipe, heating lambat, level tidak stabil, dan step terlalu lama.
- Korelasi awal data proses dengan QC.

### Tahap menengah

- Anomaly detection temperatur dan level.
- Prediksi waktu selesai dan risiko warna tidak sesuai.
- Deteksi penurunan performa pump atau heating.
- Forecast steam demand dan beban WWTP.

### Tahap lanjutan

- Rekomendasi recipe adjustment untuk review engineer.
- Optimisasi scheduling heating dan drain.
- Predictive maintenance.
- Optimisasi water, steam, dan chemical terhadap target quality.

AI tidak mengubah recipe atau setpoint secara langsung pada tahap awal. Rekomendasi harus melalui review, approval, dan evaluasi hasil.

---

## 17. Tahapan Implementasi

### JF-0 — Survey

- Verifikasi jumlah, vendor, model, kapasitas, PLC, HMI, sequence, tag, boiler, dan WWTP.
- Pilih satu Jetflow pilot.

### JF-1 — Visibility

- State, batch, recipe, temperatur, level, step, alarm, historian, dan communication health.

### JF-2 — Traceability

- Lot dan roll, planned versus actual recipe, chemical, operator, batch history, dan QC.

### JF-3 — Utility dan equipment

- Steam, boiler, drain, WWTP, metering, hierarchy equipment, dan maintenance.

### JF-4 — Analytics

- Golden batch, deviation, root cause assistance, utility baseline, serta prediksi quality dan maintenance.

### JF-5 — Optimization

- Recipe recommendation, heating schedule, WWTP coordination, dan controlled write-back setelah safety validation.

---

## 18. Acceptance Criteria Pilot Awal

Pilot dianggap berhasil apabila:

1. Machine state konsisten.
2. Batch aktif terhubung ke mesin yang benar.
3. Recipe ID, version, dan nomor warna diketahui.
4. Temperatur actual dan setpoint memiliki timestamp serta unit yang benar.
5. Level actual dan target tersedia.
6. Recipe step dapat direkonstruksi menjadi timeline.
7. Alarm dan event memiliki urutan waktu yang dapat dipercaya.
8. Batch history dapat dibuka kembali setelah selesai.
9. Kondisi steam ketika heating dapat dikaitkan dengan batch.
10. Drain event dapat dikaitkan dengan batch dan WWTP.
11. QC result terhubung dengan batch.
12. Operator atau process engineer memvalidasi kesesuaian data.

---

## 19. Informasi yang Diperlukan untuk v1.1

- Jumlah, vendor, model, kapasitas, PLC, HMI, dan protokol Jetflow.
- Sequence aktual dari loading hingga unloading.
- Contoh recipe yang sudah disamarkan jika diperlukan.
- Definisi nomor warna, jenis chemical, dan cara dosing.
- Operating window temperatur dan level.
- Existing tag list dan lokasi sensor.
- Instrumentasi steam, water, motor, pump, boiler, dan WWTP.
- Struktur steam header dan jalur drain.
- Parameter QC warna dan contoh kasus ketidaksesuaian.

---

## 20. Keputusan Baseline Jetflow v1.0

1. Jetflow dimodelkan berdasarkan batch dan recipe execution.
2. Nomor warna dan chemical menjadi konteks wajib.
3. Temperatur dan level air menjadi critical process parameter awal.
4. Target dan actual disimpan bersama untuk analisis deviation.
5. Steam dan boiler menjadi bagian analisis performa heating.
6. Drain event dihubungkan dengan WWTP dan batch sumber.
7. QC terhubung ke seluruh riwayat batch.
8. Detail equipment, tag, alarm limit, dan sequence menunggu data aktual.
9. Pilot dimulai read-only.
10. AI dan optimisasi dikembangkan setelah data tervalidasi.

---

## 21. Batasan Versi Ini

Versi ini belum menetapkan desain kontrol, setpoint, batas alarm, formula recipe, dosis chemical, sequence final, nama tag PLC, protokol, tindakan otomatis ke mesin, atau parameter compliance WWTP. Detail tersebut memerlukan referensi aktual dan persetujuan engineering, process owner, quality, maintenance, utility, serta safety.

