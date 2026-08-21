# Dashboard V1 Concept v1.32

**Tanggal:** 21 Agustus 2026  
**Status:** Trend aktual PostgreSQL pada detail mesin

## Perubahan

Halaman detail asset yang memakai data PostgreSQL sekarang memuat historian secara on-demand. Halaman overview tidak melakukan query trend untuk seluruh 138 asset.

## Panel Historical Trends

Setiap detail mesin menyediakan:

- Pemilihan range `1H`, `8H`, `24H`, atau `7D`.
- Pilihan sensor dari Tag Registry untuk PV, SV, dan totalizer yang tersedia.
- Grafik actual average, minimum, dan maksimum dari aggregate historian.
- Ringkasan nilai terakhir: min, average, max, dan last.
- Pilihan motor/drive dan grafik current fase R/S/T bila master equipment serta historian motor tersedia.

Data sensor dibaca dari:

```text
GET /api/v1/telemetry/aggregate
```

Data motor dibaca dari:

```text
GET /api/v1/equipment/{equipmentId}/trend
```

## Perilaku data kosong

Dashboard tidak membuat grafik simulasi apabila historian belum tersedia. Kondisi berikut diberi pesan data kosong:

- Tag belum didaftarkan atau belum mempunyai sample historis pada range yang dipilih.
- Asset belum memiliki master `equipment`.
- Equipment belum mempunyai `equipment_telemetry_sample` untuk R/S/T, kW, Hz, dan energy.

## Temuan commissioning aktual

Historian sensor aktual telah tersedia pada data real. Namun per 21 Agustus 2026, asset produksi aktual belum memiliki row master pada tabel `equipment` dan belum memiliki tag arus motor R/S/T. Karena itu trend motor baru dapat tampil setelah equipment register dan mapping tag motor dimasukkan.

## Lanjutan yang diperlukan

1. Daftarkan motor per asset pada tabel `equipment` memakai equipment code baku.
2. Petakan tag current R/S/T, voltage, active power, frequency, runtime, dan energy ke masing-masing equipment.
3. Collector menulis sample motor ke `equipment_telemetry_sample` atau ingestion mapper yang ekuivalen.
4. Validasi quality dan timestamp source sebelum dashboard dipakai untuk troubleshooting.
