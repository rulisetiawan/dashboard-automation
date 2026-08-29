# NestJS PostgreSQL Integration v1.19

**Versi:** 1.19  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `NestJS_PostgreSQL_Integration_v1.18.md`  
**Fokus perubahan:** Projection dan realtime feedback control mode dispensing

## Database

Migrasi `0019_dispensing_control_mode_feedback.sql` mendaftarkan satu tag berikut untuk setiap asset dengan `process_type = chemical`:

```text
SMM.{ASSET_ID}.MACHINE.AUTO_MODE_FB
```

Metadata tag:

- `signal_role`: `MACHINE_AUTO_MODE_FB`;
- `engineering_unit`: `bool`;
- `freshness_mode`: `ASSET_HEARTBEAT`;
- `source_status`: `PENDING_MAPPING` sampai alamat PLC/Node-RED disetujui.

## API dan realtime

Response asset menyertakan `controlMode`, `controlModeQuality`, dan `controlModeSourceTs`. Event `asset:communication` membawa field yang sama agar badge Chemical Dispensing berubah tanpa full-page render.

Normalisasi mode menerima nilai numerik `1/0` maupun teks `AUTO`/`MANUAL`. Nilai hanya diproyeksikan sebagai Auto atau Manual ketika effective quality `GOOD`; kondisi lain menjadi `UNKNOWN`.
