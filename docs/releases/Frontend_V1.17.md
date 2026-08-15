# Frontend Dashboard V1.17

**Tanggal:** 15 Agustus 2026  
**Status:** Selesai  
**Fokus:** Scrollable recent batch table

## Ringkasan

Daftar recent batch pada Batch Historian Lookup diubah dari shortcut button menjadi tabel yang dapat di-scroll. Struktur ini disiapkan untuk menampung histori batch dalam jumlah besar tanpa memperpanjang halaman detail mesin.

## Kolom Tabel

- Batch No.
- Start.
- End.
- Status.
- Action.

## Perubahan

- Menampilkan 18 recent batch simulated pada setiap mesin.
- Area tabel memiliki batas tinggi dan vertical scroll.
- Header tabel tetap terlihat ketika daftar di-scroll.
- Tabel mendukung horizontal scroll pada layar sempit.
- Tombol Load memuat batch terpilih ke trend SV/PV dan abnormality log.
- Batch aktif diberi highlight dan status tombol Loaded.
- Pencarian nomor batch manual tetap tersedia di atas tabel.
- Status batch mendukung Running, Completed, dan Hold.

## Batasan

- Recent batch masih simulated.
- Belum terdapat pagination, server-side search, atau filter status/tanggal.
- Waktu batch belum berasal dari MES atau historian aktual.
