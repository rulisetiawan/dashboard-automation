# Dashboard V1 Concept v1.52

**Tanggal:** 21 Agustus 2026

**Status:** Alarm rule configuration

## Ditambahkan

- Form konfigurasi alarm pada halaman Alarms & Events.
- Pemilihan asset dan tag aktif langsung dari master PostgreSQL.
- Rule `HIGH`, `HIGH-HIGH`, `LOW`, dan `LOW-LOW`.
- Konfigurasi threshold, hysteresis, activation delay, severity, message, recommendation, serta status enabled.
- Tabel rule yang memperlihatkan engine state `NORMAL`, `PENDING`, atau `ACTIVE` dan nilai evaluasi terakhir.
- Edit serta enable/disable rule tanpa mengubah kode frontend.
- Tombol acknowledgement pada alarm aktif.
- Popup realtime ketika backend mengaktifkan alarm baru.

## Batas Tanggung Jawab

Frontend hanya menjadi konfigurator dan viewer. Evaluasi alarm tetap berjalan pada NestJS meskipun browser ditutup. Safety trip, emergency stop, dan interlock mesin tetap berada pada PLC.

## Catatan Otorisasi

Versi lokal memakai identitas `Dashboard Engineer` dan `Dashboard Operator` pada request API untuk audit. Sebelum produksi, endpoint perubahan rule dan acknowledgement wajib dilindungi authentication serta role-based authorization.
