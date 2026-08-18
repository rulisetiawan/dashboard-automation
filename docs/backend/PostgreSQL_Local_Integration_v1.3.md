# PostgreSQL Local Integration v1.3

**Tanggal:** 18 Agustus 2026  
**Status:** Native PostgreSQL configuration hardened

## Perubahan dari v1.2

Konfigurasi koneksi native PostgreSQL dapat memakai field terpisah, sehingga password tidak perlu dimasukkan ke dalam URL koneksi. Ini menghindari masalah ketika password berisi karakter khusus seperti `@`, `:`, `/`, atau `#`.

```text
PORT=8787
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pt_smm_scada
DB_USER=postgres
DB_PASSWORD=ISI_PASSWORD_ANDA
DATABASE_SSL=false
```

`.env` aktif harus berada di root project, satu folder dengan `package.json`. Jangan mengubah `.env.example`, karena file tersebut hanya template dan tidak dipakai saat API dijalankan.

## Urutan pengecekan jika autentikasi gagal

1. Pastikan password diisi pada `DB_PASSWORD` dalam `.env`, bukan pada `.env.example`.
2. Pastikan nama role pada `DB_USER` benar. Role tidak selalu bernama `postgres`.
3. Pastikan database pada `DB_NAME` sudah ada dan role tersebut memiliki akses ke database.
4. Jika password mengandung `#`, bungkus nilainya dengan tanda kutip tunggal, misalnya `DB_PASSWORD='Sandi#Aman'`.
5. Jalankan `npm run dev:postgres` dari root project setelah menyimpan `.env`.

`DATABASE_URL` masih didukung untuk environment server/production. Bila `DATABASE_URL` diisi, nilainya akan menjadi prioritas dibanding field terpisah.
