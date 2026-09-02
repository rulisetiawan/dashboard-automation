# Solar Fueling Backend Integration v1.1

**Status:** Aktif
**Tanggal:** 2 September 2026
**Baseline:** Melanjutkan `Solar_Fueling_Backend_Integration_v1.0.md`

## Migrasi MySQL ke PostgreSQL

Script `scripts/migrate-solar-mysql-to-postgres.mjs` membaca `qr_codes` dan `qr_solar_level` secara batch lalu melakukan upsert berdasarkan pasangan `source_system + source_id`.

Karakter NUL dari field teks sumber dibersihkan sebelum masuk PostgreSQL. Record sumber tetap disimpan sebagai `raw_payload` pada transaksi untuk audit.

Perintah yang tersedia:

- `npm run migrate:solar-mysql` — full reconciliation seluruh data sumber.
- `npm run sync:solar-mysql` — initial incremental sync lalu polling setiap 15 detik.

State sinkronisasi disimpan di `solar_source_sync_state`, sehingga restart tidak mengulang seluruh histori.

## Sensor level

Tabel `solar_level_sample` menyimpan:

- source ID dan source system;
- tank ID;
- stock liter;
- kualitas dan alasan kualitas;
- source timestamp;
- waktu ingestion/update.

Index `(tank_id, source_ts DESC)` melayani latest value dan range trend. Partial index kualitas `GOOD` melayani agregasi historian tanpa membaca sampel invalid.

Endpoint tambahan:

- `POST /api/v1/ingestion/solar-levels` untuk integrasi HTTP/Node-RED alternatif.
- `GET /api/v1/solar/overview` mengembalikan live level dan `level_time_series`.

Raw TCP MySQL hanya digunakan pada backend lokal PostgreSQL. Hosted Sites tidak membuka koneksi TCP langsung ke MySQL; hosted ingestion tetap melalui HTTP.
