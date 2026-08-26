# Dashboard V1 Concept v1.49

**Tanggal:** 21 Agustus 2026

**Status:** Batch process export

## Perubahan

- Tombol `Export PDF` dan `Export Excel` ditambahkan di sebelah `Load batch` setelah batch berhasil dipilih.
- Ekspor tidak mengubah posisi scroll, parameter trend, atau batch yang sedang aktif.
- Nama file mengandung nomor batch dan asset agar mudah ditelusuri.

## Isi Ekspor

PDF berfungsi sebagai laporan ringkas yang dapat langsung dibaca:

- identitas batch, mesin, customer, fabric, recipe, target, dan output;
- process sequence beserta waktu, status, setpoint, dan actual;
- ringkasan sensor min/average/max/last;
- machine state, process transition, serta abnormality log.

Excel berfungsi sebagai data investigasi lengkap dengan sheet:

1. `Batch Summary`
2. `Parameter Settings`
3. `Process Sequence`
4. `Sensor Summary`
5. `Telemetry Data`
6. `Machine State`
7. `Transitions`
8. `Abnormality Log`

Seluruh isi berasal dari process run dan interval batch aktual di PostgreSQL. Sheet telemetry dibatasi maksimal 200.000 row per export untuk menjaga kestabilan aplikasi.
