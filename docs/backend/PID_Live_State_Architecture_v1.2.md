# P&ID Live State Architecture v1.2

**Versi:** 1.2  
**Tanggal:** 26 Agustus 2026  
**Status:** Implemented  
**Baseline:** Melanjutkan `PID_Live_State_Architecture_v1.1.md`  
**Scope:** Distribusi status heartbeat ke card asset dan indikator controller

## Keputusan utama

Model satu heartbeat per asset dari v1.1 tetap dipertahankan. Heartbeat tidak dibuat per valve, motor, atau instrument. Perubahan v1.2 memperluas visibilitas komunikasi agar status controller dapat dilihat sebelum user mempercayai nilai device.

## Projection API asset

Response asset dan snapshot menyertakan:

```text
connected
connectionStatus
heartbeatTagCode
heartbeatValue
heartbeatStaleAfterSeconds
heartbeatSourceTs
```

`connected` berasal dari `asset_communication_state.online`, bukan lagi hanya dari flag `asset_snapshot.connected`.

## Distribusi WebSocket

WebSocket membagi update menjadi dua jalur:

1. `asset:communication` dikirim ke dashboard ketika heartbeat asset diperbarui agar card dapat memperbarui umur heartbeat dan status controller tanpa full-page render.
2. `instrument:delta` tetap room-scoped ke `asset:{assetId}`. Full state instrument hanya dikirim ulang ketika kualitas komunikasi berubah, misalnya `GOOD → STALE` atau `STALE → GOOD`.

Dengan pemisahan ini, card seluruh plant tetap mengetahui connection health, sedangkan payload instrument rinci hanya diterima untuk asset yang sedang dibuka.

## Aturan tampilan

- Card mesin umum memakai label `Connected` / `Disconnected`.
- Card controller pada Chemical Dispensing dan direktori asset memakai `Controller Active` / `Controller Offline`.
- Detail menampilkan umur heartbeat atau timeout 30 detik.
- Machine state, valve position, alarm, dan connection state tetap menjadi status terpisah.
- Tidak adanya heartbeat menghasilkan `NOT_CONNECTED`, bukan `POSITION_ERROR`.

## Validasi data device

Status controller aktif hanya memvalidasi jalur komunikasi asset. Validitas akhir device tetap memakai `effective_quality`:

- feedback diskrit mewarisi asset heartbeat;
- analog tetap diperiksa dengan timestamp tag sendiri;
- fault feedback tetap memiliki prioritas visual saat heartbeat sehat;
- seluruh device menjadi stale/neutral ketika heartbeat asset tidak sehat.

