# Konsep Mesin Jetflow

## Versi 1.4 — Process Start dan End Time

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Machine_Concept_Jetflow_v1.3.md`

## 1. Tujuan Pembaruan

Versi ini menambahkan waktu aktual setiap step pada tabel process sequence Jetflow agar operator dapat mengetahui kapan proses dimulai dan selesai.

## 2. Struktur Tabel Sequence

| Kolom | Isi |
|---|---|
| Step | Nomor urut step recipe |
| Process | Nama proses atau instruksi recipe |
| Start Time | Waktu aktual step mulai dalam format `HH:mm:ss` |
| End Time | Waktu aktual step selesai dalam format `HH:mm:ss` |
| Status | Complete, Current, atau Pending |

## 3. Aturan Nilai Waktu

- Step Complete menampilkan Start Time dan End Time aktual.
- Step Current menampilkan Start Time aktual dan End Time `In progress` karena proses belum selesai.
- Step Pending menampilkan tanda `—` pada Start Time dan End Time agar waktu yang belum terjadi tidak diperkirakan sebagai data aktual.
- Pada integrasi PLC, timestamp harus berasal dari event perubahan sequence dan disimpan oleh historian dengan referensi machine ID, batch number, recipe, serta step code.
- Timestamp PLC, gateway, historian, dan server harus menggunakan sumber sinkronisasi waktu yang sama.

## 4. Batasan V1.4

- Waktu pada frontend masih berupa data simulasi yang dibangkitkan dari posisi current process.
- Timestamp aktual PLC dan timezone source belum terhubung.
