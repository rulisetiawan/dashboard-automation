# Konsep Mesin Calator

**Versi:** 1.1  
**Status:** Konsep diperbarui dengan detail speed channel dan dancing roller  
**Tanggal:** 14 Agustus 2026  
**Kategori proses:** Pencucian kain setelah pencelupan  
**Proses sebelumnya:** Jetflow / proses celup  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Catatan:** Speed channel Calator umum dan Bianco telah diperbarui. Jumlah feeding channel Bianco, nama tag PLC, unit, range, limit, dan equipment mapping masih harus dikonfirmasi.

---

## Ringkasan Update v1.1

Versi ini mempertahankan konsep proses v1.0 dan menambahkan:

- Speed Feeding.
- Speed Squeezing 1 dan Squeezing 2.
- Speed Overfeed Atas dan Overfeed Bawah untuk Calator umum.
- Speed Folder dan Plaiter.
- Template speed khusus Calator Bianco.
- Overfeed In Bawah 1–2 dan Overfeed In Atas 3–4 pada Bianco.
- Overfeed Out Bawah 1–2 dan Overfeed Out Atas 3–4 pada Bianco.
- Dancing roller sebagai critical process parameter.
- Overfeed out sebagai critical process parameter utama.
- Configuration-driven speed template berdasarkan tipe atau model Calator.

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

## 8. Multi-Speed dan Overfeed sebagai Critical Process Parameter

Calator memiliki beberapa speed point yang mewakili tahapan transport, squeezing, overfeed, dan output. Speed tidak boleh dimodelkan sebagai satu tag umum.

### 8.1 Speed channel Calator umum

Jika seluruh speed point tersedia, template awal Calator umum mencakup:

| Speed point | Process context |
|---|---|
| Speed Feeding | Kecepatan kain pada bagian feeding |
| Speed Squeezing 1 | Kecepatan pada squeezing stage 1 |
| Speed Squeezing 2 | Kecepatan pada squeezing stage 2 |
| Speed Overfeed Atas | Kecepatan overfeed sisi atas |
| Speed Overfeed Bawah | Kecepatan overfeed sisi bawah |
| Speed Folder | Kecepatan bagian folder |
| Speed Plaiter | Kecepatan bagian plaiter |

Kata “jika tersedia” berarti setiap mesin perlu diverifikasi. Tag yang tidak ada tidak dibuat sebagai data kosong.

### 8.2 Speed channel Calator Bianco

Calator Bianco memiliki speed point lebih banyak:

| Group | Channel |
|---|---|
| Overfeed In Bawah | Channel 1 dan 2 |
| Overfeed In Atas | Channel 3 dan 4 |
| Feeding | Jumlah channel belum dikonfirmasi |
| Squeezing | Squeezing 1 dan Squeezing 2 |
| Overfeed Out Bawah | Channel 1 dan 2 |
| Overfeed Out Atas | Channel 3 dan 4 |
| Output | Folder dan Plaiter |

Jumlah atau struktur Speed Feeding Bianco masih berstatus TBD dan tidak boleh ditebak saat membangun tag registry.

### 8.3 Configuration-driven speed template

Setiap Calator memiliki machine subtype atau speed-profile template:

- Standard Calator.
- Bianco.
- Tipe lain yang akan ditambahkan setelah survey.

Aturan model:

1. Machine subtype menentukan daftar speed channel.
2. Setiap channel memiliki ID unik, position, group, side, dan sequence.
3. Channel yang tidak ada secara fisik tidak dibuat.
4. Dashboard menyusun speed panel dari configuration.
5. Perubahan configuration memiliki version dan audit trail.
6. Historical data tetap menunjuk ke configuration yang berlaku saat process run.

### 8.4 Data setiap speed channel

- Speed setpoint jika tersedia.
- Speed actual.
- Engineering unit.
- Position atau process stage.
- Upper, lower, left, atau right side bila relevan.
- Average, minimum, maximum, dan variability.
- Waktu mencapai target.
- Durasi di luar tolerance.
- Acceleration dan deceleration event.
- Stop dan slowdown duration.
- Drive atau sensor data quality.
- Alarm dan manual override.

### 8.5 Overfeed out sebagai parameter kritis

Overfeed out menjadi parameter penting karena menunjukkan kondisi feeding pada bagian keluar proses sebelum folder dan plaiter.

Pada Bianco, Overfeed Out dipisahkan menjadi:

- Overfeed Out Bawah 1.
- Overfeed Out Bawah 2.
- Overfeed Out Atas 3.
- Overfeed Out Atas 4.

Analisis yang direncanakan:

- Setpoint versus actual setiap channel.
- Average overfeed out.
- Spread atau selisih maksimum antarchannel.
- Balance atas-bawah.
- Balance channel dalam satu sisi.
- Stabilitas sepanjang roll.
- Hubungan dengan dancing roller.
- Hubungan dengan folder, plaiter, output, dan hasil quality.

Operating window final perlu dibedakan per article, recipe, dan machine subtype.

### 8.6 Dancing roller sebagai parameter kritis

Dancing roller diperlakukan sebagai sensor atau process measurement yang menunjukkan respons mekanis feeding atau tension-control. Arti fisik, unit, center position, dan range perlu dikonfirmasi.

Data yang perlu direkam:

- Actual position atau measurement.
- Setpoint atau center reference jika tersedia.
- Minimum, maximum, average, dan variability.
- Durasi mendekati upper atau lower limit.
- Limit state jika tersedia.
- Oscillation atau unstable behavior.
- Timestamp dan data quality.
- Speed channel context.

Analisis yang direncanakan:

- Dancing roller versus Overfeed Out.
- Dancing roller versus Folder dan Plaiter.
- Respons ketika speed berubah.
- Respons ketika stop dan restart.
- Hubungan dengan fabric tension serta output quality.
- Perbandingan run normal dan abnormal.

### 8.7 Speed synchronization dan ratio

Sistem perlu menghitung perbedaan atau ratio speed antartahapan yang relevan:

- Feeding → Squeezing 1.
- Squeezing 1 → Squeezing 2.
- Squeezing 2 → Overfeed.
- Overfeed In → Overfeed Out pada Bianco.
- Overfeed Out → Folder.
- Folder → Plaiter.
- Upper versus lower channel.
- Channel 1–2 versus 3–4 pada Bianco.

Formula dan batas ratio belum ditetapkan. Analisis digunakan untuk mendeteksi mismatch, slip, atau setting yang tidak konsisten.

### 8.8 Hubungan speed dengan penyerapan dan output

Speed profile memengaruhi residence atau contact time dan transport kain. Speed yang tinggi pada satu titik tetapi tidak sinkron dengan tahap berikutnya dapat menyebabkan ketidakstabilan meskipun average machine speed terlihat normal.

Output perlu dihitung dari reference speed atau counter yang disetujui. Speed Folder atau Plaiter tidak otomatis dijadikan output reference sebelum divalidasi terhadap encoder, counter, dan metode produksi aktual.

### 8.9 Speed operating window

Operating window dapat berbeda berdasarkan:

- Article atau jenis kain.
- Berat dan lebar kain.
- Nomor warna atau kelompok proses.
- Recipe pencucian.
- Chemical atau softener.
- Machine subtype.
- Target quality.
- Kondisi equipment.

Target, actual, tolerance, dan durasi deviation harus ditampilkan bersama.

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

Dancing roller telah dikonfirmasi sebagai parameter penting dan tidak lagi ditempatkan sebagai kandidat. Sensor tambahan berikut masih perlu diperiksa saat survey mesin:

| Kandidat data | Potensi fungsi |
|---|---|
| Encoder atau length counter | Perhitungan panjang aktual |
| Chemical flow / totalizer | Actual chemical consumption |
| Water flow / totalizer | Water consumption per run |
| Bath atau tank level | Stabilitas medium proses |
| Temperatur | Pengaruh kondisi washing atau softener jika relevan |
| Fabric tension | Risiko kualitas atau ketidakstabilan running |
| Motor current / load | Beban mesin dan condition monitoring |
| Pressure | Kondisi aplikasi atau squeezing jika berlaku |
| pH atau conductivity | Kondisi proses jika tersedia dan relevan |

Data hanya dimasukkan ke desain final apabila benar-benar tersedia atau memiliki use case yang disetujui.

---

## 12. Speed dan Equipment Hierarchy v1.1

### 12.1 Calator umum

**Calator Machine**

- Feeding section.
  - Speed Feeding.
- Squeezing section.
  - Speed Squeezing 1.
  - Speed Squeezing 2.
- Overfeed section.
  - Speed Overfeed Atas.
  - Speed Overfeed Bawah.
  - Dancing Roller.
- Output section.
  - Speed Folder.
  - Speed Plaiter.
- Washing atau bath section.
- Chemical atau softener dosing.
- Water supply dan drain.
- Counter atau encoder jika tersedia.
- Safety dan interlock.
- PLC atau machine controller.

### 12.2 Calator Bianco

**Calator Bianco**

- Overfeed In section.
  - Bawah Channel 1.
  - Bawah Channel 2.
  - Atas Channel 3.
  - Atas Channel 4.
- Feeding section.
  - Jumlah speed channel TBD.
- Squeezing section.
  - Speed Squeezing 1.
  - Speed Squeezing 2.
- Overfeed Out section.
  - Bawah Channel 1.
  - Bawah Channel 2.
  - Atas Channel 3.
  - Atas Channel 4.
  - Dancing Roller.
- Output section.
  - Speed Folder.
  - Speed Plaiter.
- Washing atau bath section.
- Chemical atau softener dosing.
- Water supply dan drain.
- Counter atau encoder jika tersedia.
- Safety dan interlock.
- PLC atau machine controller.

### 12.3 Kandidat equipment data

Setiap speed point kemungkinan berhubungan dengan motor, drive, roller, atau mechanism. Mapping aktual masih perlu dikonfirmasi.

Kandidat data:

- Motor atau drive ID.
- Run, ready, stop, dan fault.
- Speed setpoint dan actual.
- Frequency, current, power, dan energy.
- Operating hours dan start count.
- Alarm code.
- Local, remote, manual, atau auto mode.
- Interlock dan permissive.
- Roller atau encoder feedback.

### 12.4 Konsep naming

Naming final mengikuti standard tag pabrik. Contoh label konseptual:

- Calator / Feeding / Speed Actual.
- Calator / Squeezing 1 / Speed Actual.
- Calator / Overfeed Atas / Speed Actual.
- Bianco / Overfeed In / Bawah 1 / Speed Actual.
- Bianco / Overfeed Out / Atas 4 / Speed Actual.
- Bianco / Dancing Roller / Position.
- Calator / Folder / Speed Actual.
- Calator / Plaiter / Speed Actual.

Label tersebut bukan nama tag PLC final.

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
| Semua speed channel sesuai machine subtype | Parameter proses, synchronization, dan output |
| Overfeed Out setpoint dan actual | Critical output-feeding parameter |
| Dancing roller actual dan limit | Critical feeding atau tension-control parameter |
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

- Speed channel terlalu tinggi atau rendah terhadap recipe.
- Speed channel tidak stabil.
- Speed synchronization atau ratio di luar operating window.
- Mesin gagal mencapai target speed.
- Overfeed Out channel tidak seimbang.
- Overfeed Out menyimpang dari target terlalu lama.
- Dancing roller mendekati limit atau tidak stabil.
- Stop atau slowdown tidak direncanakan.
- Chemical target tidak tercapai.
- Dosing sequence tidak sesuai.
- Counter atau output tidak bertambah ketika state running.

### Equipment alarm kandidat

- Motor atau drive fault pada speed point terkait.
- Feeding, Squeezing 1, atau Squeezing 2 fault.
- Overfeed In atau Overfeed Out channel fault.
- Folder atau Plaiter fault.
- Dancing roller sensor fault.
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
5. Semua speed channel dari feeding sampai plaiter.
6. Overfeed In dan Overfeed Out profile untuk Bianco.
7. Balance Overfeed Out atas-bawah dan antarchannel.
8. Dancing roller profile serta limit event.
9. Speed ratio dan synchronization event.
10. Stop, slowdown, alarm, dan override.
11. Output counter dan actual quantity.
12. Kondisi equipment.
13. Hasil QC.
14. Perbandingan dengan run normal yang setara.

Kandidat penyebab dapat berupa:

- Speed terlalu tinggi sehingga waktu kontak tidak cukup.
- Speed terlalu rendah atau tidak stabil.
- Speed antartahapan tidak sinkron.
- Overfeed Out tidak sesuai target atau tidak seimbang.
- Dancing roller tidak stabil atau sering mencapai limit.
- Folder dan Plaiter tidak mengikuti upstream speed.
- Calator memakai speed template yang tidak sesuai subtype.
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
- Average dan effective speed per process run.
- Overfeed Out average, balance, dan compliance.
- Dancing roller stability.
- Effective running time.
- Throughput.
- Availability dan utilization.
- Stop count dan stop duration.
- Schedule atau target attainment.

### Process

- Speed compliance per channel.
- Speed synchronization dan ratio compliance.
- Overfeed Out compliance dan balance.
- Dancing roller stability dan limit occurrence.
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
- Speed summary dari feeding sampai plaiter.
- Overfeed Out dan dancing roller sebagai primary cards.
- Speed mismatch atau synchronization warning.
- Progress dan estimated completion.
- Output aktual terhadap target.
- Alarm aktif.

### Machine detail

- Machine state dan communication health.
- Material, recipe, operator, dan shift.
- Multi-speed live panel sesuai subtype.
- Overfeed In dan Out matrix untuk Bianco.
- Overfeed Out serta dancing roller trend.
- Speed ratio dan synchronization.
- Chemical dosing status.
- Output counter.
- Stop dan alarm timeline.
- Equipment status.

### Process run history

- Handover dari Jetflow.
- Target versus actual untuk setiap speed channel.
- Overfeed Out dan dancing roller profile.
- Speed ratio, synchronization, slowdown, dan stop.
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

## 21. Informasi yang Diperlukan untuk v1.2

### Mesin dan proses

- Jumlah Calator.
- Vendor, model, kapasitas, PLC, HMI, dan protocol.
- Foto, manual, atau diagram aliran mesin.
- Sequence aktual dari kain masuk sampai keluar.
- Daftar machine subtype selain Standard dan Bianco.
- Jumlah Speed Feeding aktual pada Bianco.
- Mapping channel 1–4 terhadap equipment fisik.
- Apakah mesin continuous atau menggunakan mode operasi lain.
- Panjang lintasan efektif kain di dalam proses.

### Recipe dan chemical

- Contoh recipe yang telah disamarkan bila diperlukan.
- Jenis softener dan chemical lainnya.
- Metode dosing dan sumber actual consumption.
- Operating window speed per jenis kain atau recipe.

### Instrumentasi

- Existing tag list.
- Unit setiap speed channel.
- Existing PLC tag, alamat, setpoint, actual, dan data quality.
- Operating window serta ratio limit antarspeed.
- Lokasi sensor speed dan encoder.
- Dancing roller type, unit, center reference, range, dan limit.
- Mapping speed point ke motor, drive, roller, dan mechanism.
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

## 22. Keputusan Calator v1.1

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
11. Speed dimodelkan sebagai multichannel, bukan satu nilai umum.
12. Standard Calator dan Bianco menggunakan template speed berbeda.
13. Overfeed Out dan dancing roller menjadi critical process parameter.
14. Jumlah Speed Feeding Bianco tetap TBD sampai data aktual diberikan.
15. Output reference speed belum ditetapkan sebelum counter dan metode produksi divalidasi.

---

## 23. Batasan Versi Ini

Versi ini belum menetapkan sequence final, jumlah Speed Feeding Bianco, mapping motor-drive, target atau ratio speed, dancing roller unit, formula contact time, formula output resmi, dosis chemical, quality limit, nama tag PLC, protokol, atau tindakan otomatis ke mesin. Detail tersebut memerlukan data aktual dan persetujuan process owner, production, quality, engineering, maintenance, dan safety.



