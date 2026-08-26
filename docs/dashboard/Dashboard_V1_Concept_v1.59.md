# Dashboard V1 Concept v1.59

**Tanggal:** 22 Agustus 2026

**Status:** Read-only machine alarm context

## Diubah

- Alarm note pada header detail mesin tidak lagi memiliki tombol `View` atau navigasi ke Alarm Log.
- Note menampilkan waktu mulai alarm dari `alarm_event.occurred_at`.
- Rule ditampilkan sebagai parameter, jenis kondisi, threshold, dan engineering unit.
- Nilai aktual saat alarm terpicu ditampilkan terpisah sebagai `Trigger value`.
- Informasi alarm disusun ringkas dan responsif agar tetap terbaca tanpa mengambil ruang berlebih.

## Contoh

Untuk alarm temperatur Kalender, note dapat menampilkan:

- Started: `22 Agu, 09.13`
- Parameter / Rule: `TEMPERATURE_UPPER_PV · HIGH ≥ 130 °C`
- Trigger value: `145,2 °C`

