# Dashboard V1 Concept v1.34

**Tanggal:** 21 Agustus 2026

**Status:** Historian satu parameter dengan pasangan PV/SV

## Perubahan

- Dropdown Sensor Trend sekarang memilih parameter proses, bukan satu tag individual.
- Tag dengan semantic parameter yang sama dan suffix `_PV` serta `_SV` otomatis digabung menjadi satu pilihan.
- Contoh `UPPER_FELT.TEMPERATURE_PV` dan `UPPER_FELT.TEMPERATURE_SV` ditampilkan sebagai parameter `Upper Felt Temperature`.
- Grafik hanya menampilkan parameter terpilih dengan garis PV aktual berwarna cyan dan garis SV setpoint berwarna oranye putus-putus.
- Legend selalu menjelaskan fungsi PV dan SV. Jika tag atau historian SV belum tersedia, statusnya ditampilkan secara eksplisit.
- Ringkasan menampilkan PV terkini, SV terkini, dan deviasi `PV − SV` dengan engineering unit parameter.
- Render akibat WebSocket dan penyelesaian query historian ditunda selama dropdown parameter atau motor sedang aktif, sehingga dropdown tidak menutup sendiri.

## Aturan pairing parameter

```text
Canonical tag
  -> ambil bagian semantic setelah ASSET_ID
  -> hapus suffix _PV / _SV / _TOTAL
  -> gunakan hasilnya sebagai parameter key
  -> pasangkan series PV dan SV pada parameter key yang sama
```

Contoh:

```text
SMM.KL-DPN-06.UPPER_FELT.TEMPERATURE_PV
SMM.KL-DPN-06.UPPER_FELT.TEMPERATURE_SV
                         │
                         └── Upper Felt Temperature
                             ├── PV · actual value
                             └── SV · setpoint
```

## Perilaku refresh real-time

```text
WebSocket refresh / historian selesai
  -> apakah dropdown sedang aktif?
     ├── Ya: simpan refresh sebagai deferred
     └── Tidak: render dengan posisi scroll dipertahankan

Dropdown change / blur
  -> simpan pilihan operator
  -> jalankan render terbaru
```

Pendekatan ini mempertahankan pembaruan real-time tanpa mengganggu interaksi operator dan tetap membatasi query historian hanya pada PV/SV parameter yang sedang dipilih.
