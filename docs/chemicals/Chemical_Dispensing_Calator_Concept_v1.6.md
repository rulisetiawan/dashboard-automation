# Chemical Dispensing Calator Concept v1.6

**Versi:** 1.6

**Tanggal:** 21 Agustus 2026

**Status:** Aktif

**Fokus perubahan:** Halaman transaksi dan konsumsi khusus berbasis PostgreSQL

## Keputusan desain

Chemical Dispensing Calator tidak lagi memakai pola halaman mesin produksi. Modul ini tidak menampilkan historian sensor SV/PV, batch trend, motor diagnostic, maintenance, atau process run generik. Fokusnya adalah konsumsi chemical dan audit transaksi penimbangan.

## Hierarki halaman

1. Overview menampilkan lima unit dispensing aktual.
2. Card unit menampilkan konsumsi, jumlah Automatic, Manual, Emergency, chemical terbesar, waktu transaksi terakhir, dan jumlah Calator yang didukung.
3. Detail unit mempertahankan P&ID, mapping Calator yang didukung, serta seluruh analitik yang sudah difilter untuk satu dispenser.

## Time range dan agregasi

Pilihan waktu mencakup 24 jam, 7 hari, 30 hari, bulan berjalan, dan custom start/end. Interval chart dipilih otomatis oleh backend:

- sampai 48 jam: per jam;
- sampai 120 hari: per hari;
- sampai 730 hari: per minggu;
- selebihnya: per bulan.

Semua KPI, breakdown chemical, chart, mode summary, dan transaction log menggunakan filter waktu, dispenser, chemical code, dan mode yang sama.

## Konsumsi chemical

Daftar chemical dibentuk dinamis dari `chemical_transaction`, bukan dari daftar frontend hardcoded. Setiap chemical menampilkan:

- total kg;
- jumlah transaksi;
- rata-rata kg;
- minimum dan maksimum kg;
- persentase terhadap total konsumsi.

Chart menggunakan stacked bar per interval. Setiap chemical dapat ditampilkan atau disembunyikan melalui checklist.

## Automatic, Manual, dan Emergency

- `Automatic` dan `Manual` dihitung sebagai transaksi penimbangan dan memakai `actual_kg` dari sumber.
- `Emergency` ditampilkan sebagai event terpisah dan tidak menambah konsumsi apabila sumber tidak memiliki berat.
- Detail Emergency membaca `emergency_state` dan `auto_state` dari `raw_payload`.

## Transaction log

Transaction log menggunakan pagination di server dengan pilihan 25, 50, atau 100 baris. Kolom utama adalah waktu mulai/selesai, durasi, source ID, chemical, berat aktual, mode, detail proses/Emergency, tujuan Calator, dan status.

Frontend tidak memuat seluruh 112.856 baris sekaligus. PostgreSQL menjalankan filter, total count, agregasi, pengurutan, limit, dan offset.

## Batasan data aktual

CSV sumber belum membawa `calator_id` dan `target_kg`. Tujuan ditampilkan sebagai `Belum teridentifikasi` dan nilai target tidak direka. Mapping konsumsi per Calator baru diaktifkan setelah source memberikan destination identifier.

## Endpoint

`GET /api/v1/chemical/analytics`

Parameter: `from`, `to`, `dispenser_id`, `chemical_code`, `mode`, `page`, dan `page_size`.

Response mencakup `summary`, `units`, `variants`, `available_chemicals`, `time_series`, `transactions`, dan `pagination`.
