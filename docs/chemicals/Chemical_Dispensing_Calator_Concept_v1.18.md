# Chemical Dispensing Calator Concept v1.18

**Versi:** 1.18
**Tanggal:** 1 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Chemical_Dispensing_Calator_Concept_v1.17.md`
**Fokus perubahan:** Route Calator ketiga di Area Depan

`DSP-DPN-01` melayani tiga destination Calator: `CL-DPN-01`, `CL-DPN-02`, dan `CL-DPN-03`. Live Process Schematic membentuk pilihan destination dari asset Calator aktif di Area Depan sehingga route ketiga tampil otomatis setelah registrasi master asset.

Feedback route ketiga menggunakan:

```text
SMM.DSP-DPN-01.ROUTE_CL_03.OPEN_FB
SMM.DSP-DPN-01.ROUTE_CL_03.FAULT_FB
```

Route baru tidak boleh dianggap terbuka hanya karena destination terdaftar. Visual route mengikuti feedback aktual dan validitas heartbeat `DSP-DPN-01`; jika belum ada data, statusnya tetap tidak terkonfirmasi.
