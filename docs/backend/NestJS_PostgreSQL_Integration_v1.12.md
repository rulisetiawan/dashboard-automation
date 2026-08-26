# NestJS PostgreSQL Integration v1.12

**Tanggal:** 22 Agustus 2026

**Status:** Alarm rule metadata for machine detail

## Alarm API

Endpoint `GET /api/v1/alarms/recent` memperkaya setiap alarm dengan metadata konfigurasi:

- `rule_type` dari `alarm_rule`;
- `signal_role` dan `engineering_unit` dari `tag_definition`;
- `threshold_value` dan `trigger_value` tetap berasal dari snapshot event di `alarm_event`.

Relasi dilakukan melalui `alarm_event.rule_id` dan canonical `tag_code`. Dengan demikian, frontend dapat menjelaskan kapan alarm dimulai, rule apa yang dilanggar, batas konfigurasi saat event terjadi, dan nilai aktual pemicunya tanpa query tambahan.

Jika metadata lama tidak lengkap, API tetap mengembalikan event dan frontend menampilkan tanda `—` untuk nilai yang tidak tersedia.

