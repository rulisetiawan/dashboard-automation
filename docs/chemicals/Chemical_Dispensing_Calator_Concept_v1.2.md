# Chemical Dispensing Calator Concept

## Versi 1.2 — Request, Weighing, dan Transaction Traceability

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Chemical_Dispensing_Transfer_Concept_v1.1.md`

## Posisi Proses

Konsep ini berlaku khusus untuk `Chemical Dispensing Calator`. Proses ini berbeda dari Dye Kitchen Jetflow yang akan menjadi domain dispensing tersendiri pada pengembangan berikutnya.

## Alur Transaksi

1. Request chemical dibuat atau dimasukkan melalui request code.
2. Sistem membaca chemical variant dan target quantity dari request.
3. Dispensing melakukan penimbangan satu atau beberapa chemical sampai seluruh kebutuhan terpenuhi.
4. Hasil timbang dicatat sebagai actual quantity.
5. Transaksi ditandai Completed, Weighing, Hold, atau exception lain dan dikaitkan ke Calator tujuan.

## Dashboard Detail

Detail mesin menggunakan log transaksi tabel, bukan Batch Historian atau trend SV/PV. Filter tersedia untuk:

- Time range: 8H, 24H, atau 7D.
- Chemical variant.
- Dispensing type: Manual atau Automatic.
- Status transaksi.

| Kolom Log | Makna |
|---|---|
| Time | Waktu transaksi/event penimbangan. |
| Request Code | Kode permintaan traceable. |
| Calator | Mesin tujuan. |
| Chemical Variant | Code dan nama chemical yang ditimbang. |
| Target / Actual | Kebutuhan request dan hasil timbang. |
| Type | Manual atau Automatic. |
| Weighing Process | Tahap timbang, misalnya `Weighing 2 / 3`. |
| Status | Completed, Weighing, atau Hold. |
| Operator / Source | Operator manual atau sumber automatic PLC. |

## Di Luar Scope

- Trend batch SV/PV dan abnormality log mesin proses tidak ditampilkan pada Chemical Dispensing Calator.
- Dye Kitchen Jetflow belum digabungkan ke halaman ini karena flow, recipe, equipment, dan traceability-nya berbeda.

## Batasan V1.2

- Request, target, actual weight, operator, dan status masih simulated.
- Integrasi berikutnya membutuhkan request source, scale controller, dispenser PLC, master chemical, dan acknowledgement workflow.
