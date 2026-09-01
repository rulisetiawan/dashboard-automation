# Dashboard V2 Concept v2.26

**Versi:** 2.26
**Tanggal:** 1 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.25.md`
**Fokus perubahan:** Penyederhanaan informasi pada layar operasional

## Prinsip tampilan

Halaman operasional hanya menampilkan informasi yang membantu operator mengambil keputusan: identitas area atau mesin, state, koneksi, batch, alarm, nilai proses, dan waktu pembaruan. Nama database, nama tabel, format penyimpanan, serta istilah implementasi backend tidak ditampilkan sebagai keterangan umum.

Informasi teknis koneksi dan kualitas data tetap tersedia pada menu Data Health untuk keperluan diagnostic.

## Perubahan utama

- Subtitle `Asset, snapshot, dan status dari PostgreSQL` dihapus dari header area.
- Header area dibuat compact dan hanya memuat kode area, nama proses-area, serta jumlah mesin.
- Badge teknis `POSTGRESQL ACTUAL` pada halaman operasional diganti dengan `LIVE DATA` atau dihapus jika tidak memberi konteks tambahan.
- Footer card area menampilkan rasio mesin connected sebagai informasi operasional.
- Keterangan nama tabel seperti `asset_snapshot`, `equipment_snapshot`, dan `chemical_transaction` diganti dengan deskripsi yang mudah dipahami operator.
- Status layanan pada sidebar memakai istilah produk: data service dan live updates.
