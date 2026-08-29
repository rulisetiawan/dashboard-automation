# Section Parameter Dictionary v1.1

**Versi:** 1.1  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Section_Parameter_Dictionary_v1.0.md`

## Tambahan Chemical Dispensing

| Section | Parameter | Data type | Arti |
|---|---|---|---|
| `MACHINE` | `AUTO_MODE_FB` | bool/text | Feedback posisi selector controller: `1/AUTO` atau `0/MANUAL`. |

Contoh canonical tag:

```text
SMM.DSP-DPN-01.MACHINE.AUTO_MODE_FB
```

Parameter ini adalah live state tingkat mesin. Ia berbeda dari `CHEMICAL_REQUEST.mode`, yang mencatat mode pemrosesan satu transaksi.
