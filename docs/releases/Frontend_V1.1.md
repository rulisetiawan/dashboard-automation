# Frontend Dashboard V1.1

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Custom date range dan interactive historical trend

## Ringkasan

Frontend V1.1 memperbarui Historical Trend Explorer agar operator dan engineer dapat memilih rentang waktu bebas serta menelusuri data dengan menggeser chart secara horizontal.

## Fitur Ditambahkan

- Preset 1 jam, 8 jam, 24 jam, 7 hari, dan 30 hari.
- Pilihan Custom dengan input Start Date & Time dan End Date & Time.
- Validasi bahwa start dan end terisi serta end lebih besar dari start.
- Ringkasan full time range dan visible window.
- Horizontal drag langsung pada historical chart.
- Touch swipe pada perangkat tablet atau mobile.
- Mouse wheel untuk menggeser visible window.
- Keyboard Arrow Left dan Arrow Right untuk aksesibilitas.
- Timeline navigator dengan selection window yang dapat digeser.
- Zoom in, zoom out, dan Fit Range.
- Format label waktu otomatis berdasarkan durasi yang sedang terlihat.

## Perilaku Data

- Pemilihan preset mengatur start dan end secara otomatis terhadap waktu terbaru.
- Custom range menerima tanggal dan waktu bebas dalam zona WIB.
- Setelah range diterapkan, chart membuka bagian terbaru dari rentang tersebut.
- Pengguna dapat menggeser ke periode yang lebih lama tanpa mengganti full range.
- Fit Range menampilkan seluruh data dari start sampai end.
- Jumlah titik visual dibatasi dan disampling agar interaksi tetap ringan ketika rentang sangat panjang.

## Batasan

- Data masih merupakan simulasi frontend.
- Query historian aktual belum tersedia.
- Export CSV dan Save View belum terhubung ke backend.
- Zona waktu plant sementara menggunakan WIB.

## Kebutuhan Integrasi Berikutnya

- Historian API dengan parameter asset, tag, start time, end time, aggregation, dan sample interval.
- Strategi downsampling seperti min/max/average untuk range panjang.
- Event dan alarm overlay berdasarkan timestamp aktual.
- Batas maksimal query serta timeout dari historian.
- Preferensi timezone dan format tanggal plant.
