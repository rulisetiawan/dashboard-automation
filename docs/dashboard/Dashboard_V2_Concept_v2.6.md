# Dashboard V2 Concept v2.6

**Versi:** 2.6  
**Tanggal:** 27 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.5.md`  
**Fokus perubahan:** Pemilihan production date dan shift pada performance summary

## Filter shift

Saat scope `Shift` dipilih, operator memilih:

- `Production date`;
- Shift A `07.00–15.00`;
- Shift B `15.00–23.00`;
- Shift C `23.00–07.00`.

Default mengikuti shift aktif dalam zona waktu `Asia/Jakarta`. Pilihan disimpan pada navigasi browser dan cache summary dipisahkan untuk setiap asset, tanggal produksi, serta kode shift.

## Shift malam

Shift C memakai tanggal saat shift dimulai. Contoh: data `28 Agustus 02.00 WIB` masuk Shift C dengan production date `27 Agustus`.

## Sumber data

Filter hanya menentukan range perhitungan. Runtime tetap berasal dari overlap `machine_state_event`, output dari process run/totalizer/aggregate, dan peak dari historian. Data sensor live, heartbeat, serta nilai loadcell latest-only tidak berubah.
