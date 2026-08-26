# Dashboard V2 Concept v2.0

**Tanggal:** 22 Agustus 2026

**Status:** V2 development baseline

## Baseline

Dashboard V2.0 dimulai dari seluruh fitur final V1.63. Tidak ada fitur V1 yang dihapus pada baseline ini. Perubahan berikutnya akan dicatat sebagai seri V2 dan tidak akan mengubah paket presentasi V1.63.

## Pemisahan Versi

- Identitas UI menampilkan badge `V2.0`.
- Package application menggunakan semantic version `2.0.0`.
- Navigation preference, historian parameter preference, dan trend inspection state memakai namespace V2 agar tidak bertabrakan dengan V1.
- API `/api/v1` tetap dipertahankan sebagai kontrak backend yang kompatibel; versi dashboard tidak memaksa breaking change pada API.

## Aturan Pengembangan V2

1. Fitur baru hanya ditambahkan pada workspace V2.
2. V1.63 dipertahankan sebagai ZIP read-only untuk presentasi dan regresi.
3. Paket presentasi V2 dibuat ulang ketika milestone V2 disetujui.
4. Migrasi database V2 harus tetap backward-compatible kecuali dibuatkan prosedur migrasi eksplisit.

