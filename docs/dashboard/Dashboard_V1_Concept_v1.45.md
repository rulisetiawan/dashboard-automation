# Dashboard V1 Concept v1.45

**Tanggal:** 21 Agustus 2026

**Status:** Tracking batch Kalender dari process run ke historian

## Perubahan

- Tabel Process run history menampilkan start time dan end time.
- Setiap process run memiliki tombol `Track batch`.
- Tombol tracking mengatur custom historian range sesuai boundary batch.
- Panel historian menampilkan nomor batch yang sedang ditrack.
- Setelah tracking dipilih, dashboard membuka panel historian dengan pasangan trend PV/SV pada interval batch.

## Contoh Aktif

| Field | Nilai |
|---|---|
| Batch | `BATCH-KL5-20260821-001` |
| Asset | `KL-DPN-05` |
| Area | Kalender Depan |
| Start | 21 Agustus 2026, 10.00 WIB |
| End | 21 Agustus 2026, 12.00 WIB |
| Status | `COMPLETED` |
| Output | `1.150 m` |

## Batas Perubahan

- Batch contoh diberi source `LOCAL-BATCH-TRACKING` agar dapat dibedakan dari data PLC aktual.
- Perhitungan contoh tidak menggantikan aturan produksi final atau integrasi QC.
