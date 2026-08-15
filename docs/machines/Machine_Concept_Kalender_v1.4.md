# Konsep Mesin Kalender

## Versi 1.4 — Production dan Delivery Detail

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Kalender_v1.3.md`

## Perubahan Struktur Detail Mesin

`Quality Context` diganti menjadi `Production & Delivery Detail` untuk membawa konteks order produksi langsung pada detail Kalender.

| Informasi | Contoh data |
|---|---|
| Customer | Nama customer pada production order |
| Fabric Type | Jenis/komposisi kain |
| Target Grammage | Target GSM recipe/order |
| Target Fabric Width | Lebar kain yang diharapkan |
| Expected Output | Target output meter per shift/order |
| Delivery Target | Batas waktu pengiriman |
| Production Progress | Actual output, remaining output, ETA, dan persentase progress |

## Pembagian Informasi Tanpa Duplikasi

- Kartu utama: energy consumption, power demand, output progress, dan completed batches.
- Live Sensor Measurements: Loadcell Upper/Lower (kg), Temperature Upper/Lower, Dancing Roller (%), serta Fabric Width.
- Parameter Configuration: seluruh target SV dan batas overspeed.
- Production & Delivery Detail: konteks customer, kain, output, delivery, dan progress.

## Batasan V1.4

- Customer, delivery, target output, dan progress masih simulated.
- Integrasi berikutnya membutuhkan production order MES, customer master, delivery plan, counter output, dan status batch aktual.
