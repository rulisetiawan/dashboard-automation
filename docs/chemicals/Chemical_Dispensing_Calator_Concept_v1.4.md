# Chemical Dispensing Calator Concept v1.4

**Versi:** 1.4  
**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Konsep P&ID visual untuk dispensing Calator

## Tujuan

Mengganti placeholder remote display pada detail Chemical Dispensing Calator dengan P&ID ringkas yang memperlihatkan alur material dari inlet chemical hingga Calator tujuan. Diagram membantu operator dan manajemen memahami jalur proses tanpa membuka HMI mesin.

## Topologi proses yang ditampilkan

1. Delapan jalur chemical masuk melalui valve `XV-101` sampai `XV-108` menuju **Tank 1**.
2. Tank 1 berfungsi sebagai weighing/buffer tank dan ditopang tiga titik loadcell: `LC-101`, `LC-102`, dan `LC-103`.
3. Material keluar dari Tank 1 melalui valve transfer `XV-201` menuju **Tank 2**.
4. Tank 2 berfungsi sebagai distribution tank sebelum material dicabang ke Calator yang didukung oleh unit dispensing tersebut.
5. Tujuan Calator mengikuti mapping per unit dispensing dan area yang dipilih pada dashboard.

## Tampilan dashboard

- Diagram berstatus **read-only**; valve tidak dapat dioperasikan dari dashboard.
- Valve berwarna hijau adalah representasi konsep kondisi open, bukan state PLC aktual.
- Label tujuan akan berubah mengikuti unit dispensing yang dipilih, misalnya `DSP-DPN-01` hanya menampilkan `CL-DPN-01` dan `CL-DPN-02`.
- Ringkasan bawah diagram menunjukkan jumlah inlet valve, transfer valve, dan jumlah Calator tujuan.

## Data/tag yang diperlukan saat integrasi

| Kelompok | Tag minimal |
|---|---|
| Inlet | Command/state valve XV-101 s.d. XV-108, source chemical, flow/totalizer bila tersedia |
| Tank 1 | Level, berat total, tiga nilai loadcell, high/high-high level, status agitator bila ada |
| Transfer | Command/state XV-201, permissive/interlock, flow dan total transfer |
| Tank 2 | Level, ready-to-dose status, high/low level |
| Distribution | Route aktif, valve tujuan, Calator tujuan, request code, jumlah target/aktual |

## Batasan

Topologi ini adalah konsep awal berdasarkan penjelasan proses. Nomor tag, jenis valve, arah pipa, interlock, instrument, dan jalur aktual wajib diverifikasi terhadap P&ID engineering, SOP, HAZOP, dan PLC commissioning sebelum digunakan sebagai referensi operasional.
