# Dashboard V1 Concept v1.48

**Tanggal:** 21 Agustus 2026

**Status:** Dynamic Peak Parameter per asset

## Perubahan

- Card `Peak Temperature` tidak lagi dipaksakan ke seluruh jenis mesin.
- Card ketiga berubah menjadi peak parameter dinamis berdasarkan snapshot, tag registry aktif, dan data historian pada scope terpilih.
- Judul, unit, nilai, detail parameter, serta timestamp peak mengikuti parameter yang dipilih backend.

## Contoh Pemilihan

| Mesin | Kandidat peak utama |
|---|---|
| Jetflow | Main Tank Temperature, level, atau flow yang tersedia |
| Calator | Overfeed Out, Dancing Roller, Squeezing/Feeding Speed yang tersedia |
| Dryer | Chamber Temperature atau Line Speed yang tersedia |
| Kalender | Upper/Lower Temperature, Loadcell, Overfeed, atau speed yang tersedia |

Backend hanya memilih tag yang memiliki data numerik pada scope. Snapshot match mendapat prioritas; jika key snapshot belum canonical, backend memakai tag aktif dengan historian sebagai fallback.

## Empty State

Jika tidak ada tag snapshot/registry yang memiliki data pada range terpilih, card menampilkan `Peak Parameter —` tanpa membuat nilai contoh.
