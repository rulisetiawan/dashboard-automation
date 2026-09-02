# Solar Fueling Backend Integration v1.2

**Status:** Aktif
**Tanggal:** 2 September 2026
**Baseline:** Melanjutkan `Solar_Fueling_Backend_Integration_v1.1.md`

## Koreksi sinkronisasi perubahan baris

QR MySQL tidak selalu menghasilkan baris baru ketika proses selesai. Baris yang sama dapat berubah dari `AKTIF` menjadi `TERPAKAI`. Karena itu cursor `id > last_source_id` saja tidak cukup.

Setiap polling sekarang memeriksa:

- seluruh source ID baru;
- window 500 source ID terakhir; dan
- seluruh transaksi PostgreSQL yang masih berstatus `QR_CREATED`, `READY`, atau `DISPENSING`, termasuk ID lama.

`raw_payload` canonical dibandingkan sebelum upsert. Jika payload tidak berubah, update tidak dijalankan sehingga refresh realtime tidak dipicu tanpa perubahan data.

## Validasi final transaction

- Summary konsumsi dan trend hanya menggunakan `COMPLETED/PARTIAL`.
- Exception variance volume hanya menggunakan `COMPLETED/PARTIAL`.
- Placeholder `actual_solar=0` pada `READY` tetap tersimpan untuk audit sumber tetapi tidak ditafsirkan sebagai hasil pengisian oleh frontend.

## Histori

Validasi rentang API dinaikkan dari 366 hari menjadi lima tahun. Transaksi tetap dicari dan di-page pada server berdasarkan `fueling_completed_at`, `qr_created_at`, `fueling_started_at`, `source_updated_at`, lalu `ingested_at` sebagai fallback terakhir. Urutan ini mencegah transaksi legacy tanpa tanggal created/completed masuk ke tanggal migrasi.
