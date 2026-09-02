# Solar Fueling & Inventory Reconciliation v1.0

**Status:** Aktif
**Tanggal:** 2 September 2026
**Dashboard:** V2.27

## Tujuan

Modul ini memberi satu sumber informasi untuk distribusi solar berbasis QR, volume aktual flow meter, pembanding totalizer mesin, konsumsi per user, dan kesesuaian stok sistem terhadap pengukuran fisik.

## Arti data sumber

| Field sumber | Arti bisnis | Field canonical |
|---|---|---|
| `code` | Nomor QR terdaftar yang dimasukkan ke mesin | `qr_code` |
| `jumlah` | Volume yang diminta dalam liter | `requested_liters` |
| `actual_solar` | Volume aktual yang dibaca flow meter | `metered_liters` |
| `calculated_volume` | Volume hasil kalkulasi sistem sumber | `calculated_liters` |
| `total_solar_IN` | Totalizer kumulatif dari mesin | `machine_totalizer_liters` |
| `date_created` | Waktu QR dibuat | `qr_created_at` |
| `date_activated` | Waktu pengisian selesai | `fueling_completed_at` |
| `nama_pembuat` | User pembuat QR | `qr_created_by` |
| `nama_pemesan` | User pemesan solar | `requester_name` |
| `process_by` | Operator yang memproses | `processed_by` |
| `keterangan` | Catatan transaksi | `notes` |

Field `process_type`, `process_category`, dan `process_stock` tidak dipakai sebagai label dashboard karena artinya tidak konsisten. Model baru menggunakan `operation_type`, `movement_direction`, `execution_mode`, dan `transaction_status` dengan nilai yang eksplisit.

## Tampilan

1. **Overview** — stok sistem, konsumsi aktual, jumlah fueling, metering match, stock accuracy, exception, trend, dan peringkat requester.
2. **Transaction Log** — pencarian QR/user, status, rentang waktu, pagination, dan pembanding requested–metered–totalizer.
3. **Stock Movement** — receipt, adjustment, dan transfer. Fueling OUT berasal langsung dari transaksi flow meter agar tidak terjadi pencatatan ganda.
4. **Stock Opname** — input stok fisik, perhitungan variance/accuracy, serta workflow DRAFT → SUBMITTED → VERIFIED → POSTED.

## Rekonsiliasi

- Dispensing variance = `metered_liters - requested_liters`.
- Backend consumption = `SUM(metered_liters)` untuk transaksi COMPLETED/PARTIAL.
- Machine consumption = selisih totalizer berurutan; penurunan nilai ditandai sebagai reset.
- System stock = opening stock + movement IN − movement OUT − completed metered fueling.
- Stock variance = physical stock − system stock.
- Accuracy = `100 - ABS(variance) / system_stock × 100`. Jika system stock nol, accuracy ditampilkan `N/A`.

## Aturan data

- Tidak ada dummy transaction atau dummy stock opname.
- Integrasi sumber bersifat idempotent menggunakan pasangan `source_system + source_id`.
- Detail kendaraan/equipment belum ditampilkan sebagai fakta sampai field `consumer_id` atau `consumer_label` dikirim sumber.
- Semua tindakan stock movement dan stock opname menyimpan identitas user dashboard.
