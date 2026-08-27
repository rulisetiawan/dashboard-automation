# Changelog Dokumentasi SCADA / MES

Dokumen ini mencatat perubahan seluruh dokumentasi konsep project. Versi lama tetap dipertahankan sebagai histori dan tidak ditimpa.

---

## PostgreSQL Local V1.4 — 27 Agustus 2026

**Status:** Akses LAN terbatas aktif

### Diaktifkan

- PostgreSQL tetap mendengarkan TCP port `5432` pada seluruh interface lokal.
- `pg_hba.conf` mengizinkan database `pt_smm_scada` dari `192.168.100.0/24` dengan autentikasi `scram-sha-256`.
- Windows Firewall mengizinkan inbound TCP `5432` hanya dari subnet yang sama.

### Keamanan dan batas sistem

- Tidak ada akses global `0.0.0.0/0`.
- Host `192.168.100.82` tetap merupakan komputer terpisah dan tidak ikut dikonfigurasi.
- Client harus dapat merutekan koneksi ke alamat aktif komputer database ini.

---

## Dashboard V2.3 — 26 Agustus 2026

**Status:** Asset heartbeat visibility

### Ditambahkan

- Status `Connected/Disconnected` pada direktori asset dan card mesin.
- Status `Controller Active/Controller Offline` pada overview, detail, dan P&ID Chemical Dispensing.
- Umur heartbeat dan timeout 30 detik yang diperbarui tanpa full-page render.

### Dipertahankan

- Machine state, valve position, alarm, dan connection state tetap dipisahkan.
- Satu heartbeat per asset; tidak ada heartbeat individual per valve.
- Interaction-safe rendering Dashboard v2.2.

---

## Chemical Dispensing Calator v1.11 — 26 Agustus 2026

**Status:** Controller connection visibility

### Ditambahkan

- Indikator controller pada seluruh card dispensing, header detail, dan header P&ID.
- Validasi live valve berdasarkan heartbeat asset.

### Dipertahankan

- Scope valve-only dari v1.10 tanpa mengaktifkan kembali motor tag atau diagnostic dispensing.

---

## P&ID Live State Architecture v1.2 — 26 Agustus 2026

**Status:** Asset communication projection implemented

### Ditambahkan

- Field communication pada Asset API dan snapshot.
- Event WebSocket `asset:communication` untuk card plant dan chemical.
- Full instrument snapshot tetap hanya dikirim ketika kualitas heartbeat berubah.

---

## Dashboard V2.2 — 26 Agustus 2026

**Status:** Source-aware realtime refresh

### Ditambahkan

- Selective endpoint refresh berdasarkan sumber database yang berubah.
- Render guard untuk pointer, form control, sidebar, dan modal.
- Preservation scroll serta update P&ID tanpa full render.

---

## P&ID Live State Architecture v1.1 — 26 Agustus 2026

**Status:** Asset heartbeat implemented

### Ditambahkan

- Satu canonical heartbeat untuk setiap 138 asset aktif.
- `tag_definition.freshness_mode` untuk memisahkan freshness diskrit dan analog.
- View `asset_communication_state` dan endpoint status komunikasi per asset.
- WebSocket full-asset refresh hanya ketika kualitas heartbeat berubah.
- Migration ledger `schema_migration` agar migration hanya dijalankan sekali dan aman saat backend restart.

### Perilaku

- Feedback diskrit menyimpan state terakhir selama heartbeat sehat.
- PV/SV analog tetap wajib segar per timestamp tag.
- Heartbeat timeout otomatis mengubah seluruh device asset menjadi stale tanpa menumpuk telemetry feedback.

---

## Chemical Dispensing Calator v1.10 — 26 Agustus 2026

**Status:** Valve-only registry

### Diubah

- Scope dispensing disederhanakan menjadi live valve monitoring tanpa motor tag/diagnostic.
- Registry area Belakang dan Timur diverifikasi lengkap sesuai jumlah route setiap unit.

### Dihapus

- 180 motor tag yang belum memiliki telemetry aktual.
- 15 motor equipment master dan 75 equipment telemetry test row melalui cascade.

### Hasil akhir

- 63 valve element dan 126 tag `OPEN_FB`/`FAULT_FB` untuk lima dispensing unit.

---

## Chemical Dispensing Calator v1.9 — 26 Agustus 2026

**Status:** Complete valve and motor registry

### Ditambahkan

- 8 inlet valve, transfer valve, dan route valve sesuai unit untuk seluruh lima dispensing.
- Feedback `OPEN_FB` dan `FAULT_FB` pada setiap valve.
- Master Inlet Pump, Tank 1 Mixer, dan Transfer Pump pada setiap dispensing.
- Status, fault, 3-phase current/voltage, kW, Hz, runtime, dan energy untuk setiap motor.
- Migration idempotent `0014_dispensing_calator_tag_registry.sql`.

### Diubah

- Initial SVG state tanpa telemetry menjadi netral; hijau hanya untuk state live aktual.

---

## Machine Kalender v1.20 — 26 Agustus 2026

**Status:** Correct cylinder wrap and loadcell rollers

### Diubah

- Kain merah melingkari cylinder Upper Felt dan Lower Felt.
- Felt tetap digambar sebagai loop segitiga yang membungkus cylinder.
- LC Upper dan LC Lower menjadi small measuring roller setelah keluaran felt terkait.
- Guide G1–G3 dihapus; proses berikutnya langsung menuju exit guide dan cooling belt.

---

## Machine Kalender v1.19 — 26 Agustus 2026

**Status:** Reference-aligned felt-loop flow

### Diubah

- Upper dan lower felt menjadi dua loop segitiga terpisah dengan guide serta drive roller.
- Expander menggunakan dua roller memanjang sesuai bentuk referensi.
- Jalur kain melewati contact/transfer guide G1–G3 di antara kedua loop, bukan membungkus cylinder secara langsung.
- Bagian proses lain dan seluruh live binding dipertahankan.

---

## Machine Kalender v1.18 — 26 Agustus 2026

**Status:** Simplified and corrected Expander–Upper/Lower flow

### Diubah

- Instrument yang mengganggu jalur dipindahkan ke status strip per process zone.
- Roller acak pada frame upper/lower dihapus dan diganti entry/exit guide yang memiliki fungsi jelas.
- Expander disusun pada satu sumbu diagonal; upper felt di atas-kiri dan lower felt di bawah-kanan mengikuti referensi.
- Jalur kain dibuat mengikuti upper dan lower felt sebelum keluar menuju cooling belt.
- Titik loadcell ditampilkan sebagai bearing point `LC-U` dan `LC-L`.

---

## Machine Kalender v1.17 — 26 Agustus 2026

**Status:** Corrected P&ID fabric flow

### Diubah

- Jalur kain dibuat satu arah dan kontinu dari fabric supply sampai plaiter output table.
- Posisi inlet roller, expander, guide roller, upper/lower cylinder, loadcell, cooling belt, dancing roller, conveyor, dan folder disusun ulang mengikuti alur aktual.
- Garis kain tidak lagi saling silang dan folded fabric ditempatkan di atas meja output.
- Kanvas diperlebar dan diberi pembagian empat process zone agar label tidak bertabrakan.

### Dipertahankan

- Seluruh `data-element-code`, live-state binding PostgreSQL/WebSocket, dan fungsi minimize P&ID tetap kompatibel.

---

## Batch Abnormal Log Backend Implementation v1.1 — 26 Agustus 2026

**Status:** Implemented foundation

### Ditambahkan

- Migration `0013_process_deviation_engine.sql` untuk rule, target revision, SV change, deviation event, dan durable state.
- NestJS Process Deviation Engine dengan lifecycle RAMPING/STABLE/DEVIATING, time-to-target, hold-target, hysteresis, confirmation time, dan pause saat HOLD.
- API konfigurasi serta endpoint target achievement, setpoint changes, abnormality pagination, dan acknowledgement.
- Target Achievement Log, Setpoint Change Log, Batch Abnormality Log aktual, form konfigurasi PV/SV, serta tambahan export PDF/XLSX.

### Diverifikasi

- Build frontend/backend berhasil, migration aktif di TimescaleDB lokal, dan lifecycle target/SV/deviation lolos uji end-to-end tanpa meninggalkan data dummy.

---

## Batch Abnormal Log Backend Flow v1.0 — 26 Agustus 2026

**Status:** Dokumentasi implementasi aktual dan target arsitektur

### Ditambahkan

- Dokumentasi alur Batch Abnormal Log dari telemetry, Alarm Engine, `alarm_event`, batch context, WebSocket, hingga export.
- Pemetaan batas implementasi saat ini: rule statis HIGH/LOW sudah aktif, sedangkan evaluasi dinamis PV terhadap SV per process step belum tersedia sebagai event khusus.
- Rancangan `process_deviation_rule`, `process_deviation_event`, state machine, API terpaging, korelasi langsung ke process run/step, dan roadmap implementasi.

---

## Machine Kalender v1.15 — 24 Agustus 2026

**Status:** Top-positioned collapsible P&ID

### Diubah

- P&ID dipindahkan tepat setelah header identitas mesin, sebelum card summary dan live sensor.

### Ditambahkan

- Tombol Minimize/Expand pada header P&ID.
- Toggle lokal tanpa page re-render sehingga scroll tidak berpindah dan panel tidak berkedip.
- Penyimpanan preference P&ID pada local browser storage agar tetap konsisten setelah realtime refresh atau reload.

### Dipertahankan

- SVG, element code, dan integrasi data tidak berubah.

---

## Machine Kalender v1.14 — 24 Agustus 2026

**Status:** Fabric path and collision refinement

### Diperbaiki

- Fabric path dibuat menjadi satu lintasan tanpa loop atau arah yang berulang.
- Loadcell dipindahkan dari fabric path menjadi instrument callout pada roll.
- Temperature Lower, Loadcell Lower, dan motor Lower dipisahkan agar tidak bertabrakan.
- Lower steam branch dipindahkan keluar dari area nip fabric.
- Ketebalan fabric path dan outline dikurangi untuk meningkatkan keterbacaan.

### Dipertahankan

- Seluruh `data-element-code` dan kesiapan binding ke `instrument_state` tidak berubah.

---

## Machine Kalender v1.13 — 24 Agustus 2026

**Status:** P&ID process schematic implemented

### Ditambahkan

- P&ID Kalender pada detail setiap asset Kalender.
- Empat zona proses: Infeed & Expander, Heating & Pressure, Cooling & Tension, serta Output.
- Fabric path kontinu dari inlet sampai lipatan kain di atas plaiter table.
- Steam header, inlet valve, upper/lower heating valve, temperature instrument, dan loadcell instrument.
- Cooling belt, dancing roller, conveyor belt, chute, plaiter, dan motor equipment.
- `data-element-code` untuk integrasi status melalui `instrument_state`.

### Diperbaiki

- Jalur fabric dan steam dipisahkan dengan warna serta hierarchy berbeda.
- Posisi equipment dan pipa diberi ruang tepi yang konsisten agar tetap terbaca pada halaman detail mesin.

---

## Chemical Dispensing Calator v1.7 — 24 Agustus 2026

**Status:** Modern industrial P&ID layout

### Diperbaiki

- Delapan inlet dipindahkan ke satu supply rack agar seluruh pipa masuk ke common manifold tanpa jalur silang.
- Tank 1, loadcell, transfer valve, transfer pump, Tank 2, dan distribution header disusun mengikuti arah proses yang konsisten.
- Cabang tujuan Calator dibuat sejajar dan diberi ruang tepi yang lebih lega.
- Simbol valve, actuator, pump, instrument bubble, vessel, flow arrow, dan equipment tag diperbarui menjadi lebih industrial.

### Ditambahkan

- Tiga zona proses visual: Supply, Weighing & Transfer, dan Calator Distribution.
- `data-element-code` pada valve, vessel, pump, manifold, loadcell, dan route untuk binding ke `instrument_state`.
- Label supply chemical dinamis dari hasil analytics PostgreSQL dengan fallback line generik tanpa nilai proses palsu.

---

## P&ID Live State Architecture v1.0 — 24 Agustus 2026

**Status:** Implemented live signal foundation

### Ditambahkan

- `tag_latest` sebagai generic latest-value store untuk seluruh canonical tag.
- Trigger historian agar seluruh jalur ingest otomatis memperbarui live value tanpa query tambahan di Node-RED.
- `instrument_state` sebagai operational view untuk element/parameter P&ID, effective quality, dan semantic state.
- Konfigurasi `stale_after_seconds` per tag dengan default awal 30 detik.
- REST API initial/delta state per asset dan filter element.
- WebSocket room per asset dengan event `instrument:delta`.

### Diverifikasi

- Data aktual memperbarui latest state otomatis.
- Legacy dan canonical tag terbaru sama-sama diparsing berdasarkan posisi `asset_id`.
- Valve feedback transactional menghasilkan `OPEN` tanpa meninggalkan dummy data.
- REST dan WebSocket asset-specific berhasil digunakan.

---

## TimescaleDB Historian Integration v1.0 — 22 Agustus 2026

**Status:** Active high-volume telemetry historian

### Ditambahkan

- `telemetry_sample` dikonversi menjadi hypertable dengan chunk harian.
- Continuous aggregate 1 menit, 15 menit, dan harian untuk query trend.
- Background refresh, raw retention 30 hari, aggregate retention bertingkat, dan columnstore setelah 7 hari.
- NestJS membaca continuous aggregate dan melaporkan versi TimescaleDB pada integration status.
- Tabel aggregate native tetap dipertahankan sebagai rollback path.

### Diverifikasi

- Seluruh 1.505.011 raw sample tetap tersedia setelah konversi.
- Hypertable terbagi menjadi 6 chunk dan tiga continuous aggregate aktif.

---

## External Batch Ingestion API v1.2 — 22 Agustus 2026

**Status:** Active batch snapshot projection

### Diperbaiki

- `batch_process_run` menjadi source of truth untuk nomor batch dan progress aktif.
- Progress disimpan langsung pada process run, bukan hanya pada snapshot.
- Trigger PostgreSQL mencegah refresh telemetry menghapus konteks batch aktif.
- API asset membaca active process run sebagai fallback snapshot.
- Sinkronisasi `KL-DPN-05` diverifikasi tetap bertahan setelah refresh Node-RED.

---

## External Batch Ingestion API v1.1 — 22 Agustus 2026

**Status:** Perbaikan process run progress desimal

### Diperbaiki

- `external_run_id` tetap diperlakukan sebagai text dan tidak memerlukan UUID.
- `process_run_id` tetap menjadi UUID internal yang dibuat otomatis oleh backend.
- Parameter `progress_percent` pada sinkronisasi `asset_snapshot` sekarang dicast sebagai numeric sehingga nilai desimal seperti `42.5` tidak lagi menghasilkan PostgreSQL `22P02`.
- Payload aktual diverifikasi menghasilkan HTTP `201` dan record process run tersimpan.

---

## Dashboard V2.1 — 22 Agustus 2026

**Status:** External production batch ingestion

### Ditambahkan

- `POST /api/v1/batch/production-batches` untuk upsert master batch.
- `POST /api/v1/batch/process-runs` untuk upsert pelaksanaan batch pada asset.
- Idempotency, stale-message protection, asset/process validation, dan active-run conflict protection.
- Metadata sumber eksternal dan raw metadata JSON pada PostgreSQL.
- Sinkronisasi batch context ke `asset_snapshot` serta WebSocket refresh.
- Optional `X-API-Key` enforcement melalui `INGEST_API_KEY`.

---

## Dashboard V2.0 — 22 Agustus 2026

**Status:** V2 development baseline

### Diubah

- Workspace aktif dinaikkan menjadi Dashboard V2.0.
- Badge versi dan package semantic version diperbarui.
- Namespace navigation, historian parameter, dan trend inspection state dipisahkan dari V1.
- Seluruh fitur final V1.63 dipertahankan sebagai baseline awal V2.

---

## Dashboard V1.63 — 22 Agustus 2026

**Status:** Final V1 presentation baseline

### Diperbaiki

- Tooltip dipulihkan pada siklus render yang sama sehingga tidak berkedip saat refresh real-time.
- Badge versi ditambahkan pada header.
- Source, build, backend, migrasi, dan dokumentasi dibekukan sebagai paket ZIP V1 terpisah tanpa credential.

---

## Dashboard V1.62 — 22 Agustus 2026

**Status:** Persistent trend inspection state

### Diperbaiki

- Tooltip line dan bar tidak lagi menghilang saat chart dirender ulang oleh refresh real-time.
- Titik waktu/kategori terakhir dipulihkan setelah reload halaman.
- Timestamp terdekat digunakan jika bucket historian sudah bergeser.
- Tooltip tetap ditutup saat pointer memang keluar dari grafik.

---

## Dashboard V1.61 — 22 Agustus 2026

**Status:** Interactive bar-chart tooltip

### Ditambahkan

- Hover/touch tooltip pada seluruh grafik batang.
- Highlight pada batang atau interval yang sedang dipilih.
- Chemical stacked bar menampilkan waktu, total konsumsi, dan rincian setiap chemical aktif.

---

## Dashboard V1.60 — 22 Agustus 2026

**Status:** Interactive trend value tooltip

### Ditambahkan

- Hover pointer, crosshair, dan marker titik pada line trend.
- Tooltip berisi timestamp, nama series, nilai dua digit desimal, serta engineering unit.
- Label khusus untuk PV/SV dan motor phase R/S/T.

---

## Dashboard V1.59 — 22 Agustus 2026

**Status:** Read-only machine alarm context

### Diubah

- Tombol `View` pada alarm note detail mesin dihapus.
- Note menampilkan waktu mulai, parameter/rule, threshold, unit, dan nilai aktual pemicu alarm.
- Alarm API diperkaya menggunakan metadata `alarm_rule` dan `tag_definition`.
- Layout note dirapikan untuk desktop, tablet, dan mobile.

---

## Dashboard V1.58 — 22 Agustus 2026

**Status:** Header alarm asset emphasis

### Diubah

- Alarm carousel dipindahkan ke sebelah kiri indikator LIVE.
- Asset ID dibuat lebih tebal dan kontras dibandingkan judul alarm.
- Asset dengan critical alarm menggunakan warna danger.

---

## Dashboard V1.57 — 22 Agustus 2026

**Status:** Compact active-alarm carousel

### Diubah

- Alarm banner besar diganti satu compact carousel di sebelah indikator LIVE.
- Tampilan awal hanya berisi severity, asset ID, dan judul alarm.
- Banyak alarm aktif tetap berada dalam satu container dengan previous/next dan swipe.
- Klik alarm langsung membuka detail mesin terkait, bukan Alarm & Event Log.
- Priority carousel mengikuti urutan critical, warning, lalu info.

---

## Dashboard V1.56 — 22 Agustus 2026

**Status:** Inline header alarm banner

### Diperbaiki

- Floating alarm dropdown dihapus.
- Alarm banner menjadi baris kedua di dalam container header.
- Header bertambah tinggi dan mendorong konten halaman sehingga tidak ada card atau menu yang tertutup.
- Isi alarm disusun horizontal dan responsif agar tinggi banner tetap ringkas.

---

## Dashboard V1.55 — 22 Agustus 2026

**Status:** Header alarm notification panel

### Diubah

- Popup alarm dipindahkan ke panel yang terikat pada ikon alarm di header kanan atas.
- Alarm notification dan general application toast menggunakan container terpisah.
- Panel alarm memiliki batas tinggi dan scroll internal agar tidak menghalangi kontrol bagian bawah halaman.
- Lifecycle critical, warning, minimize, close, badge, dan navigasi menuju tabel alarm aktif tetap dipertahankan.

---

## Dashboard V1.54 — 22 Agustus 2026

**Status:** Active alarm operational awareness

### Ditambahkan

- Note alarm aktif pada Machine Directory, kartu mesin, dan header detail mesin.
- Tabel Active Alarm Conditions sebagai bagian monitoring pertama pada halaman alarm.
- Popup critical persisten sampai event clear.
- Tombol minimize dan close untuk popup warning/info tanpa menghapus event.
- Navigasi langsung dari badge, popup, dan note mesin menuju tabel alarm aktif.

### Diubah

- Badge sidebar dan topbar menghitung semua event aktif walaupun sudah acknowledged.
- Alarm Configuration dipindahkan ke bagian paling bawah halaman.
- API alarm memisahkan histori terbatas dari daftar alarm aktif lengkap.
- Refresh rollup historian tidak lagi menahan startup NestJS.

### Validasi

- Endpoint mengembalikan `active_count = 2` dan dua row `active_alarms` aktual pada saat pengujian.
- Frontend dan backend TypeScript berhasil dibangun.

---

## Dashboard V1.53 — 21 Agustus 2026

**Status:** Alarm form input stability

### Diperbaiki

- Draft konfigurasi alarm dipertahankan saat refresh realtime dan pemuatan tag.
- Asset, tag, threshold, severity, message, recommendation, serta enabled tidak lagi kembali ke nilai awal ketika form sedang diisi.
- Input threshold dan hysteresis menerima desimal titik maupun koma.
- Draft hanya dibersihkan setelah penyimpanan berhasil atau operator menekan Cancel.

---

## Dashboard V1.52 — 21 Agustus 2026

**Status:** Configurable alarm rule engine

### Ditambahkan

- Frontend alarm configuration berdasarkan asset dan tag PostgreSQL aktual.
- Threshold HIGH/HIGH-HIGH/LOW/LOW-LOW, delay, hysteresis, severity, message, recommendation, dan enable/disable.
- NestJS alarm engine dengan state NORMAL/PENDING/ACTIVE.
- Lifecycle alarm event aktif, acknowledgement, dan cleared tanpa row duplikat.
- Popup alarm realtime melalui WebSocket.
- Audit konfigurasi rule dan cursor telemetry yang bertahan saat backend restart.

### Validasi

- Nilai 1000 pada rule HIGH 999 mengaktifkan alarm.
- Nilai 980 dengan hysteresis 10 menutup event dan mengembalikan engine ke NORMAL.
- Record validasi sementara telah dibersihkan.

---

## Dashboard V1.51 — 21 Agustus 2026

**Status:** Sidebar scrollbar refinement

### Diubah

- Scrollbar sidebar menggunakan track transparan dan thumb membulat sesuai tema gelap.
- Area putih dan tombol panah scrollbar bawaan tidak lagi ditampilkan.
- Overscroll pada navigasi sidebar tidak diteruskan ke halaman utama.

---

## Dashboard V1.50 — 21 Agustus 2026

**Status:** Persistent navigation

### Ditambahkan

- Penyimpanan menu, area, detail mesin, batch tracking, dan scope summary terakhir pada browser.
- Validasi fallback jika area atau asset tersimpan sudah tidak tersedia pada master PostgreSQL aktual.

### Diubah

- Refresh dashboard tidak lagi selalu kembali ke Plant Overview.

---

## Dashboard V1.49 — 21 Agustus 2026

**Status:** Batch process export

### Ditambahkan

- Tombol Export PDF dan Export Excel di sebelah Load Batch.
- Endpoint NestJS untuk membangun file export berdasarkan process run aktual.
- PDF berisi konteks batch, process sequence, sensor summary, state, transition, dan abnormality.
- Excel berisi delapan sheet termasuk parameter setting dan telemetry detail.

### Validasi

- Batch contoh Kalender menghasilkan PDF valid dan workbook Excel berisi 21.306 row telemetry aktual.

---

## Dashboard V1.48 — 21 Agustus 2026

**Status:** Dynamic peak parameter

### Diubah

- Peak Temperature diganti menjadi peak parameter yang relevan per asset.
- Calator tidak lagi menampilkan temperatur jika tidak memiliki tag temperatur.
- Judul card, unit, nilai peak, detail, dan timestamp mengikuti parameter aktual yang dipilih.

### Ditambahkan

- Prioritas exact match antara `asset_snapshot.values_json` dan `tag_definition.signal_role`.
- Fallback ke tag aktif yang memiliki historian pada selected scope.
- Pengelompokan peak berdasarkan family dan unit agar parameter berbeda satuan tidak dibandingkan.

---

## Dashboard V1.47 — 21 Agustus 2026

**Status:** Machine performance summary

### Diubah

- Card sensor duplikat di atas detail mesin diganti empat card summary operasional.
- Live Sensor Measurements tetap khusus nilai snapshot aktual.
- Load Batch otomatis menerapkan scope summary Current Batch.

### Ditambahkan

- Scope Current Batch, Current Shift, dan Today.
- Kalkulasi runtime dari overlap `machine_state_event`.
- Actual output dari process run/totalizer serta fallback estimated output dari integrasi speed.
- Peak temperature lengkap dengan waktu kejadian.
- Process stability sebagai temperature spread tanpa membuat tolerance pass/fail palsu.
- Endpoint `GET /api/v1/assets/{assetId}/performance-summary`.

---

## Dashboard V1.46 — 21 Agustus 2026

**Status:** Actual-data batch investigation workspace

### Ditambahkan

- Search Production Batch dan tabel Recent Batches aktual pada detail mesin.
- Load Batch untuk membuka production context, parameter configuration, trend PV/SV, process sequence, dan abnormality log.
- Endpoint context batch yang menggabungkan production batch, process run, steps, transitions, dan alarm terkait.
- Fallback garis SV dari process setting ketika tag SV belum mengirim telemetry, dengan label sumber yang eksplisit.

### Diubah

- Batch Kalender contoh tidak lagi menginject telemetry buatan.
- Sebanyak 1.573 telemetry contoh lama dengan source `LOCAL-BATCH-TRACKING` dibersihkan.
- Batch contoh sekarang mereferensikan 21.306 sample aktual `KL-DPN-05` pada pukul 10.00–12.00 WIB.
- Nilai actual per step disimpan sebagai statistik min/max/avg dari telemetry aktual.

---

## Dashboard V1.45 — 21 Agustus 2026

**Status:** Kalender batch tracking example

### Ditambahkan

- Satu batch contoh `BATCH-KL5-20260821-001` pada `KL-DPN-05` untuk interval 10.00–12.00 WIB.
- Production batch, process run, tiga process step, machine state event, dan 1.573 telemetry sample pada 13 tag Kalender.
- Tombol Track batch pada Process run history untuk menerapkan interval batch langsung ke historian PV/SV.
- Kolom end time pada tabel process run serta label batch aktif pada panel historian.
- Script seed idempotent `npm run seed:kalender-batch`.

---

## Dashboard V1.44 — 21 Agustus 2026

**Status:** Digital Automation Dashboard identity

### Diubah

- Label Jakarta Plant pada topbar diganti menjadi Digital Automation Dashboard.
- Descriptor Smart Manufacturing Dashboard pada sidebar diganti menjadi Digital Automation Dashboard.
- Judul browser, meta description, identitas package, dan output build diselaraskan menjadi PT.SMM Digital Automation Dashboard.

---

## Dashboard V1.43 — 21 Agustus 2026

**Status:** Direct machine detail navigation

### Diperbaiki

- Klik asset pada Plant Overview langsung membuka detail mesin yang dipilih.
- State area dan machine tidak lagi dihapus oleh navigasi menu proses.
- Navigasi langsung diseragamkan untuk tabel asset, ranking mesin, alarm, dan power meter.
- Baris tabel dapat dibuka menggunakan Enter atau Space.

---

## Dashboard V1.42 — 21 Agustus 2026

**Status:** Custom historian date input stability

### Diperbaiki

- Nilai start dan end date historian langsung disimpan ketika operator memilih tanggal atau waktu.
- Refresh realtime tidak lagi mengembalikan field custom range ke tanggal hari ini.
- Perubahan input tetap belum menjalankan query sampai operator menekan Apply range.

---

## Dashboard V1.41 — 21 Agustus 2026

**Status:** Chemical table pagination scroll stability

### Diperbaiki

- Tombol Previous dan Next pada Chemical Transaction Log mempertahankan posisi tabel di viewport.
- Isi tabel lama tetap tersedia selama halaman berikutnya dimuat dari PostgreSQL sehingga tinggi halaman tidak menyusut sementara.
- Kontrol pagination dinonaktifkan selama request untuk mencegah perpindahan halaman ganda.
- Perubahan jumlah baris per halaman menggunakan perilaku posisi yang sama.

---

## Dashboard V1.40 — 21 Agustus 2026

**Status:** Historian time-range theme consistency

### Diperbaiki

- Tombol time range historian tidak lagi memakai tampilan tombol bawaan browser.
- State normal, hover, focus, dan aktif mengikuti palet light industrial dashboard.
- State aktif memakai aksen cyan agar range terpilih dapat dikenali dengan cepat.

---

## Dashboard V1.39 — 21 Agustus 2026

**Status:** Historian parameter persistence

### Diperbaiki

- Parameter trend PV/SV tidak lagi mengikuti tag telemetry terbaru ketika data realtime melakukan refresh.
- Pilihan parameter disimpan per asset di browser dan dipulihkan setelah halaman dimuat ulang.
- Fallback deterministik hanya digunakan jika belum ada pilihan atau parameter yang tersimpan sudah tidak terdaftar.

---

## Dashboard V1.38 — 21 Agustus 2026

**Status:** Chemical consumption analytics

### Diubah

- Chemical Dispensing dipisahkan dari renderer halaman mesin produksi.
- Historian SV/PV, motor diagnostic, maintenance, dan process run generik tidak lagi tampil pada Chemical.
- Overview lima dispenser dan detail unit memakai transaksi aktual PostgreSQL.

### Ditambahkan

- Filter 24 jam, 7 hari, 30 hari, bulan berjalan, dan custom range.
- KPI konsumsi, breakdown chemical dinamis, stacked bar per interval, serta checklist series.
- Ringkasan Automatic, Manual, dan Emergency termasuk detail `emergency_state` serta `auto_state`.
- Pagination server-side 25, 50, atau 100 baris dengan Previous dan Next.
- Endpoint agregasi `GET /api/v1/chemical/analytics` dan index PostgreSQL untuk filter waktu.

---

## Dashboard V1.37 — 21 Agustus 2026

**Status:** Card spacing consistency

### Diubah

- Padding vertikal dan horizontal panel dibakukan agar header, konten, dan tepi card tidak terlalu rapat.
- Jarak antarpanel, grid analisis, KPI, ranking, dan card area ditingkatkan secara konsisten.
- Card overview area memakai susunan vertikal yang seimbang dengan footer tetap memiliki ruang yang cukup.
- Spacing responsif pada layar kecil disesuaikan agar tetap lega tanpa membuang terlalu banyak ruang.

---

## Chemical CSV Import V1.0 — 21 Agustus 2026

**Status:** Data aktual weighing tersimpan di PostgreSQL

### Ditambahkan

- Importer idempotent untuk 15 file Automatic, Manual, dan Emergency.
- Sebanyak 112.856 source row dimasukkan ke `chemical_transaction`.
- Metadata `source_file`, `source_row_id`, start/end time, dan `raw_payload` untuk audit.
- Mapping lima unit dispensing ke asset ID aktual.

### Keputusan

- `target_kg` dan `calator_id` dibiarkan `NULL` karena tidak tersedia pada sumber.
- Timestamp sumber diperlakukan sebagai waktu lokal WIB.
- Dashboard menampilkan target kosong sebagai `—`, bukan `0 kg`.

---

## Dashboard V1.36 — 21 Agustus 2026

**Status:** Motor trend readability

### Diubah

- Phase R, S, dan T memakai warna biru, oranye, dan hijau yang lebih kontras.
- Fill trend dihapus dan ketebalan ketiga garis disamakan.
- Legend mengikuti warna garis trend secara konsisten.
- Sumbu Y serta ringkasan Power, Frequency, dan Energy dibatasi maksimal dua desimal.

---

## Dashboard V1.35 — 21 Agustus 2026

**Status:** Visual analytics PostgreSQL aktual

### Dikembalikan

- Donut status mesin dan grafik output produksi pada Plant Overview.
- Pie per lane/area serta ranking mesin pada overview setiap proses.
- Pie Electrical Demand by Area dan ranking equipment pada Utilities.
- Distribusi alarm per area serta ranking mesin terdampak.
- Historical Trend Explorer PV/SV dengan preset, custom time range, zoom, drag, dan navigator.

### Keputusan

- Layout analitis lama dipertahankan, tetapi seluruh nilai membaca PostgreSQL aktual.
- Dataset yang belum tersedia memakai empty state; tidak ada fallback simulasi.
- Render WebSocket ditunda selama semua dropdown dan input aktif agar interaksi operator stabil.

---

## Dashboard V1.34 — 21 Agustus 2026

**Status:** Historian satu parameter PV/SV

### Diubah

- Selector historian dikelompokkan berdasarkan parameter proses; suffix `_PV` dan `_SV` otomatis dipasangkan.
- Grafik sensor hanya menampilkan PV aktual dan SV setpoint untuk satu parameter terpilih dengan warna serta legend berbeda.
- Ringkasan menampilkan nilai PV, SV, dan deviasi terakhir menggunakan engineering unit yang sama.
- Render WebSocket dan historian ditunda selama dropdown aktif agar kontrol tidak menutup sendiri.
- Parameter tanpa tag atau sample SV diberi informasi eksplisit dan tidak diisi dengan data dummy.

---

## Dashboard V1.33 — 21 Agustus 2026

**Status:** Full Tag Registry historian selector

### Diubah

- Batas delapan tag pada Historical Trends dihapus; seluruh tag aktif asset tersedia pada dropdown.
- Query aggregate sensor dilakukan hanya untuk tag yang dipilih.
- Tampilan historian memakai panel, segmented range, select, badge, spacing, dan color token dashboard utama.

---

## Dashboard V1.32 — 21 Agustus 2026

**Status:** Trend aktual detail mesin

### Ditambahkan

- Panel historian sensor dan motor pada detail asset PostgreSQL.
- Range `1H`, `8H`, `24H`, `7D`, pemilihan signal, serta grafik average/min/max sensor.
- Grafik current R/S/T motor bila equipment historian tersedia.

### Keputusan

- Detail asset hanya memuat historian saat dibuka, agar overview 138 mesin tidak membuat query trend masif.
- Data motor kosong ditampilkan apa adanya sampai master equipment dan mapping motor aktual tersedia.

---

## Section & Parameter Dictionary V1.0 — 19 Agustus 2026

**Status:** Standar baseline semantic tag

### Ditambahkan

- Struktur canonical `SMM.{ASSET_ID}.{SECTION}.{PARAMETER}`.
- Kamus section Jetflow, Calator, Dryer, Kalender, Chemical Dispensing, Utilities, serta motor 3-phase.
- Kamus parameter global dan suffix `PV`, `SV`, `FB`, `CMD`, `TOTAL`, `STATUS`, `SPREAD`, dan `ALARM`.
- Aturan ownership dan perubahan semantic tag.

---

## NestJS PostgreSQL Integration V1.7 — 18 Agustus 2026

**Status:** Motor historian dan Jetflow program versioned

### Ditambahkan

- Historian motor R/S/T, voltage, kW, Hz, runtime, serta counter energy dengan aggregate 1m/15m/daily.
- Contoh 25 titik trend per motor untuk 37 motor/drive dan contoh trend sensor seluruh proses.
- Master versi program Jetflow, step program, execution batch, dan audit transition otomatis/manual.
- Endpoint trend motor serta endpoint program/execution Jetflow.

### Keputusan

- Program `RELEASED` terkunci pada batch yang sedang berjalan; perubahan resep harus memakai versi baru.
- Pindah step dicatat berdasarkan event PLC/gateway dan tetap read-only pada Dashboard V1.

---

## NestJS PostgreSQL Integration V1.6 — 18 Agustus 2026

**Status:** Historian query-ready

### Ditambahkan

- Raw telemetry immutable serta rollup 1 menit, 15 menit, dan harian pada PostgreSQL native.
- Aggregate counter utility harian dan aggregate durasi state mesin harian.
- Refresh historian rolling 48 jam saat startup dan setiap lima menit.
- Endpoint historical aggregate untuk sensor, utility, dan state mesin.
- Contoh totalizer utility dan state event berpenanda `TEST_SAMPLE`.

### Keputusan

- Query 1–24 jam memakai bucket 1 menit; multi-hari memakai 15 menit; range panjang memakai daily aggregate.
- Dashboard tidak boleh memuat seluruh raw telemetry untuk trend bulanan.

---

## Tag Naming & Governance V1.0 — 18 Agustus 2026

**Status:** Standar baseline Tag Registry

### Ditambahkan

- Ownership dan approval untuk asset, equipment, tag, source PLC, serta alarm.
- Format asset ID, equipment ID, tag code canonical, dan signal role.
- Pemisahan tag canonical dari alamat fisik PLC/OPC UA/Modbus.
- Workflow pendaftaran, quality data, lifecycle, dan aturan perubahan tag.

---

## Dashboard V1.31 / NestJS PostgreSQL Integration V1.5 — 18 Agustus 2026

**Status:** Dashboard database-driven

### Ditambahkan

- Master dan snapshot motor/drive 3-phase pada PostgreSQL.
- Detail equipment: R/S/T, voltage, kW, Hz, runtime, energy, dan maintenance due.
- Dataset `TEST_SAMPLE` untuk Jetflow, Calator, Dryer, Kalender, Dispensing, dan 37 equipment.

### Diubah

- Fleet, area, detail mesin, sensor, process run, dan motor membaca data API PostgreSQL.
- Field yang belum ada tidak menggunakan nilai hard-code.

---

## Calator Concept V1.5 — 18 Agustus 2026

**Status:** Detail Calator memakai snapshot aktual

### Diubah

- Overfeed Out, Dancing Roller, Output, Chemical, Critical Process, dan Live Monitoring membaca PostgreSQL.
- Parameter belum terhubung menampilkan `—` / `No data`, bukan nilai statis.

---

## Dashboard V1.30 — 18 Agustus 2026

**Status:** Restore layout dashboard

### Diubah

- Struktur tab, fleet, area drill-down, card, dan panel dashboard awal dipulihkan.
- State/batch/progress tetap memakai PostgreSQL aktual.
- KPI historical yang belum memiliki aggregate aktual tidak lagi menampilkan angka generator.

---

## Dashboard V1.29 — 18 Agustus 2026

**Status:** Perbaikan visual live sensor

### Diubah

- Nilai `asset_snapshot.values_json` ditampilkan sebagai card grid responsif, bukan teks berderet.
- Card memuat asset, parameter, nilai, unit, quality, dan source time aktual.
- Badge status database diberi style khusus pada page header.

---

## Dashboard V1.28 / NestJS PostgreSQL Integration V1.4 — 18 Agustus 2026

**Status:** Dashboard actual-data only

### Diubah

- Renderer seluruh halaman dashboard memakai endpoint PostgreSQL aktual.
- Nilai yang belum tersedia ditampilkan sebagai `No data` atau `—`, tidak lagi menggunakan generator prototype.
- Endpoint asset mengembalikan `asset_snapshot.values_json`.

### Ditambahkan

- Endpoint historian terbaru dan alarm event aktual.
- Dataset terisolasi `TEST_SAMPLE`: asset, batch, process step, tag/historian, chemical, utilitas, dan alarm.

---

## NestJS PostgreSQL Integration V1.3 — 18 Agustus 2026

**Status:** Kanal real-time Socket.IO aktif

### Ditambahkan

- Gateway Socket.IO namespace `/realtime` pada NestJS.
- Event `dashboard:refresh` untuk perubahan asset, snapshot, utility, chemical, alarm, dan batch process.
- Dashboard otomatis memuat ulang data API aktual tanpa browser refresh.

### Validasi

- Update snapshot `CL-DPN-01` berhasil diterima oleh Socket.IO lokal.

---

## NestJS PostgreSQL Integration V1.2 — 18 Agustus 2026

**Status:** Struktur tabel operational MES

### Ditambahkan

- Tabel batch, process run, process step execution, alarm event, maintenance plan, dan master utility meter.
- Runner migration NestJS membaca seluruh migration SQL secara berurutan.

### Catatan

- Seluruh tabel dibuat kosong tanpa record simulasi.

---

## NestJS PostgreSQL Integration V1.1 — 18 Agustus 2026

**Status:** Mode database aktual lokal

### Diubah

- Seed otomatis backend dan fallback data simulasi browser dihapus.
- API membaca langsung PostgreSQL lokal dan mengembalikan `ACTUAL_DATABASE` untuk Jetflow, Calator, Dryer, Kalender, dan Chemical.
- Asset tanpa snapshot tetap dapat dibaca dengan status `offline` / `NO_DATA`.
- Dashboard menampilkan state integrasi kosong sampai data aktual tersedia.

### Dihapus

- Dataset demo terverifikasi: 50 asset, 50 snapshot, 284 tag, 6 transaksi chemical, dan 4 snapshot utilitas.

---

## Frontend Dashboard V1.48 / Calator Concept V1.4 / Dashboard Concept V1.27 — 18 Agustus 2026

**Status:** Hirarki panel Calator diperjelas

### Diubah

- Multi-Speed Profile diganti menjadi Critical Process.
- Critical Process sebelumnya diganti menjadi Live Monitoring.
- Data speed, overfeed out, dancing roller, chemical transfer, dan output tetap dipertahankan.

---

## NestJS PostgreSQL Integration V1.0 — 18 Agustus 2026

**Status:** Backend local framework migration selesai

### Diubah

- API lokal berpindah dari Node.js HTTP native ke NestJS 11 + TypeScript.
- REST endpoint dashboard tetap dipertahankan agar frontend tidak perlu diubah.
- PostgreSQL pool, migration, dan seed dipindahkan ke `DatabaseService` NestJS.
- Static dashboard lokal disajikan melalui Express adapter NestJS pada port yang sama.

### Ditambahkan

- Struktur root module, API controller, database service, dan TypeScript build backend.
- `framework: NESTJS` pada endpoint integration status untuk verifikasi runtime.

### Batasan

- NestJS aktif untuk local development; backend cloud D1 belum dimigrasikan.

---

## Frontend Dashboard V1.47 / Jetflow Concept V1.9 / Dashboard Concept V1.26 — 18 Agustus 2026

**Status:** SV/PV pada sequence Jetflow ditambahkan

### Ditambahkan

- Kolom SV dan PV pada setiap langkah Jetflow Process Sequence.
- Label parameter dan satuan pada nilai SV/PV.
- PV pending tetap kosong sampai langkah proses dimulai; PV step aktif diberi aksen live.

### Batasan

- Nilai recipe serta actual masih simulated sampai tag PLC dan historian batch diintegrasikan.

---

## Frontend Dashboard V1.46 / Jetflow Concept V1.8 / Dashboard Concept V1.25 — 18 Agustus 2026

**Status:** Batch context pada kartu mesin ditambahkan

### Ditambahkan

- Nomor batch aktif pada strip process kartu mesin di halaman area/fleet.
- Tata letak batch ringkas di samping current process agar dapat dibaca tanpa membuka detail mesin.

### Batasan

- Nomor batch masih memakai data simulated hingga process run MES terhubung.

---

## Frontend Dashboard V1.45 / Dashboard Concept V1.24 — 18 Agustus 2026

**Status:** Alarm downtime analysis diperjelas

### Ditambahkan

- Ranking unplanned downtime per area/lane pada halaman Alarm & Events.
- Filter area yang memperbarui ranking downtime mesin dan active alarm.
- Tabel Top Downtime Machines berisi equipment, issue, event count, downtime, serta event terakhir.
- Drill-down dari ranking mesin ke detail mesin terkait.

### Batasan

- Data downtime dan event masih simulated hingga historian event dan reason code aktual tersedia.

---

## Frontend Dashboard V1.44 / Calator Concept V1.3 / Dashboard Concept V1.23 — 18 Agustus 2026

**Status:** Detail Calator disederhanakan

### Dihapus

- Panel Speed Synchronization pada detail per mesin Calator.

### Dipertahankan

- Multi-Speed Profile, Critical Process, motor diagnostic, histori proses, batch investigation, dan abnormality log Calator.

---

## PostgreSQL Local V1.3 — 18 Agustus 2026

**Status:** Native configuration hardened

### Diubah

- `.env` mendukung `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, dan `DB_PASSWORD` secara terpisah.
- Driver `pg` membentuk koneksi dari field terpisah bila `DATABASE_URL` tidak digunakan.
- Password dengan karakter khusus tidak lagi perlu di-URL-encode pada konfigurasi lokal.

---

## PostgreSQL Local V1.2 — 18 Agustus 2026

**Status:** Native PostgreSQL service enabled

### Diubah

- Backend lokal berpindah dari PGlite embedded ke driver `pg` untuk PostgreSQL service asli.
- Konfigurasi `.env` memakai `DATABASE_URL` dan opsi `DATABASE_SSL`.
- Status API membedakan storage `POSTGRESQL_NATIVE_LOCAL`.

### Diperlukan sebelum dijalankan

- Isi username/password PostgreSQL yang benar di `.env`.
- Buat database `pt_smm_scada` atau sesuaikan nama database pada `DATABASE_URL`.

---

## PostgreSQL Local V1.1 — 18 Agustus 2026

**Status:** Environment configuration ditambahkan

### Ditambahkan

- File `.env` lokal dan `.env.example` untuk port serta lokasi persistent database PostgreSQL lokal.
- Perintah local API otomatis membaca `.env`.

---

## PostgreSQL Local V1.0 — 18 Agustus 2026

**Status:** Koneksi database lokal berjalan

### Ditambahkan

- PGlite sebagai PostgreSQL lokal persistent tanpa membutuhkan Docker atau PostgreSQL native.
- Local API server dan perintah `npm run dev:postgres`.
- Migration PostgreSQL dan seed data non-Jetflow untuk Calator, Dryer, Kalender, Dispensing, Chemical, dan Utilities.

### Divalidasi

- Dashboard lokal, status API, fleet asset, chemical transaction, dan utility snapshot berhasil dibaca dari PostgreSQL lokal.

### Batasan

- Cloud deployment belum dipindahkan ke PostgreSQL; database production dan credential belum tersedia.

---

## Backend Non-Jetflow V1.0 — 15 Agustus 2026

**Status:** Fondasi integrasi backend selesai

### Ditambahkan

- Persistent D1 dan migration untuk Calator, Dryer, Kalender, Chemical Dispensing, dan snapshot Utilities.
- API read-only asset, snapshot, chemical log, utility snapshot, status integration, serta contract telemetry gateway.
- Dashboard menghidrasi fleet non-Jetflow dan chemical transaction dari backend lalu mempertahankan fallback demo bila service belum tersedia.

### Batasan

- Semua record awal berstatus `SIMULATED_SEED`; mapping PLC/gateway dan data operasi aktual belum diaktifkan.
- Jetflow sengaja tidak termasuk scope backend versi ini.

---

## Database Design V1.0 — 15 Agustus 2026

**Status:** Baseline konsep database selesai

### Ditambahkan

- Desain PostgreSQL + TimescaleDB untuk telemetry, historian, snapshot live, aggregate, master asset/tag, batch MES, utility, chemical, maintenance, dan audit.
- ERD konseptual serta struktur logical schema untuk hubungan asset–tag–historian–batch–event.
- Aturan retention, data quality, key/time convention, query dashboard, performance, dan tahapan migration produksi.

### Keputusan

- Database menjadi pusat integrasi backend setelah ingestion API; PLC dan frontend tidak mengakses database satu sama lain secara langsung.

---

## Backend Architecture V1.0 / Tag & Display Mapping Register V1.0 / Backend Data Flow Graph V1.0 — 15 Agustus 2026

**Status:** Baseline backend SCADA / MES selesai

### Ditambahkan

- Arsitektur transmisi read-only dari PLC, drive, meter, dan dispensing melalui OT Edge Gateway, DMZ, ingestion, historian, API, hingga dashboard.
- Canonical tag registry, versioned source mapping, data quality, store-and-forward, dan aturan perubahan mapping.
- Baseline database PostgreSQL + TimescaleDB untuk master asset/tag, MES transaction, raw telemetry, live snapshot, event, aggregate, KPI, dan diagnostic motor.
- Register mapping awal tag ke Plant Overview, Jetflow, Calator, Dryer, Kalender, Chemical Dispensing, utility, dan motor 3-phase.
- Graph alur telemetry, siklus sample, digital traceability batch, dan batas keamanan OT–IT.

### Keputusan

- Dashboard dan AI tetap read-only pada fase V1; tidak ada jalur command langsung ke PLC atau drive.
- Integrasi harus configuration-driven agar ekspansi mesin/sensor tidak mengharuskan perubahan frontend.

---

## Frontend Dashboard V1.43 / Chemical Dispensing Calator Concept V1.5 / Dashboard Concept V1.22 — 15 Agustus 2026

**Status:** Custom Chemical Dispensing log range selesai

### Ditambahkan

- Custom start/end date-time pada Dispensing Request Log.
- Apply range dan validasi start/end terbalik.
- Kombinasi range dengan chemical, Calator, type, dan status filter.

---

## Frontend Dashboard V1.42 / Jetflow Concept V1.7 / Calator Concept V1.2 / Dryer Concept V1.1 / Dashboard Concept V1.21 — 15 Agustus 2026

**Status:** Motor diagnostic lintas proses selesai

### Ditambahkan

- Modal Motor & Drive pada seluruh equipment Jetflow, Calator, dan Dryer.
- Asset context per machine untuk memastikan modal, trend, log, dan export membawa sumber proses yang benar.
- Winch/pump/mixer Jetflow, motor line Calator, serta drive/fan Dryer.

### Batasan

- Asset list serta data masih simulated hingga mapping motor/drive aktual tersedia.

---

## Frontend Dashboard V1.41 / Kalender Concept V1.12 / Dashboard Concept V1.20 — 15 Agustus 2026

**Status:** Alignment Motor & Drive log diperbaiki

### Diperbaiki

- Sel tabel R/S/T, Load, Drive, dan Quality tidak lagi berubah menjadi layout grid.
- Kolom historical log kembali sejajar dan data tidak menumpuk.

---

## Frontend Dashboard V1.40 / Kalender Concept V1.11 / Dashboard Concept V1.19 — 15 Agustus 2026

**Status:** Tabel Motor & Drive grouped dirapikan

### Ditambahkan

- Tujuh kelompok kolom: timestamp, R, S, T, load, drive, dan quality.
- Current serta voltage dalam satu sel fase.
- Pemisahan visual untuk membantu scan troubleshooting.

---

## Frontend Dashboard V1.39 / Kalender Concept V1.10 / Dashboard Concept V1.18 — 15 Agustus 2026

**Status:** Layout tabel Motor & Drive dirapikan

### Ditambahkan

- Kolom padat untuk current/voltage R/S/T dan statistik min/avg/max.
- Tabel lebar penuh tanpa scroll horizontal pada modal desktop.
- Mode kartu untuk record di layar kecil.

---

## Frontend Dashboard V1.38 / Kalender Concept V1.9 / Dashboard Concept V1.17 — 15 Agustus 2026

**Status:** Motor complete historical log dan export selesai

### Ditambahkan

- Tabel seluruh log motor berdasarkan selected range.
- Timestamp, current dan voltage R/S/T, kW, Hz, imbalance, dan status.
- Export CSV dengan scope motor serta time range aktif.

### Batasan

- Data tabel dan export masih generated untuk demonstrasi.

---

## Frontend Dashboard V1.37 / Kalender Concept V1.8 / Dashboard Concept V1.16 — 15 Agustus 2026

**Status:** Motor troubleshooting detail selesai

### Ditambahkan

- Minimum, average, maximum current per fase R/S/T.
- Timestamp current high dan low untuk investigasi event.
- Voltage min/avg/max per fase.
- Finding peak current, low current, current imbalance, dan voltage spread dengan arahan pemeriksaan.

### Batasan

- Nilai, timestamp, dan finding masih simulated serta bukan diagnosis otomatis.

---

## Frontend Dashboard V1.36 / Kalender Concept V1.7 / Dashboard Concept V1.15 — 15 Agustus 2026

**Status:** Motor & Drive 3-phase diagnostic modal selesai

### Ditambahkan

- Detail motor terpusat sebagai modal dengan ruang aman dari tepi layar.
- RMS current dan voltage phase-to-neutral untuk fase R, S, dan T.
- Current imbalance dan status balance per fase.

### Batasan

- Data 3-phase masih simulated dan seluruh diagnostic bersifat read-only.

---

## Frontend Dashboard V1.35 / Chemical Dispensing Calator Concept V1.4 / Dashboard Concept V1.14 — 15 Agustus 2026

**Status:** P&ID dispensing Calator selesai

### Ditambahkan

- P&ID SVG 8 inlet valve menuju Tank 1.
- Indikator tiga loadcell Tank 1, valve transfer, dan Tank 2.
- Distribution manifold ke Calator yang didukung setiap unit dispensing.

### Dihapus

- Placeholder Remote Display dari detail mesin.

### Batasan

- Diagram bersifat read-only dan state masih simulated hingga tag PLC/P&ID engineering tervalidasi.

---

## Frontend Dashboard V1.34 / Chemical Dispensing Calator Concept V1.3 / Dashboard Concept V1.13 — 15 Agustus 2026

**Status:** Mapping dispensing unit dan usage per Calator selesai

### Ditambahkan

- Pembagian Calator support untuk lima dispensing unit.
- Matriks penggunaan tujuh chemical per Calator.
- Ranking tiga chemical terbanyak per Calator.
- Klik Calator untuk filter request log unit terkait.

### Batasan

- Mapping route dan volume masih simulated.

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
