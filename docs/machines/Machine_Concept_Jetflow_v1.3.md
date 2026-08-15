# Konsep Mesin Jetflow

## Versi 1.3 — Compact Process Sequence Table

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Jetflow_v1.2.md`

## 1. Tujuan Pembaruan

Versi ini mengubah penyajian process sequence Jetflow agar tetap ringkas ketika sebuah recipe memiliki puluhan hingga sekitar 100 step. Setiap step tidak lagi menggunakan kartu besar.

## 2. Konsep Tampilan

Process sequence ditampilkan dalam tabel ringkas dengan kolom:

| Kolom | Isi |
|---|---|
| Step | Nomor urut step recipe |
| Process | Nama proses atau instruksi recipe |
| Status | Complete, Current, atau Pending |

Tabel menggunakan tinggi tetap dan vertical scroll. Header tetap terlihat saat operator menggulir daftar. Pada layar sempit, tabel dapat digulir horizontal tanpa mengubah lebar halaman.

Current Process diberi highlight utama, step yang selesai menggunakan indikator hijau, dan step berikutnya menggunakan tampilan netral. Ringkasan di atas tabel tetap menunjukkan nama current process serta posisi step aktif.

## 3. Skalabilitas Sequence

- UI tidak membatasi model data ke 12 step demo.
- Sequence disimpan sebagai daftar berurutan sehingga dapat memuat hingga sekitar 100 step atau mengikuti recipe aktual.
- Nama dan jumlah step harus berasal dari PLC recipe/sequence mapping per mesin dan per batch.
- Nomor step dari PLC perlu dipertahankan apabila tidak selalu berurutan.
- Historian perlu menyimpan waktu mulai, waktu selesai, status, serta alarm per step untuk analisis batch berikutnya.

## 4. Batasan V1.3

- Frontend masih menggunakan 12 step contoh dari V1.2.
- Mapping recipe aktual hingga 100 step belum tersedia.
- Waktu mulai, durasi, dan abnormal state per step belum ditampilkan pada tabel ini.
