# Konsep Mesin Kalender

**Versi:** 1.1  
**Status:** Konsep diperbarui dengan detail sensor dan motor  
**Tanggal:** 14 Agustus 2026  
**Kategori proses:** Finishing dan perapihan kain  
**Proses sebelumnya:** Dryer  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Catatan:** Daftar sensor dan motor utama telah diperbarui. Nama tag PLC, unit, range, alarm limit, sinyal drive, dan hubungan sebab-akibat masih harus divalidasi.

---

## Ringkasan Update v1.1

Versi ini mempertahankan konsep proses v1.0 dan menambahkan:

- Temperature inlet.
- Dancing roller measurement.
- Fabric width measurement.
- Motor inlet.
- Motor Expander L dan Expander R.
- Motor Upper Felt dan Lower Felt.
- Motor Cooling Belt.
- Motor Conveyor Belt.
- Motor Plaiter.
- Motor Conveyor Table.
- Motor Up Down Table.
- Equipment relationship, alarm context, monitoring priority, dan root-cause context untuk sensor serta motor tersebut.

---

## 1. Ringkasan Mesin

Mesin Kalender merupakan proses lanjutan setelah Dryer. Kain yang keluar dari Dryer dalam kondisi semi-kering dimasukkan ke Kalender untuk dirapikan. Secara fungsi, proses ini menyerupai penyetrikaan kain.

Kain melewati dua bagian utama yang disebut:

- Upper felt.
- Lower felt.

Upper felt dan lower felt menggunakan panas dari steam untuk memanaskan kain selama melewati mesin. Kondisi mekanis dan termal pada kedua sisi perlu dijaga agar proses merata.

Parameter kritis awal yang telah diidentifikasi:

- Loadcell upper.
- Loadcell lower.
- Temperature upper.
- Temperature lower.
- Overfeed.

Parameter tersebut memiliki pengaruh terhadap karakter hasil kain, terutama:

- Gramasi kain.
- Bowing atau kemiringan serat.
- Shrinkage atau perubahan dimensi kain.

Dalam SCADA / MES, Kalender harus dipandang sebagai proses transformasi kualitas. Sistem tidak cukup hanya menampilkan parameter aktual, tetapi harus menghubungkan setting dan kondisi aktual mesin dengan identitas kain, kondisi keluaran Dryer, hasil QC, output, serta riwayat proses sebelumnya.

---

## 2. Informasi yang Sudah Dikonfirmasi

Baseline menggunakan informasi berikut sebagai fakta awal:

1. Kalender digunakan setelah proses Dryer.
2. Kain masuk ke Kalender dalam kondisi semi-kering.
3. Tujuan proses adalah merapikan kain seperti proses menyetrika.
4. Mesin memiliki upper felt dan lower felt.
5. Steam digunakan untuk menghasilkan panas pada proses upper dan lower.
6. Parameter proses mencakup loadcell upper dan lower.
7. Parameter proses mencakup temperature upper dan lower.
8. Overfeed merupakan parameter proses penting.
9. Parameter tersebut memengaruhi gramasi, bowing, dan shrinkage.

Detail lain dalam dokumen ini adalah konsep awal yang perlu dikonfirmasi di lapangan.

---

## 3. Posisi Kalender dalam Digital Thread

Hubungan data konseptual:

**Customer Order → Identitas Kain → Lot / Roll → Dyeing and Washing History → Dryer Process Run → Kalender Process Run → Setting and Actual Profile → Output Roll → Finishing QC**

Sistem perlu mempertahankan identitas kain dari proses sebelumnya hingga Kalender. Dengan hubungan ini, sistem diharapkan dapat menjawab:

- Roll, lot, atau batch mana yang sedang diproses?
- Dryer mana yang memproses kain sebelumnya?
- Bagaimana kondisi kain ketika keluar dari Dryer?
- Recipe atau setup Kalender apa yang digunakan?
- Berapa loadcell upper dan lower selama proses?
- Berapa temperatur upper dan lower?
- Berapa setting dan actual overfeed?
- Apakah terdapat ketidakseimbangan upper dan lower?
- Pada bagian kain mana parameter mengalami penyimpangan?
- Bagaimana hasil gramasi, bowing, dan shrinkage?
- Apakah penyimpangan hasil berasal dari Kalender atau sudah muncul dari proses sebelumnya?

---

## 4. Handover Dryer ke Kalender

Perpindahan kain dari Dryer ke Kalender perlu dicatat sebagai material handover.

Informasi minimum:

- Customer dan production order.
- Article atau jenis kain.
- Lot, batch, dan roll.
- Nomor warna bila relevan.
- Dryer sumber.
- Dryer process run ID.
- Waktu selesai Dryer.
- Quantity, panjang, atau berat kain.
- Kondisi atau hasil QC sementara jika tersedia.
- Kalender tujuan.
- Waktu antre dan waktu mulai Kalender.
- Operator dan shift.

### 4.1 Kandidat kondisi kain masuk

Data berikut belum dikonfirmasi tetapi perlu dievaluasi karena dapat memengaruhi hasil Kalender:

- Moisture kain setelah Dryer.
- Temperatur kain masuk.
- Lebar kain masuk.
- Gramasi sebelum Kalender.
- Tension dari proses sebelumnya.
- Bowing atau shrinkage sebelum Kalender.

Tanpa kondisi input, sistem berisiko menyimpulkan Kalender sebagai penyebab masalah yang sebenarnya berasal dari Dryer atau proses sebelumnya.

---

## 5. Kalender Process Run Record

Setiap pelaksanaan proses Kalender perlu memiliki satu record yang menghubungkan material, setup, actual parameter, event, output, dan QC.

| Kelompok | Informasi minimum |
|---|---|
| Order | Customer, order, dan production order |
| Material | Article, lot, roll, batch, quantity |
| Upstream | Dryer ID, process run, waktu selesai, kondisi output |
| Setup | Recipe atau setup ID dan version |
| Upper | Loadcell dan temperature target serta actual |
| Lower | Loadcell dan temperature target serta actual |
| Feeding | Overfeed target dan actual |
| Execution | Kalender ID, start, end, operator, shift |
| Output | Counter, panjang, berat, atau roll hasil |
| Event | Start, stop, slowdown, alarm, override, setup change |
| Quality | Gramasi, bowing, shrinkage, disposition |

---

## 6. Recipe atau Setup Kalender

Setup Kalender dapat berbeda berdasarkan article, jenis kain, kondisi input, dan target kualitas.

Struktur konseptual setup:

- Setup ID dan version.
- Article atau product family.
- Target gramasi.
- Batas bowing.
- Target atau batas shrinkage.
- Loadcell upper setpoint atau range.
- Loadcell lower setpoint atau range.
- Temperature upper setpoint atau profile.
- Temperature lower setpoint atau profile.
- Overfeed setpoint atau range.
- Speed setpoint bila berlaku.
- Steam condition bila tersedia.
- Tolerance setiap parameter.
- Approval status dan masa berlaku.

### 6.1 Setup versioning

Perubahan setpoint atau operating window menghasilkan version baru. History process run harus menunjuk ke version yang benar-benar digunakan.

### 6.2 Planned versus actual

Untuk setiap run, sistem membandingkan:

- Setpoint dan actual setiap parameter.
- Average, minimum, maximum, dan variability.
- Durasi di luar tolerance.
- Ketidakseimbangan upper dan lower.
- Manual override atau perubahan setting.
- Hasil QC terhadap target.

---

## 7. Tahapan Operasi Konseptual

Sequence berikut merupakan model awal:

1. Roll atau batch diidentifikasi.
2. Kondisi hasil Dryer diverifikasi.
3. Kalender dan setup dipilih.
4. Kain dimasukkan atau dilakukan threading.
5. Steam dan heating system disiapkan.
6. Temperature upper dan lower mencapai kondisi siap.
7. Loadcell upper dan lower disiapkan pada target.
8. Overfeed ditetapkan.
9. Mesin mulai menjalankan kain.
10. Parameter dijaga dalam operating window.
11. Output direkam dan direkonsiliasi.
12. Roll dikeluarkan.
13. Process run diselesaikan.
14. Kain diteruskan ke QC atau proses berikutnya.

### 7.1 Machine state konseptual

- Offline.
- Ready.
- Heating.
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

State final perlu dipetakan dengan PLC dan HMI aktual.

---

## 8. Loadcell Upper dan Lower

Loadcell upper dan lower menjadi parameter mekanis utama. Fungsi fisik, lokasi pemasangan, unit, dan interpretasi nilainya masih perlu dikonfirmasi. Sistem tidak boleh mengasumsikan nilai tersebut sebagai pressure atau tension sebelum diverifikasi.

### 8.1 Data yang perlu direkam

- Loadcell upper setpoint dan actual.
- Loadcell lower setpoint dan actual.
- Unit engineering.
- Average, minimum, maximum, dan standard deviation.
- Durasi di luar tolerance.
- Selisih upper terhadap lower.
- Rasio atau balance upper-lower jika disetujui engineering.
- Perubahan nilai saat start, stop, dan speed change.
- Sensor quality dan calibration status.

### 8.2 Analisis yang direncanakan

- Stabilitas loadcell sepanjang roll.
- Ketidakseimbangan upper dan lower.
- Hubungan loadcell dengan gramasi.
- Hubungan loadcell dengan bowing.
- Hubungan loadcell dengan shrinkage.
- Perbandingan setting pada article yang sama.
- Deteksi drift sensor atau penurunan mekanis.

### 8.3 Hipotesis proses

Perubahan loadcell dapat mengubah kondisi mekanis kain ketika melewati felt. Dampak aktualnya terhadap struktur kain, gramasi, bowing, dan shrinkage perlu dipelajari dari data historis dan validasi process engineer.

Sistem harus membedakan:

- Loadcell setpoint yang salah.
- Actual loadcell gagal mengikuti setpoint.
- Ketidakseimbangan upper dan lower.
- Sensor loadcell tidak valid.
- Gangguan mekanis yang menyebabkan nilai berfluktuasi.

---

## 9. Temperature Inlet, Upper, dan Lower

Temperature inlet menunjukkan kondisi termal kain ketika memasuki Kalender. Temperature upper dan lower menunjukkan kondisi termal pada dua sisi proses.

### 9.1 Data yang perlu direkam

- Temperature inlet actual.
- Temperature upper setpoint dan actual.
- Temperature lower setpoint dan actual.
- Heating start dan ready time.
- Waktu mencapai target upper dan lower.
- Average, minimum, maximum, dan variability.
- Durasi di luar tolerance.
- Selisih temperatur upper dan lower.
- Perubahan dari inlet menuju upper dan lower process zone.
- Temperatur ketika stop dan restart.
- Sensor quality dan calibration status.

### 9.2 Analisis yang direncanakan

- Kondisi temperatur kain ketika masuk dari Dryer.
- Kepatuhan actual upper dan lower terhadap setpoint.
- Stabilitas temperatur selama running.
- Heating terlalu lambat.
- Overshoot dan undershoot.
- Ketidakseimbangan temperatur upper-lower.
- Perubahan termal dari inlet sampai proses felt.
- Pengaruh temperatur inlet, upper, dan lower terhadap gramasi, bowing, serta shrinkage.
- Recovery time setelah stop.
- Perbandingan dengan golden run.

### 9.3 Temperature inlet sebagai upstream context

Temperature inlet membantu membedakan variasi yang berasal dari Dryer dengan gangguan pemanasan di Kalender. Jika input temperature berubah signifikan, setting Kalender yang sama dapat menghasilkan respons berbeda.

Temperature inlet harus dikaitkan dengan:

- Dryer process run.
- Waktu kain keluar dari Dryer.
- Waktu tunggu menuju Kalender.
- Speed atau segment position.
- Article dan kondisi kain.
- Temperature upper-lower pada segmen yang sama.

### 9.4 Keseimbangan termal

Selisih temperatur upper dan lower diperlakukan sebagai parameter tersendiri. Nilai rata-rata yang baik belum menjamin kedua sisi seimbang. Batas perbedaan harus ditentukan berdasarkan data dan engineering review.

---

## 10. Overfeed

Overfeed merupakan parameter feeding yang memengaruhi cara kain masuk dan diproses oleh Kalender. Definisi teknis, formula, satuan, dan reference speed aktual masih perlu dikonfirmasi.

### 10.1 Data yang perlu direkam

- Overfeed setpoint.
- Overfeed actual.
- Unit atau persentase.
- Reference speed yang digunakan controller.
- Average, minimum, dan maximum.
- Durasi di luar tolerance.
- Perubahan overfeed selama run.
- Manual override.

### 10.2 Analisis yang direncanakan

- Kepatuhan actual terhadap setpoint.
- Stabilitas overfeed sepanjang roll.
- Hubungan overfeed dengan gramasi.
- Hubungan overfeed dengan shrinkage.
- Hubungan overfeed dengan bowing.
- Interaksi overfeed dengan speed, loadcell, dan temperatur.
- Perbandingan antar-article dan setup.

### 10.3 Hipotesis proses

Overfeed dapat memengaruhi kepadatan atau relaksasi kain dan perubahan dimensi hasil. Arah serta besarnya pengaruh tidak boleh ditetapkan secara umum karena dapat berbeda berdasarkan jenis kain, konstruksi serat, kondisi input, speed, dan parameter mesin lain.

---

## 11. Integrasi Steam

Steam digunakan sebagai sumber panas pada proses upper dan lower. Kondisi steam perlu dihubungkan dengan performa temperatur Kalender.

### 11.1 Kandidat data steam

- Steam supply status.
- Header pressure dan temperature.
- Steam valve command dan feedback untuk upper.
- Steam valve command dan feedback untuk lower.
- Steam flow atau total consumption jika tersedia.
- Condensate condition atau return jika diukur.
- Boiler atau steam utility alarm.

### 11.2 Analisis yang direncanakan

- Waktu heating upper dan lower.
- Temperatur gagal mencapai target akibat supply steam.
- Perbedaan respons upper dan lower.
- Steam consumption per roll, meter, atau kilogram kain.
- Recovery setelah stop.
- Pemisahan gangguan supply steam dari gangguan valve, sensor, atau heat transfer di mesin.

### 11.3 Hipotesis gangguan heating

Jika temperatur tidak mencapai target, kandidat penyebab dapat berupa:

- Steam supply tidak mencukupi.
- Valve tidak mengikuti command.
- Condensate atau heat transfer bermasalah.
- Sensor temperatur tidak valid.
- Setting atau limit controller.
- Demand steam pabrik sedang tinggi.

Kesimpulan memerlukan data dan validasi engineering.

---

## 12. Quality Characteristics

### 12.1 Gramasi

Gramasi merupakan berat kain per satuan luas. Sistem perlu menyimpan:

- Target gramasi.
- Actual gramasi.
- Unit dan metode pengukuran.
- Sample location dan timestamp.
- Tolerance.
- Inspector atau alat ukur.
- Status pass, hold, rework, atau reject.

Jika terdapat beberapa sample sepanjang roll, posisinya perlu dikaitkan dengan timeline proses agar dapat dibandingkan dengan parameter mesin pada bagian kain yang sama.

### 12.2 Bowing

Bowing menggambarkan ketidaksesuaian arah atau bentuk serat yang melengkung atau miring terhadap arah yang diharapkan. Definisi pengukuran resmi, unit, dan batas penerimaan perlu diberikan oleh QC.

Data minimum:

- Nilai atau classification bowing.
- Posisi sample pada roll.
- Metode ukur.
- Batas specification.
- Hasil dan disposition.

### 12.3 Shrinkage

Shrinkage menggambarkan perubahan dimensi kain. Sistem perlu membedakan arah dan metode pengukuran sesuai standar pabrik.

Data minimum:

- Target dan actual shrinkage.
- Arah pengukuran jika berlaku.
- Metode test dan kondisi test.
- Sample location.
- Tolerance dan disposition.

### 12.4 Positional mapping

Agar analisis akurat, hasil QC perlu dikaitkan dengan posisi kain atau waktu ketika bagian tersebut melewati Kalender. Kandidat metode:

- Meter counter.
- Roll position.
- Timestamp correlation.
- Segment ID.
- Marker atau sample event.

---

## 13. Kandidat Parameter Tambahan

Data berikut belum dikonfirmasi tetapi perlu diperiksa saat survey:

| Kandidat data | Potensi fungsi |
|---|---|
| Machine speed dan counter | Output, dwell time, dan positional mapping |
| Moisture inlet dan outlet | Kondisi material serta pengaruh proses |
| Fabric tension | Bowing dan kestabilan feeding |
| Motor current dan load | Equipment condition |
| Felt speed atau slip | Sinkronisasi upper dan lower |
| Steam pressure dan flow | Heating performance dan utility |
| Valve position | Respons heating control |
| Condensate parameter | Efisiensi perpindahan panas |

Data hanya dijadikan bagian final setelah ketersediaan dan use case-nya dikonfirmasi.

---

## 14. Sensor dan Motor Hierarchy v1.1

### 14.1 Sensor yang sudah dikonfirmasi

| Sensor atau measurement | Asset context | Fungsi konseptual |
|---|---|---|
| Loadcell upper | Upper process / felt | Monitoring kondisi mekanis sisi upper |
| Loadcell lower | Lower process / felt | Monitoring kondisi mekanis sisi lower |
| Temperature inlet | Inlet | Mengetahui kondisi termal kain masuk dari Dryer |
| Temperature upper | Upper heating / felt | Monitoring kondisi termal sisi upper |
| Temperature lower | Lower heating / felt | Monitoring kondisi termal sisi lower |
| Dancing roller | Feeding / tension-control area | Mengetahui posisi atau respons dancing roller; makna dan unit final perlu dikonfirmasi |
| Fabric width | Fabric path / measurement point | Mengetahui lebar kain aktual sepanjang process run |

Setiap sensor perlu memiliki actual value, engineering unit, timestamp, data quality, source PLC, range, alarm limit, dan calibration status.

### 14.2 Motor yang sudah dikonfirmasi

| Motor atau driven equipment | Asset context | Fungsi konseptual |
|---|---|---|
| Inlet | Fabric inlet | Menggerakkan bagian masuk kain |
| Expander L | Left expander | Menggerakkan atau mengatur expander sisi kiri |
| Expander R | Right expander | Menggerakkan atau mengatur expander sisi kanan |
| Upper Felt | Upper felt assembly | Menggerakkan upper felt |
| Lower Felt | Lower felt assembly | Menggerakkan lower felt |
| Cooling Belt | Cooling section | Menggerakkan cooling belt |
| Conveyor Belt | Fabric transport | Menggerakkan conveyor belt |
| Plaiter | Output arrangement | Menjalankan plaiter |
| Conveyor Table | Output table conveyor | Menggerakkan conveyor table |
| Up Down Table | Output table positioning | Menggerakkan mekanisme naik-turun table |

Fungsi detail, jumlah motor fisik, serta apakah setiap nama mewakili motor, drive, atau mechanism perlu dikonfirmasi dari drawing dan PLC.

### 14.3 Kandidat data motor dan drive

- Run dan stop status.
- Ready dan fault status.
- Local, remote, manual, atau auto mode.
- Speed setpoint dan actual.
- Frequency.
- Current.
- Power dan energy.
- Operating hours.
- Start count.
- Overload dan trip.
- Drive alarm code.
- Interlock atau permissive.
- Bearing temperature dan vibration jika ada sensor.

### 14.4 Equipment relationship

**Kalender Machine**

- Inlet section.
  - Temperature inlet sensor.
  - Inlet motor.
  - Dancing roller.
- Fabric spreading section.
  - Expander L motor.
  - Expander R motor.
  - Fabric width sensor.
- Upper section.
  - Upper loadcell.
  - Upper temperature sensor.
  - Upper felt motor.
- Lower section.
  - Lower loadcell.
  - Lower temperature sensor.
  - Lower felt motor.
- Cooling section.
  - Cooling belt motor.
- Transport section.
  - Conveyor belt motor.
- Output section.
  - Plaiter motor.
  - Conveyor table motor.
  - Up Down Table motor.
- Steam supply dan control valve.
- Main control, safety, dan interlock.
- PLC atau machine controller.

### 14.5 Analisis balance dan synchronization

Equipment berpasangan perlu dianalisis bersama:

- Expander L versus Expander R.
- Upper Felt versus Lower Felt.
- Loadcell upper versus loadcell lower.
- Temperature upper versus temperature lower.
- Dancing roller response versus inlet dan overfeed.
- Fabric width versus expander, overfeed, loadcell, bowing, serta shrinkage.

Perbedaan speed, load, current, atau state pada pasangan equipment dapat menjadi tanda ketidakseimbangan mekanis atau control issue. Kesimpulan memerlukan validasi engineering.

### 14.6 Konsep naming

Naming final mengikuti standard tag pabrik. Konsep identitas:

**Plant → Area → Kalender ID → Equipment → Measurement**

Contoh label konseptual:

- Kalender / Inlet / Temperature.
- Kalender / Dancing Roller / Position.
- Kalender / Fabric Width / Actual.
- Kalender / Expander L / Motor / Run Status.
- Kalender / Upper Felt / Motor / Current.
- Kalender / Up Down Table / Motor / Fault.

Label tersebut bukan nama tag PLC final.

---

## 15. Prioritas Data

### Priority 1 — Baseline wajib

| Data | Fungsi |
|---|---|
| Machine ID dan state | Identitas dan kondisi Kalender |
| Roll, lot, atau batch ID | Traceability kain |
| Dryer source | Hubungan proses sebelumnya |
| Setup ID dan version | Standar proses |
| Loadcell upper setpoint dan actual | Parameter mekanis kritis |
| Loadcell lower setpoint dan actual | Parameter mekanis kritis |
| Temperature inlet actual | Kondisi kain masuk dari Dryer |
| Temperature upper setpoint dan actual | Parameter termal kritis |
| Temperature lower setpoint dan actual | Parameter termal kritis |
| Dancing roller actual | Kondisi feeding atau tension-control |
| Fabric width actual | Lebar kain dan dimensional context |
| Overfeed setpoint dan actual | Parameter feeding kritis |
| Motor state untuk semua equipment v1.1 | Equipment operation dan fault context |
| Start, stop, dan end time | Timeline process run |
| Alarm dan event | Analisis abnormal condition |
| Gramasi, bowing, dan shrinkage | Hubungan proses dengan kualitas |

### Priority 2 — Sangat disarankan

- Speed dan length counter.
- Steam supply, valve command, dan feedback.
- Operator dan shift.
- Stop reason dan slowdown reason.
- Manual override dan setup change.
- Input dan output quantity.
- Moisture jika tersedia.
- Speed, current, power, dan operating hours untuk setiap motor.

### Priority 3 — Analitik lanjutan

- Steam flow dan energy consumption.
- Fabric tension.
- Motor current, power, vibration, dan bearing temperature.
- Felt speed, synchronization, atau slip.
- High-frequency loadcell dan drive data.

---

## 16. Alarm dan Abnormal Condition

### Process alarm

- Loadcell upper terlalu tinggi atau rendah.
- Loadcell lower terlalu tinggi atau rendah.
- Upper-lower loadcell imbalance.
- Temperature inlet di luar input operating window.
- Temperature upper terlalu tinggi atau rendah.
- Temperature lower terlalu tinggi atau rendah.
- Fabric width di luar target atau berubah tidak normal.
- Dancing roller berada di luar range atau tidak stabil.
- Upper-lower temperature imbalance.
- Heating gagal mencapai target.
- Overfeed di luar operating window.
- Parameter tidak stabil terlalu lama.

### Equipment alarm kandidat

- Upper atau lower heating fault.
- Steam valve command-feedback mismatch.
- Loadcell atau temperature sensor fault.
- Inlet motor fault.
- Expander L atau Expander R motor fault.
- Expander L-R synchronization problem.
- Upper Felt atau Lower Felt motor fault.
- Upper-Lower felt synchronization problem.
- Cooling Belt motor fault.
- Conveyor Belt motor fault.
- Plaiter motor fault.
- Conveyor Table motor fault.
- Up Down Table motor fault.
- Dancing roller sensor fault.
- Fabric width sensor fault.
- Felt atau roller synchronization problem.
- Encoder atau counter fault.
- Communication loss.
- Safety interlock active.

### Quality risk warning

- Kombinasi parameter mendekati pola historis batch bermasalah.
- Setup tidak cocok dengan article.
- Kondisi output Dryer belum memenuhi persyaratan masuk Kalender.
- QC sampling diperlukan setelah deviation tertentu.

Batas alarm final belum ditentukan dan harus melalui alarm rationalization bersama process owner, engineering, QC, maintenance, dan safety.

---

## 17. Konsep Root Cause Analysis

Jika gramasi, bowing, atau shrinkage tidak sesuai, investigation view perlu menggabungkan:

1. Customer, article, lot, roll, dan batch.
2. Riwayat Jetflow, proses pencucian, dan Dryer jika tersedia.
3. Kondisi kain masuk dari Dryer.
4. Setup Kalender dan version.
5. Loadcell upper dan lower sepanjang roll.
6. Temperature inlet, upper, dan lower sepanjang roll.
7. Dancing roller dan fabric width profile.
8. Status, speed, current, atau fault motor yang tersedia.
9. Overfeed profile.
10. Speed, stop, dan slowdown jika tersedia.
11. Steam condition dan alarm.
12. Manual override dan operator action.
13. Gramasi, bowing, dan shrinkage per sample atau posisi.
14. Perbandingan dengan golden run.

### 17.1 Kandidat penyebab

- Loadcell upper atau lower keluar dari operating window.
- Ketidakseimbangan loadcell upper-lower.
- Temperatur tidak mencapai atau tidak stabil pada target.
- Ketidakseimbangan temperatur upper-lower.
- Overfeed tidak sesuai jenis kain atau target.
- Interaksi overfeed dengan speed dan loadcell.
- Gangguan steam.
- Expander L dan R tidak seimbang.
- Upper Felt dan Lower Felt tidak sinkron.
- Dancing roller tidak stabil.
- Fabric width keluar dari target.
- Inlet, cooling belt, conveyor, plaiter, atau table drive bermasalah.
- Felt, roller, drive, atau sensor bermasalah.
- Kondisi kain dari Dryer sudah tidak sesuai.
- Setup version salah atau material salah identifikasi.

Sistem memberikan kandidat dan bukti. Penyebab final harus dikonfirmasi melalui investigation workflow.

---

## 18. Multivariable Analysis

Gramasi, bowing, dan shrinkage kemungkinan dipengaruhi oleh interaksi beberapa parameter. Karena itu, analisis tidak boleh menilai satu parameter secara terpisah.

Hubungan yang perlu dipelajari:

- Loadcell upper × loadcell lower.
- Temperature upper × temperature lower.
- Overfeed × speed.
- Overfeed × loadcell.
- Temperature inlet × temperature upper-lower.
- Temperature × moisture input.
- Dancing roller × overfeed × fabric width.
- Expander L-R × fabric width × bowing.
- Loadcell balance × bowing.
- Overfeed × gramasi × shrinkage.
- Steam condition × temperature stability.
- Kondisi Dryer × setting Kalender.

Model analitik perlu dikelompokkan berdasarkan article atau jenis kain agar pola produk berbeda tidak dicampur menjadi satu baseline.

---

## 19. KPI Kalender Konseptual

### Produksi

- Output per shift.
- Average dan effective speed jika tersedia.
- Process run duration.
- Availability dan utilization.
- Stop count dan duration.
- Target attainment.

### Process

- Loadcell upper dan lower compliance.
- Loadcell balance compliance.
- Temperature upper dan lower compliance.
- Temperature balance compliance.
- Overfeed compliance.
- Fabric width compliance.
- Dancing roller stability.
- Motor availability dan synchronization.
- Setup adherence.
- Manual override count.

### Quality

- Gramasi compliance.
- Bowing compliance.
- Shrinkage compliance.
- First pass quality.
- Rework dan hold rate.

### Utility dan equipment

- Steam per roll, meter, atau kilogram bila tersedia.
- Heating time dan recovery time.
- Equipment alarm frequency.
- Unplanned downtime.

Formula final dan target belum ditetapkan.

---

## 20. Konsep Tampilan Dashboard

### Kalender fleet overview

- Semua Kalender dan state.
- Roll atau batch aktif.
- Dryer sumber.
- Setup aktif.
- Loadcell upper dan lower.
- Temperature upper dan lower.
- Overfeed.
- Progress, output, alarm, dan quality risk.

### Machine detail

- Machine state dan communication health.
- Material, setup, operator, dan shift.
- Live upper-lower comparison.
- Temperature inlet.
- Dancing roller dan fabric width.
- Trend loadcell, temperature, overfeed, dancing roller, dan width.
- Status seluruh motor dari inlet sampai Up Down Table.
- Steam dan heating status.
- Stop, alarm, dan override timeline.
- Output counter.

### Process run history

- Handover dari Dryer.
- Planned versus actual setiap parameter.
- Positional parameter profile sepanjang roll.
- Alarm dan event.
- Hasil gramasi, bowing, dan shrinkage.
- Final disposition.

### Quality correlation view

- Overlay hasil QC dengan posisi kain.
- Perbandingan antar-run dan antar-mesin.
- Golden run comparison.
- Pass versus rework comparison.

---

## 21. Peluang Analitik dan AI

### Tahap awal

- Deteksi deviation dan imbalance upper-lower.
- Deteksi parameter tidak stabil.
- Positional correlation dengan hasil QC.
- Automated loss dan alarm analysis.

### Tahap menengah

- Prediksi gramasi, bowing, dan shrinkage dari parameter proses.
- Anomaly detection loadcell, temperature, dan overfeed.
- Rekomendasi setup berdasarkan article dan kondisi input.
- Deteksi penurunan performa felt, drive, sensor, atau heating.

### Tahap lanjutan

- Optimisasi kombinasi loadcell, temperature, overfeed, dan speed.
- Feed-forward adjustment berdasarkan kondisi output Dryer.
- Prediksi quality sebelum hasil laboratory atau QC selesai.
- Predictive maintenance.
- Controlled write-back setelah safety dan quality validation.

AI tidak mengubah setting secara langsung pada tahap awal. Setiap rekomendasi harus menunjukkan faktor, data pendukung, confidence, operating limit, dan approval.

---

## 22. Tahapan Implementasi

### KL-0 — Survey

- Verifikasi jumlah, vendor, model, konstruksi, PLC, HMI, sequence, steam, sensor, dan QC.
- Pilih satu Kalender pilot.

### KL-1 — Visibility

- State, material, setup, loadcell, temperature, overfeed, alarm, historian, dan communication health.

### KL-2 — Traceability dan quality

- Handover Dryer, roll tracking, output, operator, stop reason, serta hasil gramasi, bowing, dan shrinkage.

### KL-3 — Utility dan equipment

- Steam, valve, equipment hierarchy, motor, felt, drive, dan maintenance.

### KL-4 — Analytics

- Golden run, multivariable analysis, root cause assistance, quality prediction, dan equipment anomaly.

### KL-5 — Optimization

- Setup recommendation, feed-forward dari Dryer, dan controlled write-back setelah validasi.

---

## 23. Acceptance Criteria Pilot Awal

Pilot dapat dianggap berhasil apabila:

1. Machine state dapat dibaca konsisten.
2. Roll atau batch aktif terhubung ke Kalender yang benar.
3. Hubungan ke Dryer sebelumnya dapat ditelusuri.
4. Setup ID dan version tersedia.
5. Loadcell upper-lower setpoint dan actual memiliki timestamp serta unit benar.
6. Temperature upper-lower setpoint dan actual tersedia.
7. Overfeed setpoint dan actual tersedia.
8. Alarm, stop, dan override dapat direkonstruksi menjadi timeline.
9. Process run history dapat dibuka kembali.
10. Gramasi, bowing, dan shrinkage dapat dihubungkan dengan run.
11. Operator, process engineer, dan QC memvalidasi data.

---

## 24. Informasi yang Diperlukan untuk v1.2

### Mesin dan equipment

- Jumlah Kalender.
- Vendor, model, kapasitas, PLC, HMI, dan protocol.
- Foto, manual, drawing, atau diagram mesin.
- Penjelasan fisik upper felt dan lower felt.
- Lokasi dan fungsi loadcell.
- Lokasi temperature inlet, upper, dan lower.
- Jenis sensor, unit, dan fungsi control dancing roller.
- Lokasi, unit, range, dan metode ukur fabric width.
- Detail motor, gearbox, drive, dan mekanisme untuk semua equipment v1.1.
- Steam circuit upper dan lower.
- Sequence aktual dari kain masuk sampai keluar.

### Parameter

- Unit loadcell dan arti fisik nilainya.
- Unit dan formula overfeed.
- Speed serta reference speed.
- Operating window per jenis kain.
- Existing tag list, alamat PLC, dan alarm limit.
- Run, ready, fault, speed, current, power, hour, dan alarm signal yang tersedia per motor.
- Interlock serta synchronization logic antar-equipment.
- Metode calibration sensor.

### Material dan quality

- Article atau jenis kain yang diproses.
- Target gramasi per produk.
- Definisi, unit, metode ukur, dan batas bowing.
- Definisi, arah, metode test, dan batas shrinkage.
- Posisi serta frekuensi sampling QC.
- Contoh kasus hasil tidak sesuai.

### Proses sebelumnya

- Data Dryer yang tersedia.
- Moisture, temperature, width, atau parameter input lain.
- Aturan release kain dari Dryer ke Kalender.

---

## 25. Keputusan Kalender v1.1

1. Kalender dimodelkan sebagai proses finishing setelah Dryer.
2. Identitas kain dipertahankan dari proses sebelumnya.
3. Upper felt dan lower felt menjadi equipment utama awal.
4. Loadcell upper-lower, temperature upper-lower, dan overfeed menjadi parameter kritis.
5. Target dan actual disimpan sebagai time-series.
6. Selisih atau balance upper-lower dianalisis sebagai parameter tersendiri.
7. Steam dikaitkan dengan performa temperatur.
8. Gramasi, bowing, dan shrinkage dikaitkan dengan posisi serta timeline proses.
9. Analisis menggunakan pendekatan multivariable dan dipisahkan per jenis kain.
10. Pilot dimulai read-only dan AI digunakan setelah validasi data.
11. Temperature inlet menjadi process context dari Dryer.
12. Dancing roller dan fabric width menjadi sensor atau measurement resmi dalam asset model.
13. Inlet, Expander L-R, Upper-Lower Felt, Cooling Belt, Conveyor Belt, Plaiter, Conveyor Table, dan Up Down Table menjadi motor equipment terpisah.
14. Equipment berpasangan dianalisis untuk balance dan synchronization.
15. Sinyal detail motor dan drive menunggu existing PLC tag list.

---

## 26. Batasan Versi Ini

Versi ini belum menetapkan sequence final, konstruksi detail upper atau lower felt, makna dan unit loadcell, formula overfeed, target parameter, operating window, formula output, metode QC, nama tag PLC, protokol, atau tindakan otomatis. Detail tersebut memerlukan referensi aktual serta persetujuan process owner, production, quality, engineering, maintenance, utility, dan safety.



