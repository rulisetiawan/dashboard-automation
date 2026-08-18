# PostgreSQL Local Integration v1.1

**Tanggal:** 18 Agustus 2026  
**Status:** Local environment configuration added

## Perubahan dari v1.0

Konfigurasi local PostgreSQL sekarang dipindahkan dari nilai default kode ke file environment lokal.

| File | Fungsi |
|---|---|
| `.env` | Konfigurasi aktif komputer lokal; tidak masuk Git. |
| `.env.example` | Template konfigurasi untuk developer lain. |

## Variabel yang tersedia

```text
PORT=8787
LOCAL_POSTGRES_DATA_DIR=.data/pt-smm-postgres
```

`PORT` menentukan alamat local API/dashboard. `LOCAL_POSTGRES_DATA_DIR` menentukan lokasi persistent database PGlite/PostgreSQL lokal.

## Menjalankan

```text
npm run dev:postgres
```

Script otomatis membaca `.env` melalui Node `--env-file=.env`.

## Keputusan

- `.env` tidak disimpan pada Git untuk menjaga konfigurasi lokal tetap privat.
- `.env.example` menjadi baseline konfigurasi tanpa credential production.
- Koneksi production PostgreSQL nantinya memakai environment variable terpisah dan tidak menggunakan file `.env` lokal ini.
