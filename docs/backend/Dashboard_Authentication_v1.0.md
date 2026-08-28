# Dashboard Authentication v1.0

**Versi:** 1.0  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif

## Password storage

Password tidak dienkripsi dan tidak dapat didekripsi kembali. Password diproses sebagai salted one-way hash dengan format:

```text
pbkdf2-sha256$600000$BASE64_SALT$BASE64_DERIVED_KEY
```

- salt: 32 byte acak per user;
- derived key: 32 byte;
- digest: SHA-256;
- iterasi: 600.000;
- verifikasi menggunakan constant-time comparison.

## Session storage

- Browser menerima random session token 256-bit.
- Cookie memakai `HttpOnly`, `SameSite=Strict`, `Path=/`, dan `Secure` pada HTTPS.
- PostgreSQL/D1 hanya menyimpan SHA-256 hash token.
- Session berlaku 12 jam dan dapat dicabut melalui logout.
- Aktivitas session dicatat maksimal setiap lima menit untuk menghindari write berlebihan.

## Brute-force protection

- Error login selalu generik agar keberadaan username tidak dapat ditebak.
- Setelah lima kegagalan, akun dikunci selama 15 menit.
- Login berhasil mereset counter serta lockout.

## Provisioning user

Password diberikan melalui environment proses dan tidak ditulis ke file:

```powershell
$env:DASHBOARD_USER_PASSWORD = "password-kuat-minimal-12-karakter"
npm run user:create -- --username=admin --name="Digital Automation Admin" --role=ADMIN
Remove-Item Env:DASHBOARD_USER_PASSWORD
```

Script menyimpan hash baru ke PostgreSQL dan mengaktifkan kembali user tersebut bila sebelumnya dinonaktifkan.

Pada hosted D1, akun bootstrap memakai environment runtime yang sama setiap kali worker memastikan skema. Bila username sudah ada dan hash berubah, hash akun diperbarui secara idempotent sehingga rotasi kredensial dapat diterapkan melalui environment lalu deployment baru.
