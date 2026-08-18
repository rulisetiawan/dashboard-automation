# Machine Concept Calator v1.5

**Tanggal:** 18 Agustus 2026  
**Status:** Binding snapshot aktual pada detail mesin

## Mapping detail Calator

Card detail Calator membaca `asset_snapshot.values_json`:

| Card | Key snapshot |
|---|---|
| Overfeed Out Avg | `overfeed_out_speed_pv` |
| Dancing Roller | `dancer_position_pv` |
| Output Current | `output_total_m` |
| Water consumption | `water_consumption_m3` |
| Feeding | `feeding_speed_pv` |
| Critical Process speed | masing-masing `{parameter}_pv` dan `{parameter}_sv` |

Chemical Usage, route, dan transfer status membaca `chemical_transaction` berdasarkan `calator_id`. Parameter tanpa tag/database tampil sebagai `—` / `No data`; tidak memakai nilai hard-code.
