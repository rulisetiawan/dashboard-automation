# Live Value Ingestion API v1.0

**Versi:** 1.0  
**Tanggal:** 27 Agustus 2026  
**Status:** Implemented  
**Scope awal:** Nilai live tanpa historian, termasuk loadcell Chemical Dispensing

## Keputusan penyimpanan

Endpoint ini menulis langsung ke `tag_latest` dan tidak menambahkan baris ke `telemetry_sample`. Dengan demikian, satu tag hanya memiliki satu nilai terbaru dan data live tidak menumpuk sebagai histori.

Nilai akhir transaksi tetap disimpan pada tabel domain yang sesuai. Untuk Chemical Dispensing, hasil timbang final tetap masuk ke `chemical_transaction.actual_kg`.

## Endpoint

```http
POST /api/v1/ingestion/live-values
Content-Type: application/json
X-API-Key: NILAI_INGEST_API_KEY
```

Header `X-API-Key` wajib jika `INGEST_API_KEY` dikonfigurasi pada environment backend.

Contoh batch dari Node-RED:

```json
{
  "gateway_id": "NODERED-DSP-01",
  "source_ts": "2026-08-27T14:30:00+07:00",
  "values": [
    {
      "asset_id": "DSP-DPN-01",
      "tag_code": "SMM.DSP-DPN-01.TANK_01.WEIGHT_PV",
      "value_number": 124.23,
      "quality": "GOOD",
      "message_id": "21d22cbd-0ce0-43e6-a75b-bb0cc981aada"
    }
  ]
}
```

Satu value tanpa array juga diterima. Field `value` dapat dipakai sebagai bentuk ringkas; angka dipetakan ke `value_number`, sedangkan string/boolean dipetakan ke `value_text`.

## Validasi

- Maksimal 200 tag per request.
- Tag harus terdaftar, aktif, dan dimiliki oleh `asset_id` yang dikirim.
- Quality: `GOOD`, `BAD`, `STALE`, atau `NOT_CONNECTED`.
- `source_ts` memakai ISO-8601; jika tidak dikirim, backend memakai waktu penerimaan server.
- Timestamp lebih dari lima menit di masa depan ditolak.
- Payload yang lebih lama atau duplikat tidak menimpa nilai terbaru.
- `message_id` harus UUID; jika tidak dikirim, backend membuat UUID.

Response memakai operasi `APPLIED` atau `IGNORED_STALE_OR_DUPLICATE` untuk setiap tag dan menyatakan storage `TAG_LATEST_ONLY`.

## Pengujian dari Node-RED

- Gunakan HTTP Request dengan metode `POST`, URL `http://localhost:8787/api/v1/ingestion/live-values`, dan return berupa parsed JSON object.
- Hubungkan output HTTP Request ke Debug agar `msg.statusCode` dan `msg.payload` terlihat. Output yang tidak terhubung membuat respons server tidak tampak di sidebar Debug.
- Untuk Inject manual, `source_ts` dan `message_id` boleh tidak dikirim; backend akan membuat waktu penerimaan dan UUID baru. Cara ini mencegah payload uji berulang dianggap stale atau duplikat.
- Untuk flow produksi, kirim `source_ts` aktual dari controller/gateway dan UUID baru pada setiap sampel. Jangan menggunakan timestamp atau UUID statis.
- Inject manual tidak berjalan otomatis. Klik tombol Inject untuk mengirim satu request, atau hubungkan HTTP Request ke flow data aktual.

## Realtime

Setelah commit berhasil, backend mengirim `instrument:delta` ke room WebSocket asset terkait. Polling gateway tetap menjadi jalur rekonsiliasi sehingga reconnect dashboard mengambil full state melalui `GET /api/v1/assets/{assetId}/instrument-states`.

## Keamanan jaringan

Backend mendengarkan TCP port `8787`. Untuk akses dari komputer lain, firewall harus dibatasi ke IP/subnet sumber yang disetujui. Jangan mengekspos endpoint ke internet dan aktifkan `INGEST_API_KEY` sebelum penggunaan produksi lintas perangkat.
