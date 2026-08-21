# Chemical CSV Import v1.0

**Tanggal:** 21 Agustus 2026

**Status:** 15 file weighing log diimpor ke PostgreSQL lokal

## Hasil import

- Total CSV: 15 file.
- Total source row: 112.856.
- Baris berhasil dimasukkan: 112.856.
- Baris invalid: 0.
- Duplikasi source row: 0.
- Rentang sumber: 14 Maret 2026 sampai 21 Agustus 2026, waktu lokal WIB.
- Total row `chemical_transaction` setelah import: 112.857, termasuk satu test sample sebelumnya.

## Mapping sumber

| Nama sumber | Dispenser ID | Mode |
|---|---|---|
| `timbang_obat_belakang_1_auto/manual/emergency.csv` | `DSP-BLK-01` | Automatic / Manual / Emergency |
| `timbang_obat_belakang2_auto/manual/emergency.csv` | `DSP-BLK-02` | Automatic / Manual / Emergency |
| `timbang_obat_depan_auto/manual/emergency.csv` | `DSP-DPN-01` | Automatic / Manual / Emergency |
| `timbang_obat_timur1_auto/manual/emergency.csv` | `DSP-TMR-01` | Automatic / Manual / Emergency |
| `timbang_obat_timur2_auto/manual/emergency.csv` | `DSP-TMR-02` | Automatic / Manual / Emergency |

## Keputusan data

- Format tanggal sumber dibaca sebagai `DD/MM/YYYY HH:mm:ss.ffffff` dalam zona waktu WIB (`UTC+07:00`).
- `start_time` disimpan pada `started_at` dan `occurred_at`.
- `end_time` disimpan pada `ended_at`.
- `weight` disimpan tanpa perubahan pada `actual_kg`.
- Nilai weight `0` tetap dipertahankan karena merupakan data aktual sumber.
- `target_kg` disimpan `NULL` karena CSV tidak menyediakan target penimbangan.
- `calator_id` disimpan `NULL` karena CSV tidak menyediakan tujuan Calator.
- Baris emergency memakai `chemical_code = EMERGENCY`, `mode = Emergency`, dan raw state disimpan pada `raw_payload`.
- Nama dan code chemical dipertahankan dari sumber; perbedaan penamaan antarfile tidak digabung secara paksa.

## Perubahan schema

Migration `0007_chemical_csv_import.sql`:

- membuat `calator_id` dan `target_kg` nullable;
- menambahkan `source_system`, `source_file`, dan `source_row_id`;
- menambahkan `started_at` dan `ended_at`;
- menambahkan `raw_payload JSONB`;
- menambahkan unique index source row untuk import idempotent.

## Import ulang

```powershell
node --env-file=.env scripts/import-chemical-csv.mjs --directory="C:\path\ke\folder-csv"
node --env-file=.env scripts/import-chemical-csv.mjs --directory="C:\path\ke\folder-csv" --apply
```

Perintah pertama adalah dry-run. Perintah kedua melakukan insert. Uji kedua setelah import menghasilkan `inserted = 0` dan `skipped = 112856`, sehingga file yang sama tidak menggandakan data.
