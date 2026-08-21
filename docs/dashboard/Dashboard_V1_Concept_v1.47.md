# Dashboard V1 Concept v1.47

**Tanggal:** 21 Agustus 2026

**Status:** Machine Performance Summary tanpa duplikasi live sensor

## Perubahan Tampilan

- Card snapshot sensor yang sebelumnya mengulang data pada `Live Sensor Measurements` diganti menjadi `Machine Performance Summary`.
- Summary selalu terdiri dari empat informasi turunan: Total Runtime, Actual/Estimated Output, Peak Temperature, serta Process Stability atau Completed Batches.
- Disediakan scope `Current Batch`, `Current Shift`, dan `Today`.
- Saat batch dimuat, scope summary otomatis berpindah ke `Current Batch`.
- `Live Sensor Measurements` tetap menjadi satu-satunya bagian yang menampilkan nilai aktual snapshot sensor.

## Sumber Perhitungan

| Summary | Sumber | Aturan |
|---|---|---|
| Total Runtime | `machine_state_event` | Durasi overlap event `RUNNING` pada scope terpilih |
| Availability | `machine_state_event` | Runtime dibagi seluruh durasi state yang benar-benar tercatat |
| Output aktual | Output process run atau delta output totalizer | Diprioritaskan jika tersedia |
| Estimated Output | Aggregate speed `m/min` | Integrasi rata-rata speed per bucket satu menit |
| Peak Temperature | `telemetry_sample` | Nilai maksimum dan timestamp pada scope |
| Process Stability | `telemetry_aggregate_1m` | Rata-rata serta maksimum spread sensor temperatur per bucket |
| Completed Batches | `batch_process_run` | Fallback jika pasangan temperatur belum tersedia |

## Prinsip Kejujuran Data

- Output hasil integrasi speed selalu diberi label `Estimated Output`.
- Process Stability tidak menampilkan persentase pass/fail sebelum tolerance resmi disimpan sebagai konfigurasi.
- Jika tidak ada sumber valid, card menampilkan `—` dan penjelasan data yang belum tersedia.
- Live sensor dan summary memakai tujuan berbeda: live untuk kondisi sekarang, summary untuk konteks operasional terpilih.

## Asumsi Current Shift

Baseline shift lokal memakai tiga jendela delapan jam: 07.00–15.00, 15.00–23.00, dan 23.00–07.00 WIB. Jadwal ini harus dipindahkan ke konfigurasi plant saat jadwal shift resmi ditetapkan.
