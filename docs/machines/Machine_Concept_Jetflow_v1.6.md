# Konsep Mesin Jetflow

## Versi 1.6 — Global Process Checklist pada Batch Trend

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Jetflow_v1.5.md`

## Tujuan Pembaruan

Operator dapat memilih process step recipe secara manual sebagai konteks bersama untuk seluruh trend sensor batch Jetflow. Filter ini tidak lagi ditentukan otomatis oleh jenis sensor.

## Perilaku Filter

- Checklist mencakup semua 12 process step Jetflow.
- Process yang dicentang muncul sebagai process band pada semua sensor yang sedang aktif.
- Lokasi waktu band sama pada setiap chart, sehingga respons temperature, level, flow, dan dosing dapat dibandingkan pada event proses yang sama.
- Tombol `All On` dan `All Off` tersedia untuk memilih seluruh process atau menyembunyikan seluruh context band.
- Marker perubahan SV hanya muncul pada sensor yang memang memiliki perubahan setpoint pada process yang sedang dipilih.
- Jika sensor tidak memiliki perubahan SV pada process terpilih, chart tetap menunjukkan process band tanpa marker target palsu.

## Aturan Scope

Filter process berlaku untuk nomor batch Jetflow yang sedang dimuat dan tetap aktif ketika sensor dinyalakan/dimatikan atau time range 1H, 8H, dan 24H diubah.

## Batasan V1.6

- Status filter masih tersimpan pada state frontend selama sesi halaman aktif.
- Process sequence, timestamp, dan marker SV tetap simulated sampai terhubung ke PLC, recipe controller, dan historian.
