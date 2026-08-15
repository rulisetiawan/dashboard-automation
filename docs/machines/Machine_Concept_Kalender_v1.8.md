# Machine Concept Kalender v1.8

**Versi:** 1.8  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Historical troubleshooting detail motor 3-phase

## Tujuan

Menjadikan detail Motor & Drive sebagai referensi awal troubleshooting equipment. Operator dapat melihat besaran arus dan tegangan setiap fase, lalu menghubungkan nilai ekstrem dengan waktu kejadian dan langkah pemeriksaan yang relevan.

## Data historical per fase

Untuk fase R, S, dan T dashboard menampilkan:

| Parameter | Kegunaan troubleshooting |
|---|---|
| Current minimum | Mendeteksi kondisi no-load, slip, material tidak masuk, atau pembacaan abnormal |
| Current average | Baseline beban selama selected range |
| Current maximum | Membandingkan peak beban terhadap limit drive/motor |
| Time high / time low | Menelusuri kejadian ke batch, proses, alarm, atau log operator pada waktu yang sama |
| Voltage minimum / average / maximum | Menilai stabilitas suplai tiap fase |
| Current imbalance | Mengidentifikasi deviasi beban fase terhadap rata-rata tiga fase |
| Voltage spread | Mengidentifikasi perbedaan tegangan antar fase |

## Finding dan arahan pemeriksaan

Empat finding otomatis ditampilkan sebagai referensi:

1. **Highest RMS current**: periksa mechanical load, bearing, tension felt/belt, alignment, dan driven equipment bila nilai meningkat terhadap baseline atau limit.
2. **Lowest RMS current**: periksa no-load, slip, material flow, coupling, atau validitas sensor.
3. **Maximum current imbalance**: threshold awal 3%; periksa terminal, kabel, contactor, output drive, dan pembagian beban bila melebihi threshold.
4. **Maximum voltage spread**: periksa incoming supply, terminal, fuse/contactor, serta kualitas suplai bila spread bertambah.

## Batasan

Nilai, timestamp, dan finding masih simulated. Ambang batas final harus ditentukan bersama engineering, electrical, maintenance, vendor drive, dan data commissioning.
