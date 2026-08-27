# Chemical Dispensing Calator Concept v1.12

**Versi:** 1.12  
**Tanggal:** 27 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.11.md`  
**Fokus perubahan:** Nilai live loadcell pada P&ID

## Sumber nilai loadcell

Nilai aktual Tank 1 memakai canonical tag berikut untuk setiap dispensing:

```text
SMM.{ASSET_ID}.TANK_01.WEIGHT_PV
```

Unit engineering adalah `kg`. Nilai live dikirim melalui Live Value Ingestion API dan disimpan sebagai satu baris terbaru pada `tag_latest`; historian `telemetry_sample` tidak diwajibkan untuk tag ini.

## Tampilan P&ID

Teks statis `LC-101 · LIVE TAG READY` diganti binding aktual:

```text
LC-101 · {value} kg
```

Jika quality bukan `GOOD`, nilai terakhir tetap terlihat dengan label `STALE`, `BAD`, atau `NOT_CONNECTED`. Heartbeat controller tetap menjadi validasi komunikasi terpisah.

## Batas transaksi

Nilai live loadcell bukan pengganti hasil timbang final. Setelah proses selesai, berat aktual transaksi tetap ditulis ke `chemical_transaction.actual_kg` agar laporan konsumsi dan traceability tidak hilang.

Scope valve-only v1.10 dan status controller v1.11 tetap berlaku.

