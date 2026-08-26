# Chemical Dispensing Calator Concept v1.11

**Versi:** 1.11  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.10.md`  
**Fokus perubahan:** Status koneksi controller pada seluruh unit dispensing

## Keputusan koneksi

Setiap dispensing tetap memiliki satu heartbeat pada level asset:

```text
SMM.{ASSET_ID}.COMMUNICATION.HEARTBEAT
```

Heartbeat ini membuktikan bahwa controller/PLC, edge collector, jaringan, dan jalur PostgreSQL untuk unit tersebut masih aktif. Valve tidak memiliki heartbeat individual. Seluruh `OPEN_FB` dan `FAULT_FB` pada unit yang sama mewarisi validitas heartbeat asset.

## Tampilan dashboard

Status controller wajib ditampilkan pada:

1. card setiap unit pada overview Chemical Dispensing;
2. header detail unit;
3. header P&ID Chemical Dispensing;
4. direktori asset plant.

Label operasional:

| Kondisi heartbeat | Label | Makna |
|---|---|---|
| `GOOD`, bernilai aktif, umur data ≤30 detik | `Controller Active` | Jalur komunikasi unit dapat dipercaya |
| Belum pernah diterima atau bernilai tidak aktif | `Controller Offline` | Controller/jalur komunikasi tidak tersedia |
| Umur heartbeat >30 detik | `Controller Offline` + timeout | Data terakhir sudah stale |
| Quality `BAD` | `Controller Offline` | Payload diterima tetapi tidak dapat dipercaya |

Indikator selalu menyertakan teks dan umur heartbeat; warna bukan satu-satunya pembeda.

## Dampak pada valve

- Controller aktif dan feedback `GOOD`: valve boleh tampil `OPEN`, `CLOSED`, atau `FAULT`.
- Controller offline/stale: seluruh valve unit menjadi neutral/stale walaupun posisi terakhir masih tersimpan.
- Posisi terakhir boleh dipakai sebagai last known state, tetapi tidak boleh ditampilkan sebagai posisi live yang tervalidasi.
- Setelah reconnect, Node-RED mengirim full-state snapshot seluruh valve agar posisi aktual terselaraskan kembali.

## Scope yang dipertahankan

Keputusan valve-only v1.10 tetap berlaku. Penambahan status controller tidak mengaktifkan kembali motor tag, motor equipment master, atau motor diagnostic dispensing.

