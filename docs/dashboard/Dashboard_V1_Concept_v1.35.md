# Dashboard V1 Concept v1.35

**Tanggal:** 21 Agustus 2026

**Status:** Pemulihan visual dashboard pada mode PostgreSQL aktual

## Tujuan

Mempertahankan struktur visual dan kemampuan analisis Dashboard V1 setelah sumber data dipindahkan dari data demo ke mode `ACTUAL_DATABASE`. Komponen visual tidak boleh dihilangkan hanya karena aggregate aktual belum tersedia.

## Perubahan

### Plant Overview

- Donut status mesin menggunakan `asset_snapshot.machine_state`.
- KPI live menampilkan jumlah asset, mesin running, mesin berhenti/fault/offline, dan batch aktif.
- Output produksi dihitung dari process run terbaru yang unik per kombinasi asset dan batch.
- Grafik batang membandingkan output aktual Jetflow, Calator, Dryer, dan Kalender.
- Utility snapshot, process flow, active process run, dan machine directory tetap tersedia.

### Process Overview

- Pie/donut konsumsi atau output per lane/area dikembalikan.
- Klik segmen memfilter ranking mesin pada area yang sama.
- Nilai berasal dari `asset_snapshot.values_json` atau transaksi chemical aktual.
- Jika parameter belum tersedia, area atau ranking ditampilkan dengan nilai kosong/zero tanpa estimasi dummy.

### Utilities

- Pie Electrical Demand by Area menggunakan penjumlahan `equipment_snapshot.active_power_kw`.
- Klik area mengubah daftar Top Electrical Loads.
- Ranking dapat membuka detail mesin untuk analisis motor dan drive.
- Seluruh record `utility_snapshot` tetap tersedia sebagai KPI dan tabel detail.

### Alarms

- Alarm Distribution by Area menggunakan `alarm_event.area_code`.
- Klik area memfilter Top Affected Machines dan tabel event.
- Ranking menggunakan jumlah event aktual.
- Downtime tidak direkayasa; durasi baru dapat ditampilkan setelah event clear atau mapping downtime tersedia.

### Historical Trends

- Historical Trend Explorer dikembalikan di atas tabel telemetry.
- Pilihan satu mesin dan satu parameter otomatis memasangkan tag PV/SV.
- Range tersedia untuk `1H`, `8H`, `24H`, `7D`, serta custom start/end.
- Window trend dapat di-zoom, digeser dengan drag, tombol earlier/later, atau navigator.
- Grafik mengambil data dari endpoint aggregate PostgreSQL.
- Recent Telemetry Historian tetap dipertahankan sebagai tabel untuk pencarian dan audit sample.

## Prinsip tampilan

```text
Komponen visual lama
  + sumber PostgreSQL aktual
  + empty state yang eksplisit
  - angka simulasi/hardcoded
  = Dashboard analitis yang tetap lengkap
```

Refresh WebSocket ditunda selama operator sedang berinteraksi dengan `select`, `input`, atau `textarea`, sehingga dropdown dan input filter tidak ditutup oleh render real-time.
