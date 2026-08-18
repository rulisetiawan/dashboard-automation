# PostgreSQL Local Integration v1.2

**Tanggal:** 18 Agustus 2026  
**Status:** Native PostgreSQL service enabled

## Perubahan dari v1.1

Backend lokal tidak lagi memakai PGlite embedded. API sekarang memakai PostgreSQL service asli melalui driver `pg` dan satu connection string lokal.

| Komponen | Konfigurasi |
|---|---|
| Host default | `localhost` |
| Port default | `5432` |
| Driver Node.js | `pg` |
| Database aplikasi | `pt_smm_scada` |
| Source konfigurasi | `.env` yang tidak masuk Git |

Service PostgreSQL 18 pada komputer ini terdeteksi berjalan pada `localhost:5432`. Username, password, dan nama database tidak disimpan di source code.

## Konfigurasi `.env`

Salin `.env.example` menjadi `.env`, lalu isi dengan credential PostgreSQL lokal yang benar.

```text
PORT=8787
DATABASE_URL=postgresql://postgres:ISI_PASSWORD_ANDA@localhost:5432/pt_smm_scada
DATABASE_SSL=false
```

Jangan commit `.env`. Bila password mengandung karakter khusus seperti `@`, `:`, `/`, atau `#`, password pada URL harus di-URL-encode.

## Persiapan database satu kali

Dengan PostgreSQL command line tools, buat database aplikasi jika belum ada:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\createdb.exe' -U postgres -h localhost -p 5432 pt_smm_scada
```

Kemudian jalankan dashboard:

```powershell
npm run dev:postgres
```

Saat koneksi pertama berhasil, migration `postgres/migrations/0001_non_jetflow_local.sql` akan membuat struktur non-Jetflow dan seed demo awal. API akan melaporkan storage sebagai `POSTGRESQL_NATIVE_LOCAL`.

## Batasan dan langkah berikutnya

- Data masih `SIMULATED_SEED`; belum ada gateway PLC/OPC UA.
- Backend lokal ini khusus development. Production perlu role database terbatas, backup, TLS, monitoring, dan PostgreSQL/TimescaleDB terkelola.
- Konfigurasi D1 pada cloud deployment tidak diubah pada versi ini.
