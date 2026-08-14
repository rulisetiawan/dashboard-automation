# Frontend Dashboard V1.8

**Tanggal:** 14 Agustus 2026  
**Status:** In-place dashboard interaction selesai

## Tujuan update

Mencegah halaman kembali ke posisi paling atas ketika pengguna melakukan interaksi filter yang hanya memperbarui komponen pada halaman aktif.

## Perubahan

- Posisi scroll dipertahankan ketika pengguna:
  - memilih area/lane pada consumption donut;
  - memilih area/lane melalui legend;
  - menekan All Areas atau All Lanes;
  - mengganti jenis resource Water, Energy, Steam, Thermal, atau Chemical;
  - mengganti level dan equipment pada Electrical Distribution;
  - mengklik segmen Electrical Distribution;
  - mengganti range chart lokal;
  - menerapkan preset atau custom historical range.
- Navigasi ke halaman proses, area, atau detail mesin tetap kembali ke bagian atas karena merupakan perpindahan halaman.

## Dampak UX

Panel chart dan ranking dapat dibandingkan berulang kali tanpa kehilangan posisi baca pengguna.
