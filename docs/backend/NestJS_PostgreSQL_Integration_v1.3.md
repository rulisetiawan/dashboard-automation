# NestJS + PostgreSQL Local Integration v1.3

**Tanggal:** 18 Agustus 2026  
**Status:** Aktif — real-time dashboard channel

## Kanal real-time

NestJS menjalankan Socket.IO namespace `/realtime`. Browser membuka koneksi setelah halaman dimuat dan mengirim `dashboard:subscribe`.

```text
PostgreSQL (perubahan snapshot / batch / utility)
                  ↓
         RealtimeGateway NestJS
          (pemeriksaan versi tiap 2 detik)
                  ↓ dashboard:refresh
          Socket.IO /realtime
                  ↓
          Browser memuat ulang API aktual
```

Event `dashboard:refresh` membawa waktu versi data dan daftar sumber yang dipantau. Browser kemudian memuat kembali endpoint REST aktual dengan tetap mempertahankan posisi scroll.

## Sumber perubahan yang dipantau

- `asset` dan `asset_snapshot`
- `utility_snapshot`
- `chemical_transaction`
- `alarm_event`
- `batch_process_run`

## Catatan integrasi collector

Collector PLC/OPC UA/Modbus tetap menulis ke PostgreSQL dengan timestamp sumber dan `updated_at` yang aktual. Gateway Socket.IO mendeteksi perubahan tersebut dan menyegarkan dashboard. Pada tahap collector berikutnya, event dapat dipancarkan langsung setelah penulisan untuk latensi lebih rendah dari interval pemeriksaan.

## Validasi

Perubahan `progress_percent` untuk `CL-DPN-01` berhasil memicu event `dashboard:refresh` melalui WebSocket lokal.
