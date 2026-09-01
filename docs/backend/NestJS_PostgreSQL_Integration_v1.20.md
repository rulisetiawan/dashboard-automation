# NestJS PostgreSQL Integration v1.20

**Versi:** 1.20
**Tanggal:** 1 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `NestJS_PostgreSQL_Integration_v1.19.md`
**Fokus perubahan:** Registrasi backend Calator Depan 03

## Database

Migrasi `0020_add_calator_depan_03.sql` menambahkan secara idempotent:

- asset `CL-DPN-03` pada proses `calator`, area `DPN`;
- snapshot awal `OFFLINE`, `connected = false`, dan quality `NO_DATA`;
- satu heartbeat dan sebelas canonical process tags;
- feedback route `OPEN_FB` dan `FAULT_FB` untuk route 03 pada `DSP-DPN-01`.

Migrasi tidak menimpa snapshot aktual jika asset sudah pernah dibuat atau menerima data.

## Ingestion dan koneksi

Node-RED dapat mengirim nilai melalui `POST /api/v1/ingestion/live-values` menggunakan `asset_id: CL-DPN-03`. Heartbeat canonical adalah:

```text
SMM.CL-DPN-03.COMMUNICATION.HEARTBEAT
```

Asset baru tetap tidak terhubung sampai heartbeat berkualitas `GOOD` diterima dalam batas freshness yang berlaku. REST asset projection dan event realtime kemudian menggunakan data yang sama untuk memperbarui card serta detail mesin.
