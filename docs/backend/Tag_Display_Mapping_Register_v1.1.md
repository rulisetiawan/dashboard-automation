# Tag Display Mapping Register v1.1

**Versi:** 1.1  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Tag_Display_Mapping_Register_v1.0.md`

## Chemical Dispensing control mode

| Tampilan | Canonical tag | Pengolahan |
|---|---|---|
| Unit overview control mode | `.MACHINE.AUTO_MODE_FB` | `1/AUTO → AUTO`, `0/MANUAL → MANUAL`; selain quality `GOOD` menjadi `UNKNOWN`. |
| Detail unit control mode | `.MACHINE.AUTO_MODE_FB` | Projection yang sama, diperbarui melalui `asset:communication` dan `instrument:delta`. |

Control mode tidak boleh diisi dari `chemical_transaction.mode`. Transaction mode tetap ditampilkan hanya dalam konteks log dan agregasi transaksi.
