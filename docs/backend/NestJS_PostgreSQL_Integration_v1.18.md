# NestJS PostgreSQL Integration v1.18

**Versi:** 1.18  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `NestJS_PostgreSQL_Integration_v1.17.md`  
**Fokus perubahan:** Autentikasi operator dashboard

## Komponen baru

- `AuthController` menyediakan login, session validation, dan logout.
- `AuthService` menangani verifikasi password, lockout, pembuatan session, dan revocation.
- `DashboardAuthMiddleware` melindungi route `/api/v1/*` yang digunakan dashboard.
- `RealtimeGateway` memvalidasi session cookie saat WebSocket handshake.
- Migrasi `0018_dashboard_authentication.sql` menyediakan tabel user dan session.

## Route

| Method | Route | Fungsi |
|---|---|---|
| GET | `/api/v1/auth/session` | Validasi session aktif dan kembalikan profil pengguna |
| POST | `/api/v1/auth/login` | Verifikasi kredensial dan terbitkan cookie session |
| POST | `/api/v1/auth/logout` | Cabut session aktif dan hapus cookie |

## Pengecualian machine-to-machine

Route berikut tidak memakai cookie operator:

- `POST /api/v1/ingestion/*`;
- `POST /api/v1/batch/production-batches`;
- `POST /api/v1/batch/process-runs`.

Route tersebut tetap wajib memakai `INGEST_API_KEY` pada deployment produksi.

