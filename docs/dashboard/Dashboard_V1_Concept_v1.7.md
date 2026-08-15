# Dashboard V1 Concept

## Versi 1.7 — Cross-Sensor Recipe Context

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.6.md`

## Perubahan Konsep

Batch investigation Jetflow sekarang memiliki filter process recipe global. Pengguna dapat memilih event proses yang ingin dibandingkan pada seluruh sensor, tanpa kehilangan kemampuan memilih sensor secara mandiri.

## Nilai Operasional

- Satu kejadian Filling, Dosing, atau Temperature Control dapat ditinjau bersama pada banyak sensor.
- Operator dapat menyederhanakan tampilan batch panjang dengan menampilkan hanya process yang sedang dianalisis.
- Trend tetap menjaga perbedaan penting: process context bersifat global, sedangkan perubahan SV hanya terlihat pada tag yang benar-benar memiliki setpoint terkait.

## Batasan

- Filter hanya tersedia pada Jetflow pada rilis ini.
- Persistensi antar-login dan penyimpanan preferensi pengguna belum diimplementasikan.
