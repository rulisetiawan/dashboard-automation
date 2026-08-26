# External Batch Ingestion API v1.2

**Dashboard:** V2.1  
**Tanggal:** 22 Agustus 2026

## Active Batch Projection

Mulai versi ini, `batch_process_run` adalah source of truth untuk konteks batch aktif. `asset_snapshot` tetap menjadi read model real-time untuk dashboard, bukan sumber utama batch.

### Kepemilikan field

| Data | Penulis utama |
|---|---|
| `batch_no`, `progress_percent`, status run | NestJS Batch API |
| sensor, connection, quality, source timestamp | Collector/Node-RED |
| tampilan batch pada API asset | Active `batch_process_run`, dengan snapshot sebagai fallback |

### Aturan sinkronisasi

1. POST process run `RUNNING` atau `HOLD` menyimpan batch dan progress pada `batch_process_run`.
2. Backend memproyeksikan konteks tersebut ke `asset_snapshot` dalam transaksi yang sama.
3. Trigger PostgreSQL mempertahankan `batch_no` dan `progress_percent` apabila collector memperbarui snapshot selama run masih aktif.
4. Endpoint asset melakukan fallback ke active run agar halaman mesin tidak kehilangan konteks batch.
5. POST `COMPLETED`, `CANCELLED`, atau `FAILED` mengakhiri proteksi active run dan backend boleh melepas batch dari snapshot.

### Hasil verifikasi lokal

Untuk `KL-DPN-05`, payload `ERP-RUN-000991` menghasilkan:

- HTTP `201`, operasi `UPDATED`;
- `batch_process_run.batch_no = BATCH-20260822-001`;
- `batch_process_run.progress_percent = 42.50`;
- setelah refresh Node-RED, snapshot tetap memiliki batch dan progress yang sama;
- `GET /api/v1/assets?process=kalender` menampilkan batch tersebut pada informasi mesin.

`machine_state` tetap berasal dari kondisi aktual telemetry. Run berstatus `RUNNING` tidak selalu berarti motor sedang bergerak; mesin dapat berhenti sementara atau mengalami downtime di tengah batch.

