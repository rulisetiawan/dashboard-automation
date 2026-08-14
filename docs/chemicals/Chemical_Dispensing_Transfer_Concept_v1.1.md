# Konsep Chemical Dispensing dan Transfer

**Versi:** 1.1  
**Status:** Konsep diperbarui dengan jumlah dan lokasi dispensing  
**Tanggal:** 14 Agustus 2026  
**Kategori:** Chemical processing, dispensing, dan pipe transfer  
**Consumer utama:** Mesin Calator  
**Jumlah varian awal:** 7 varian chemical  
**Induk dokumentasi:** `SCADA_MES_Master_Concept_v1.0.md`  
**Referensi terkait:** `machines/Machine_Concept_Calator_v1.1.md`, `assets/Plant_Machine_Area_Mapping_v1.1.md`  
**Catatan:** Nama chemical, topology pipa, sequence transfer, instrumentasi, compatibility, dan safety interlock masih harus dikonfirmasi dari sistem aktual.

---

## 1. Ringkasan Sistem

Chemical dispensing dan transfer merupakan subsystem yang menyiapkan serta mengirim chemical atau obat menuju mesin Calator berdasarkan permintaan proses.

Sistem memiliki tujuh varian chemical. Chemical dialirkan melalui beberapa jalur pipa menuju Calator yang membutuhkan. Setiap permintaan harus dapat ditelusuri dari recipe dan process run Calator sampai chemical yang dipilih, quantity yang diminta, quantity aktual yang dikirim, jalur yang digunakan, waktu transfer, dan hasil proses kain.

Selain mendukung proses produksi, data dispensing menjadi dasar untuk mengetahui:

- Total penggunaan masing-masing varian chemical per hari.
- Penggunaan chemical setiap mesin Calator.
- Penggunaan per batch, roll, article, atau recipe.
- Target versus actual consumption.
- Sisa stock atau kebutuhan replenishment jika inventory tersedia.
- Transfer yang gagal, kurang, berlebih, atau tertunda.
- Potensi salah jalur atau salah chemical.
- Hubungan konsumsi chemical dengan kualitas hasil.

---

## 2. Informasi yang Sudah Dikonfirmasi

Baseline menggunakan informasi berikut sebagai fakta awal:

1. Terdapat proses chemical processing atau transfer obat.
2. Terdapat mesin dispensing untuk memasok chemical.
3. Chemical dialirkan melalui beberapa pipa.
4. Transfer berjalan berdasarkan permintaan dari mesin Calator.
5. Terdapat tujuh varian chemical.
6. Sistem perlu mengetahui penggunaan chemical per hari.
7. Sistem perlu mengetahui penggunaan chemical per mesin.
8. Terdapat total lima mesin dispensing Calator.
9. Area Depan memiliki satu mesin dispensing.
10. Area Belakang memiliki dua mesin dispensing.
11. Area Timur memiliki dua mesin dispensing.

Detail lainnya merupakan konsep awal yang perlu diverifikasi.

### 2.1 Topology dispensing per area

| Area | Jumlah Dispensing | Jumlah Calator | Rasio Aset Awal |
|---|---:|---:|---:|
| Depan | 1 | 2 | 1 : 2 |
| Belakang | 2 | 9 | 1 : 4,5 |
| Timur | 2 | 7 | 1 : 3,5 |
| **Total** | **5** | **18** | **1 : 3,6** |

Rasio hanya menunjukkan perbandingan jumlah mesin. Pembagian Calator destination, kemampuan transfer simultan, kapasitas, dan pipe route setiap dispensing masih harus dikonfirmasi.

---

## 3. Posisi dalam Digital Thread

Hubungan data konseptual:

**Customer Order → Identitas Kain → Calator Process Run → Washing / Softener Recipe → Chemical Request → Dispensing Transaction → Pipe Transfer → Calator Receipt → Actual Consumption → Output → QC Result**

Dengan hubungan ini, sistem diharapkan dapat menjawab:

- Calator mana yang meminta chemical?
- Roll, batch, dan recipe apa yang sedang diproses?
- Varian chemical mana yang diminta?
- Berapa target quantity berdasarkan recipe?
- Berapa actual quantity yang didispense dan dikirim?
- Jalur pipa mana yang digunakan?
- Kapan transfer mulai, selesai, atau gagal?
- Apakah chemical diterima Calator yang benar?
- Berapa penggunaan per varian, mesin, shift, dan hari?
- Apakah actual usage sesuai dengan output serta hasil QC?

---

## 4. System Boundary Konseptual

Boundary awal mencakup:

- Chemical master data.
- Tujuh varian chemical.
- Calator request.
- Lima dispensing machine yang tersebar di area Depan, Belakang, dan Timur.
- Source chemical point.
- Valve, pump, flow path, atau device transfer jika tersedia.
- Pipe route.
- Destination Calator.
- Transfer confirmation.
- Usage transaction.
- Consumption reporting.
- Alarm, event, dan audit trail.

Kandidat komponen yang belum dikonfirmasi:

- Bulk tank atau day tank.
- Mixing atau preparation tank.
- Weighing vessel.
- Flow meter atau mass flow meter.
- Pump dan valve otomatis.
- Return line.
- Flushing atau cleaning system.
- Chemical inventory system.

---

## 5. Chemical Master Data

Tujuh varian chemical harus memiliki identitas unik dan tidak hanya disebut berdasarkan nomor pipa.

Metadata konseptual setiap chemical:

- Chemical ID.
- Nama resmi dan nama operasional.
- Variant number dari 1 sampai 7.
- Chemical category.
- Unit penggunaan.
- Density jika diperlukan dan telah disetujui.
- Supplier dan product code jika relevan.
- Lot atau batch chemical jika diperlukan.
- Shelf life atau expiry bila berlaku.
- Storage requirement.
- Compatibility dan incompatibility.
- Safety Data Sheet reference.
- Approved recipe atau product family.
- Active atau inactive status.

### 5.1 Variant identity

Label “Varian 1” sampai “Varian 7” dapat digunakan sebagai placeholder. Nama final harus mengikuti master data resmi. Perubahan nama atau mapping tidak boleh mengubah history transaksi lama.

### 5.2 Unit standardization

Setiap chemical perlu memiliki unit resmi, misalnya massa atau volume sesuai proses aktual. Jika target recipe dan actual meter memakai unit berbeda, conversion rule harus terdokumentasi dan tervalidasi.

---

## 6. Chemical Request dari Calator

Setiap request perlu memiliki identitas unik agar tidak ada transfer yang tidak dapat ditelusuri.

### 6.1 Request data

- Request ID.
- Calator ID.
- Process run ID.
- Roll, batch, lot, dan article.
- Recipe ID dan version.
- Recipe step.
- Chemical ID atau varian.
- Target quantity.
- Unit.
- Requested time.
- Required-by time.
- Requesting system atau operator.
- Priority bila digunakan.
- Request status.

### 6.2 Request validation

Sebelum dispensing dimulai, sistem perlu memvalidasi secara konseptual:

- Calator dan process run masih aktif.
- Recipe dan version benar.
- Chemical termasuk dalam recipe.
- Quantity berada dalam limit yang diperbolehkan.
- Destination benar.
- Pipe route tersedia.
- Tidak ada transfer lain yang konflik.
- Chemical source cukup jika stock data tersedia.
- Safety dan equipment permissive terpenuhi.

Aturan validasi final mengikuti proses aktual dan tidak menggantikan safety interlock lokal.

### 6.3 Request status

- Created.
- Validating.
- Accepted.
- Queued.
- Dispensing.
- Transferring.
- Delivered.
- Confirmed.
- Completed.
- Rejected.
- Cancelled.
- Failed.
- Hold.

---

## 7. Dispensing dan Transfer Workflow

Sequence berikut merupakan model awal:

1. Calator membuat request berdasarkan recipe step.
2. Request divalidasi.
3. Chemical source dan pipe route dipilih.
4. Jalur dipastikan siap dan tidak konflik.
5. Dispensing transaction dimulai.
6. Chemical diukur atau ditimbang sesuai target.
7. Chemical ditransfer melalui pipa.
8. Actual quantity direkam.
9. Destination menerima atau mengonfirmasi transfer.
10. Jalur dikosongkan atau dibersihkan jika proses aktual memerlukan.
11. Transaction diselesaikan.
12. Actual consumption dikaitkan ke Calator process run.

Sequence aktual dapat berbeda dan harus disesuaikan dengan PLC, dispensing machine, serta SOP.

### 7.1 System state konseptual

- Offline.
- Ready.
- Waiting Request.
- Validating.
- Route Preparing.
- Dispensing.
- Transferring.
- Flushing atau Cleaning.
- Completed.
- Hold.
- Fault.
- Maintenance.

---

## 8. Dispensing Transaction Record

Setiap transfer menghasilkan record yang tidak boleh hilang meskipun transfer gagal.

| Kelompok | Informasi minimum |
|---|---|
| Request | Request ID, request time, required-by time |
| Production | Calator, process run, roll, batch, article, recipe |
| Chemical | Chemical ID, variant, lot jika tersedia |
| Quantity | Target, dispensed, transferred, received jika tersedia |
| Route | Source, dispensing unit, pipe route, destination |
| Execution | Start, end, duration, operator, mode |
| Status | Completed, partial, failed, cancelled, hold |
| Event | Alarm, interlock, override, retry, cleaning |
| Audit | Creator, approver, acknowledgement, correction history |

### 8.1 Quantity points

Sistem perlu membedakan quantity berikut jika instrumentasi memungkinkan:

- Requested quantity.
- Approved quantity.
- Dispensed quantity.
- Transferred quantity.
- Received quantity.
- Returned atau residual quantity.
- Consumed quantity.

Perbedaan antar-titik tidak langsung dianggap loss. Selisih dapat berasal dari metode ukur, residual di jalur, density conversion, timing, atau data yang belum tersedia.

---

## 9. Pipe Route Model

Setiap jalur pipa perlu dimodelkan sebagai asset dan route, bukan hanya tag valve.

Metadata konseptual:

- Pipe atau route ID.
- Source chemical point.
- Destination Calator.
- Chemical yang diperbolehkan.
- Valve dan pump yang terlibat.
- Route capacity jika tersedia.
- Estimated hold-up volume jika diketahui.
- Cleaning atau flushing requirement.
- Current route state.
- Last chemical transferred.
- Last cleaning status.

### 9.1 Route state

- Available.
- Reserved.
- Preparing.
- In Transfer.
- Draining.
- Flushing.
- Cleaning Required.
- Blocked.
- Fault.
- Maintenance.

### 9.2 Route conflict

Sistem perlu mencegah secara konseptual:

- Dua request menggunakan route yang sama secara bersamaan jika tidak diperbolehkan.
- Chemical dikirim ke destination yang salah.
- Valve path tidak sesuai route yang dipilih.
- Transfer dimulai ketika jalur belum siap.
- Chemical incompatible melewati jalur tanpa cleaning yang dipersyaratkan.

Proteksi aktual harus dilaksanakan oleh PLC dan safety interlock yang tervalidasi; dashboard hanya menampilkan, mengaudit, dan mendukung workflow sesuai hak akses.

---

## 10. Cross-Contamination dan Cleaning Context

Beberapa chemical dapat menggunakan jalur yang sama atau jalur berbeda. Konfigurasi aktual belum diketahui.

Jika jalur digunakan bersama, sistem perlu mempertimbangkan:

- Chemical sebelumnya.
- Chemical berikutnya.
- Compatibility matrix.
- Residual atau hold-up volume.
- Cleaning atau flushing requirement.
- Cleaning recipe.
- Cleaning start, end, dan result.
- Release atau confirmation sebelum transfer berikutnya.

Jika setiap varian memiliki pipa khusus, sistem tetap perlu merekam route identity dan line condition untuk traceability serta maintenance.

Aturan chemical compatibility harus berasal dari SDS, vendor, EHS, process engineering, dan SOP resmi.

---

## 11. Target dan Actual Chemical Usage

Target usage berasal dari recipe Calator. Actual usage berasal dari dispensing, transfer, receipt, atau metode measurement yang tersedia.

Perbandingan perlu dilakukan pada beberapa level:

- Per request.
- Per recipe step.
- Per Calator process run.
- Per roll atau batch.
- Per shift.
- Per day.
- Per Calator.
- Per chemical variant.
- Per article atau recipe.

### 11.1 Usage variance

Sistem menghitung selisih target dan actual dengan konteks:

- Absolute variance.
- Percentage variance.
- Direction: under-use atau over-use.
- Tolerance.
- Reason code.
- Operator comment.
- Quality impact.

Tolerance final harus ditentukan process owner dan quality.

---

## 12. Daily Usage per Chemical Variant

Untuk tujuh varian, dashboard harian perlu menampilkan:

| Informasi | Fungsi |
|---|---|
| Opening quantity atau stock | Kondisi awal hari jika inventory tersedia |
| Total requested | Total kebutuhan Calator |
| Total dispensed | Total yang diukur oleh dispensing |
| Total transferred | Total yang dikirim melalui pipa |
| Total consumed | Total yang dialokasikan ke process run |
| Adjustment | Koreksi yang memiliki approval |
| Closing quantity atau stock | Kondisi akhir hari jika tersedia |
| Variance | Selisih antar-sumber data |

Daily boundary harus mengikuti calendar dan shift definition resmi pabrik.

### 12.1 Daily usage per Calator

Untuk setiap Calator:

- Total per varian chemical.
- Total seluruh chemical.
- Jumlah request.
- Jumlah completed, partial, failed, atau cancelled transfer.
- Target versus actual.
- Usage per output.
- Usage per recipe dan article.
- Quality result.

### 12.2 Comparative view

- Calator versus Calator untuk recipe setara.
- Shift versus shift.
- Hari ini versus baseline.
- Recipe version lama versus baru.
- Batch pass versus rework.

---

## 13. Consumption Intensity

Total usage perlu dibagi dengan basis produksi yang relevan agar dapat dibandingkan.

Kandidat denominator:

- Per roll.
- Per batch.
- Per meter kain.
- Per kilogram kain.
- Per good output.
- Per process run.

Baseline chemical intensity perlu dipisahkan berdasarkan:

- Chemical variant.
- Calator.
- Article atau jenis kain.
- Recipe dan version.
- Nomor warna jika berpengaruh.
- Batch size.
- Quality disposition.

Satu baseline untuk semua produk dapat memberikan kesimpulan yang salah.

---

## 14. Inventory dan Stock Context

Inventory belum dikonfirmasi sebagai bagian dari sistem awal. Jika data tersedia, dispensing dapat dihubungkan dengan:

- Source tank atau container.
- Opening stock.
- Receipt atau replenishment.
- Dispensed quantity.
- Manual adjustment.
- Closing stock.
- Minimum stock.
- Reorder point.
- Chemical lot dan expiry.

### 14.1 Stock reconciliation

Konsep:

**Opening Stock + Receipt − Dispensed − Approved Adjustment = Expected Closing Stock**

Expected stock dibandingkan dengan actual measurement. Selisih perlu dianalisis terhadap measurement accuracy, residual, transfer, dan adjustment.

### 14.2 Demand forecast

Schedule Calator dan recipe dapat digunakan untuk memperkirakan kebutuhan masing-masing dari tujuh varian untuk shift, hari, atau periode berikutnya.

---

## 15. Kandidat Instrumentasi dan Data

### Priority 1 — Baseline wajib

| Data | Fungsi |
|---|---|
| Request ID | Traceability transaction |
| Calator dan process run ID | Destination dan production context |
| Recipe ID dan version | Dasar target chemical |
| Chemical ID / variant | Identitas obat |
| Target quantity dan unit | Planned usage |
| Actual dispensed quantity | Actual usage utama |
| Source dan destination | Transfer traceability |
| Pipe route | Jalur aktual |
| Start, end, dan status | Timeline transaction |
| Alarm dan event | Abnormal condition analysis |

### Priority 2 — Sangat disarankan

- Flow rate dan totalizer.
- Weight atau mass measurement.
- Source tank level.
- Pump status.
- Valve command dan feedback.
- Destination confirmation.
- Cleaning atau flushing status.
- Operator dan shift.
- Manual override dan reason code.
- Chemical lot.

### Priority 3 — Analitik lanjutan

- Pressure per route.
- Density atau temperature compensation jika diperlukan.
- Leak detection.
- Valve cycle dan pump condition data.
- High-frequency transfer profile.

Jenis instrument final mengikuti sistem aktual dan compatibility chemical.

---

## 16. Alarm dan Abnormal Condition

### Request alarm

- Chemical tidak sesuai recipe.
- Quantity melebihi limit.
- Calator atau process run tidak valid.
- Duplicate request.
- Request terlambat dipenuhi.

### Dispensing alarm

- Target quantity tidak tercapai.
- Over-dispensing.
- Measurement tidak stabil.
- Source chemical tidak cukup.
- Dispensing timeout.

### Transfer alarm

- Route tidak tersedia.
- Route conflict.
- Valve command-feedback mismatch.
- Pump trip.
- No-flow atau low-flow.
- Unexpected flow.
- Transfer timeout.
- Destination tidak mengonfirmasi receipt.

### Quality dan safety warning

- Salah chemical atau destination mismatch.
- Cleaning diperlukan.
- Chemical incompatibility risk.
- Actual usage di luar recipe tolerance.
- Sensor, flow meter, atau scale fault.
- Communication loss.

Alarm limit dan response procedure final mengikuti process, EHS, engineering, serta safety review.

---

## 17. Data Quality dan Audit Trail

Setiap transaksi harus dapat diaudit:

- Siapa atau sistem apa yang membuat request.
- Siapa yang memvalidasi atau menyetujui.
- Recipe dan version yang digunakan.
- Target dan actual quantity.
- Source, route, dan destination.
- Waktu setiap perubahan state.
- Alarm, override, retry, cancel, dan correction.
- Nilai sebelum dan sesudah correction.
- Alasan dan approver correction.

Data quality yang perlu dipantau:

- Communication status.
- Sensor quality.
- Last update.
- Calibration status.
- Missing interval.
- Counter reset atau rollover.
- Unit mismatch.
- Duplicate atau orphan transaction.

---

## 18. Root Cause dan Quality Analysis

Jika hasil Calator tidak sesuai, investigation view perlu menggabungkan:

1. Customer, article, lot, roll, dan batch.
2. Calator process run dan recipe version.
3. Chemical request.
4. Chemical variant dan lot jika tersedia.
5. Target, dispensed, transferred, dan received quantity.
6. Transfer route dan timeline.
7. Alarm, retry, cleaning, dan override.
8. Speed profile Calator.
9. Output dan hasil QC.
10. Perbandingan dengan run normal.

Kandidat penyebab dapat mencakup:

- Chemical variant salah.
- Quantity kurang atau berlebih.
- Transfer terlambat terhadap recipe step.
- Sebagian chemical tertinggal di jalur.
- Route belum bersih atau terjadi contamination.
- Measurement tidak valid.
- Recipe version atau material identity salah.
- Masalah berasal dari parameter Calator, bukan dispensing.

Sistem memberikan kandidat dan bukti. Keputusan final memerlukan review process, quality, dan engineering.

---

## 19. KPI Chemical Dispensing

### Usage

- Daily usage per variant.
- Daily usage per Calator.
- Usage per batch, roll, meter, atau kilogram kain.
- Usage per recipe dan article.
- Target versus actual variance.
- Good-output chemical intensity.

### Execution

- Request fulfillment time.
- Queue time.
- Dispensing dan transfer duration.
- On-time delivery rate.
- Completed, partial, failed, dan cancelled rate.
- Retry dan manual override count.

### Accuracy dan loss

- Dispensing accuracy.
- Transfer variance.
- Unaccounted chemical quantity.
- Stock reconciliation difference.
- Metering coverage.

### Quality dan reliability

- Quality issue terkait chemical.
- Wrong-route atau wrong-destination event.
- Cleaning compliance.
- Pump, valve, meter, dan communication availability.

Formula final dan target belum ditetapkan.

---

## 20. Konsep Dashboard

### Chemical operation overview

- Tujuh varian dan status masing-masing.
- Current request queue.
- Transfer aktif dan destination Calator.
- Source, route, target, dan actual quantity.
- Active alarm.
- System dan communication health.

### Daily consumption dashboard

- Total penggunaan tujuh varian hari ini.
- Breakdown per Calator.
- Breakdown per recipe dan article.
- Target versus actual.
- Usage intensity terhadap output.
- Trend per shift, hari, dan minggu.

### Pipe route view

- Source → dispensing unit → pipe route → Calator.
- Valve dan pump state jika tersedia.
- Current chemical dan last chemical.
- Cleaning status.
- Route conflict dan maintenance state.

### Transaction history

- Search berdasarkan request, Calator, batch, recipe, chemical, atau waktu.
- Full state timeline.
- Target dan actual quantity.
- Alarm, override, retry, dan correction.
- QC result terkait.

### Inventory view

Jika data tersedia:

- Stock tujuh varian.
- Daily consumption.
- Days of coverage.
- Reorder warning.
- Chemical lot dan expiry.

---

## 21. Peluang Analitik dan AI

### Tahap awal

- Target-versus-actual deviation detection.
- Abnormal daily usage.
- Request delay dan transfer loss analysis.
- Detection of flow ketika tidak ada request.

### Tahap menengah

- Forecast kebutuhan tujuh varian dari schedule Calator.
- Prediksi stock-out.
- Anomaly detection dispensing profile.
- Deteksi penurunan performa pump, valve, dan meter.
- Korelasi chemical usage dengan hasil QC.

### Tahap lanjutan

- Rekomendasi usage optimization per article dan recipe.
- Chemical inventory optimization.
- Request sequencing dan route scheduling.
- Predictive maintenance dispensing equipment.
- Closed-loop quantity correction hanya setelah process dan safety validation.

AI tidak memilih chemical, membuka valve, menjalankan pump, atau mengubah quantity secara langsung pada tahap awal. Semua rekomendasi memerlukan rule, limit, review, approval, dan safety interlock.

---

## 22. Safety, EHS, dan Cybersecurity

Chemical transfer memiliki risiko process, quality, environment, dan personnel safety.

Prinsip awal:

- Implementasi dashboard dimulai read-only.
- PLC dan local interlock tetap menjadi proteksi utama.
- Chemical compatibility mengikuti SDS dan SOP resmi.
- Valve path dan destination confirmation harus fail-safe.
- Manual override memiliki role, reason, time limit, dan audit.
- Tidak ada control command tanpa authorization dan safety review.
- Chemical name, label, unit, dan destination harus jelas.
- Spill, leak, exposure, dan emergency procedure mengikuti sistem EHS pabrik.
- Remote access mengikuti kebijakan OT cybersecurity.

Dokumen ini tidak menggantikan SOP chemical handling atau safety engineering.

---

## 23. Tahapan Implementasi

### CH-0 — Survey dan mapping

- Dokumentasikan tujuh varian chemical.
- Petakan source, dispensing unit, pipa, valve, pump, dan Calator.
- Kumpulkan P&ID, PLC, HMI, protocol, serta SOP.
- Verifikasi request dan transfer workflow aktual.
- Pilih satu Calator dan beberapa varian untuk pilot.

### CH-1 — Transaction visibility

- Request, chemical, target, actual, route, status, alarm, historian, dan communication health.

### CH-2 — Calator traceability

- Hubungkan request dengan recipe, process run, roll, batch, output, dan QC.

### CH-3 — Consumption dan inventory

- Daily usage per varian dan Calator.
- Flow, weight, stock, cleaning, serta reconciliation sesuai instrumentasi.

### CH-4 — Analytics

- Baseline, anomaly, root cause, quality correlation, forecast, dan predictive maintenance.

### CH-5 — Optimization

- Route scheduling, inventory optimization, recipe recommendation, dan controlled adjustment setelah validation.

---

## 24. Acceptance Criteria Pilot Awal

Pilot dapat dianggap berhasil apabila:

1. Satu Calator request memiliki request ID unik.
2. Request terhubung ke process run, roll atau batch, dan recipe yang benar.
3. Chemical variant dan target quantity diketahui.
4. Actual dispensed quantity memiliki unit, timestamp, dan data quality.
5. Source, route, serta destination dapat ditelusuri.
6. Start, end, status, alarm, dan retry dapat direkonstruksi.
7. Completed, partial, failed, dan cancelled transaction dapat dibedakan.
8. Daily usage dapat dihitung per varian dan Calator.
9. Actual usage dapat dikaitkan dengan output serta QC.
10. Operator dispensing, Calator, process engineer, dan EHS memvalidasi data.

---

## 25. Informasi yang Diperlukan untuk v1.1

### Chemical

- Nama dan fungsi ketujuh varian.
- Unit resmi penggunaan.
- Density atau conversion rule jika diperlukan.
- Compatibility matrix dan cleaning requirement.
- SDS reference dan storage rule.

### Equipment dan topology

- Vendor, model, PLC, HMI, dan protocol dispensing machine.
- P&ID atau diagram pipa.
- Source tank, weighing, meter, pump, valve, dan destination.
- Apakah pipa dedicated atau shared.
- Hold-up volume dan flushing system jika ada.
- Existing tag list dan alarm limit.

### Workflow

- Cara Calator membuat request.
- Automatic atau manual approval.
- Actual transfer sequence.
- Receipt confirmation.
- Handling partial, retry, cancel, dan emergency.

### Production dan reporting

- Recipe target per article.
- Satuan output resmi Calator.
- Definisi satu hari produksi dan shift.
- Metode laporan penggunaan saat ini.
- Inventory dan purchasing system yang tersedia.
- Contoh kasus salah quantity, gagal transfer, atau quality issue.

---

## 26. Keputusan Baseline Chemical v1.0

1. Chemical dispensing dimodelkan sebagai subsystem terpisah yang melayani Calator.
2. Terdapat tujuh varian chemical dengan master identity masing-masing.
3. Setiap request memiliki hubungan ke Calator process run, recipe, roll, dan batch.
4. Target dan actual quantity disimpan bersama.
5. Source, pipe route, dan destination menjadi bagian transaction traceability.
6. Penggunaan dihitung per varian, Calator, batch, shift, dan hari.
7. Consumption intensity dihubungkan dengan output dan quality.
8. Route conflict, salah chemical, salah destination, dan contamination menjadi risiko utama.
9. Transaction gagal tetap disimpan dalam history dan audit trail.
10. Implementasi dimulai read-only dan safety interlock lokal tetap independen.

---

## 27. Batasan Versi Ini

Versi ini belum menetapkan nama chemical, formula, dosis, compatibility, topology pipa, sequence final, vendor, PLC, tag, instrument accuracy, inventory method, limit, atau tindakan kontrol. Detail memerlukan P&ID, SOP, SDS, data aktual, serta persetujuan process owner, production, quality, chemical team, EHS, engineering, maintenance, OT, dan safety.




---

## Catatan Perubahan v1.1

- Menetapkan total lima mesin dispensing Calator.
- Menetapkan satu dispensing di area Depan.
- Menetapkan dua dispensing di area Belakang.
- Menetapkan dua dispensing di area Timur.
- Menghubungkan topology awal dispensing dengan 18 Calator berdasarkan area.
- Menambahkan kebutuhan mapping source–route–destination per dispensing.
