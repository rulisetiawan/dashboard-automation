# Frontend Dashboard V1.14

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Batch-scoped SV/PV trend dan abnormality log

## Ringkasan

Trend sensor SV/PV dan Production Abnormality Log pada detail mesin tidak lagi dimuat secara otomatis. Pengguna harus mencari atau memilih nomor batch terlebih dahulu, kemudian seluruh data historical ditampilkan dalam konteks batch yang sama.

## Alur Pengguna

1. Buka detail mesin Jetflow, Calator, Dryer, Kalender, atau Chemical Dispensing.
2. Tinjau seluruh nilai dan status live mesin di bagian atas.
3. Masukkan nomor batch pada Search Production Batch atau pilih salah satu recent batch.
4. Jalankan pencarian.
5. Dashboard menampilkan:
   - Trend SV/PV sensor untuk batch terpilih.
   - Pemilihan sensor On/Off.
   - Rentang tampilan trend 1H, 8H, atau 24H.
   - Production Abnormality Log untuk batch yang sama.
6. Gunakan Clear untuk menghapus scope batch dan menyembunyikan kembali data historical.

## Perubahan

- Menambahkan Batch Historian Lookup pada seluruh detail mesin proses dan dispensing.
- Menambahkan recent batch shortcuts.
- Menambahkan status Batch Loaded yang menampilkan mesin dan nomor batch aktif.
- Trend SV/PV tidak dirender sebelum nomor batch dipilih.
- Abnormality log tidak dirender sebelum nomor batch dipilih.
- Semua baris abnormality log menggunakan nomor batch terpilih.
- Data live tetap berada di atas; workspace investigasi batch berada di bawah seluruh informasi live.
- Chemical Dispensing mendapatkan abnormality log untuk flow, pressure, weight, tank level, pump speed, dan route feedback.

## Validasi Input

- Nomor batch dinormalisasi menjadi huruf kapital.
- Input dibatasi pada karakter huruf, angka, dan tanda hubung.
- Panjang maksimum nomor batch adalah 32 karakter.
- Pencarian kosong tidak memuat data.

## Batasan

- Lookup batch dan trend masih simulated.
- Sistem belum melakukan validasi nomor batch terhadap database MES/historian aktual.
- Timestamp dan abnormal event belum berasal dari PLC atau historian produksi.
