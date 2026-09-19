# Finishing Demo Data v1.0

**Tanggal:** 19 September 2026  
**Status:** Development/demo only

## Tujuan

Seed ini membuat fitur Continuous, Inspecting, Finishing, dan Setting Dongnam dapat ditinjau sebelum PLC, totalizer, serta kamera aktual terhubung. Data hanya ditulis untuk 21 asset area Finishing dan ditandai dengan sumber `FINISHING-DEMO` serta `demo_sample = true`.

## Cakupan

- Snapshot aktual semu dengan variasi status running, idle, warning, dan fault.
- Heartbeat yang dapat dipertahankan setiap 10 detik melalui follower demo.
- Telemetry 8 jam dengan interval 15 menit untuk seluruh tag numerik.
- Batch dan process run aktif untuk setiap mesin.
- Output aktual contoh dalam meter.
- Machine-state event untuk runtime dan availability.
- Main-drive equipment, snapshot listrik, dan trend 8 jam.
- Tiga alarm contoh, termasuk active dan cleared.
- Nilai quality/defect serta status kamera pada mesin Inspecting.

## Menjalankan

```powershell
npm run seed:finishing-demo
npm run demo:finishing:follow
```

Perintah pertama bersifat idempotent untuk identifier demo yang sama. Perintah kedua menjalankan seed lalu mempertahankan heartbeat agar status koneksi tetap `CONNECTED`. Jika follower dihentikan, status menjadi stale/disconnected setelah 30 detik sesuai aturan produksi.

## Batasan

Data ini bukan data produksi dan tidak boleh digunakan untuk pelaporan aktual. Sebelum commissioning PLC, hentikan follower demo dan hapus data dengan `gateway_id/source_system = FINISHING-DEMO` sesuai prosedur database yang disetujui.
