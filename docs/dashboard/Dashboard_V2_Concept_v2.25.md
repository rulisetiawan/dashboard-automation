# Dashboard V2 Concept v2.25

**Versi:** 2.25
**Tanggal:** 1 September 2026
**Status:** Aktif
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.24.md`
**Fokus perubahan:** Penambahan Calator Depan 03

## Tampilan dashboard

- Daftar mesin Calator Area Depan bertambah menjadi tiga asset dan menampilkan `CL-DPN-03` sebagai `Calator Depan 03`.
- Asset baru tampil `OFFLINE` dan `NOT_CONNECTED` sampai data aktual diterima; dashboard tidak membuat status running atau nilai simulasi untuk asset yang belum dipetakan.
- Ringkasan plant menggunakan total 134 mesin proses dan 139 asset mesin termasuk lima dispensing.
- Detail `DSP-DPN-01` otomatis menyediakan tujuan route ketiga menuju `CL-DPN-03`.

## Validasi koneksi

Status koneksi `CL-DPN-03` mengikuti tag heartbeat `SMM.CL-DPN-03.COMMUNICATION.HEARTBEAT`. Tag proses hanya dipercaya ketika quality data baik dan heartbeat asset masih valid.
