# Dashboard V1.63 Presentation Package

Paket ZIP V1.63 adalah snapshot read-only dari source, hasil build frontend/backend, migrasi, dan dokumentasi pada akhir pengembangan Dashboard V1.

## Menjalankan Paket

1. Ekstrak ZIP ke folder baru.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env`, lalu isi koneksi PostgreSQL lokal.
4. Jalankan `npm run start:postgres`.
5. Buka alamat lokal yang ditampilkan server.

Untuk membuka V1 dan V2 bersamaan, gunakan nilai `PORT` yang berbeda pada masing-masing file `.env`. Kedua versi dapat memakai PostgreSQL yang sama apabila hanya digunakan untuk presentasi/read-only.

## Keamanan

File `.env`, password PostgreSQL, folder `node_modules`, repository Git, dan data import mentah tidak dimasukkan ke ZIP.

