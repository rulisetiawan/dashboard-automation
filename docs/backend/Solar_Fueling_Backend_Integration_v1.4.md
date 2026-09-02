# Solar Fueling Backend Integration v1.4

**Status:** Aktif
**Tanggal:** 2 September 2026
**Baseline:** Melanjutkan `Solar_Fueling_Backend_Integration_v1.3.md`

## Field summary tambahan

Endpoint `GET /api/v1/solar/overview` menambahkan:

- `pending_qr_count`;
- `cancelled_qr_count`;
- `not_match_count`;
- `failed_review_count`.

`completed_transactions` tetap menjadi jumlah `COMPLETED/PARTIAL`.

## Konsistensi PostgreSQL dan D1

PostgreSQL memakai aggregate `FILTER`, sedangkan D1 memakai conditional `SUM(CASE ...)`. Keduanya membaca seluruh status pada event-time range yang dipilih. Sum metered/requested dan fulfillment tetap dibatasi pada transaksi final agar Pending atau Cancelled tidak memengaruhi konsumsi.
