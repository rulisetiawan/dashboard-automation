# Frontend Dashboard V1.6

**Tanggal:** 14 Agustus 2026  
**Status:** Electrical Distribution mapping selesai

## Tujuan update

Merapikan monitoring distribusi listrik agar perbandingan beban antar-level dapat dipahami melalui pie chart dan tetap menyediakan detail equipment tanpa memenuhi halaman dengan hierarchy tree.

## Fitur yang ditambahkan

- Dropdown level distribusi: **Electrical Cubical**, **Electrical MDP**, dan **Electrical SDP**.
- Dropdown equipment yang mengikuti level distribusi terpilih.
- Pie chart perbandingan actual demand:
  - 3 Electrical Cubical.
  - 6 Electrical MDP.
  - 17 Electrical SDP.
- Segmen pie dan legend dapat diklik untuk memilih equipment.
- Detail equipment di samping chart meliputi:
  - actual dan peak demand;
  - persentase kontribusi terhadap kelompok;
  - loading;
  - power factor;
  - voltage;
  - energy shift;
  - data status;
  - upstream supply;
  - downstream consumers.
- Legend memiliki scroll khusus untuk kelompok SDP yang jumlahnya lebih banyak.
- Layout responsif untuk desktop, tablet, dan mobile.

## Diubah

- Hierarchy tree lama pada Electrical Distribution dihapus dari halaman Utilities.
- Electrical Distribution menjadi panel utama full-width.
- Panel Boiler & Water tetap dipertahankan sebagai bagian utilitas terpisah.

## Batasan

- Nama Cubical, MDP, SDP, lokasi, dan hubungan upstream/downstream masih mapping konseptual.
- Demand, peak, power factor, voltage, energy, dan status masih simulated.
- Belum terhubung ke meter listrik, single-line diagram, historian, atau tag registry aktual.

## Data yang dibutuhkan untuk integrasi berikutnya

1. Nomor resmi setiap Cubical, MDP, dan SDP.
2. Single-line diagram dan hubungan parent–child aktual.
3. Kapasitas breaker, transformer, dan configured load.
4. Tag kW, kWh, voltage, current, power factor, frequency, dan breaker status.
5. Mapping SDP ke mesin atau utility consumer aktual.
