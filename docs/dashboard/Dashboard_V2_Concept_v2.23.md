# Dashboard V2 Concept v2.23

**Versi:** 2.23  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.22.md`  
**Fokus perubahan:** Feedback aktual mode AUTO/MANUAL Chemical Dispensing

## Tampilan

- Card setiap Chemical Dispensing unit menampilkan status controller dan control mode secara berdampingan.
- Header detail unit menampilkan control mode bersama status controller, machine state, dan waktu transaksi terakhir.
- `AUTO` memakai tone hijau, `MANUAL` memakai tone kuning, dan `UNKNOWN` memakai tone netral.

## Sumber dan validasi

- Sumber canonical adalah `SMM.{ASSET_ID}.MACHINE.AUTO_MODE_FB`.
- `1` atau `AUTO` berarti `AUTO`; `0` atau `MANUAL` berarti `MANUAL`.
- Feedback diskrit memakai freshness `ASSET_HEARTBEAT`, sehingga state terakhir tetap valid selama heartbeat asset sehat.
- Saat heartbeat terputus atau quality mode tidak `GOOD`, dashboard menampilkan `UNKNOWN` dan tidak mempertahankan label Auto/Manual sebagai data valid.

## Pemisahan konsep

Control mode menunjukkan posisi selector/controller mesin saat ini. Field `mode` pada chemical transaction menunjukkan cara transaksi tertentu diproses. Keduanya tidak saling menggantikan dan tidak boleh digunakan untuk menyimpulkan satu sama lain.
