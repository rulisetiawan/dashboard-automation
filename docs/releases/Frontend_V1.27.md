# Frontend Dashboard V1.27

**Tanggal:** 15 Agustus 2026  
**Status:** Selesai  
**Fokus:** Recipe program overlay pada trend batch Jetflow

## Ditambahkan

- Area berwarna pada trend PV/SV untuk step recipe Jetflow yang relevan dengan sensor.
- Marker garis vertikal untuk setiap perubahan setpoint program.
- Label SV baru pada marker trend.
- Ringkasan scrollable berisi step, waktu start–end, waktu perubahan SV, dan target baru.
- Profile SV bertahap dan respons PV simulasi khusus Jetflow agar pembacaan ramp/cooling dapat diuji.

## Dipertahankan

- Trend tetap hanya dimuat setelah batch dipilih.
- Checkbox sensor dan pilihan range 1H, 8H, 24H tetap bekerja per sensor.
- Abnormality log tetap menggunakan nomor batch yang sama.

## Batasan

- Program, target, timestamp, dan PV masih simulated.
- Integrasi berikutnya membutuhkan historian PV, event recipe/PLC, serta mapping tag–step aktual.
