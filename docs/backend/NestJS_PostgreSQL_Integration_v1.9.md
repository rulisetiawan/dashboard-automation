# NestJS PostgreSQL Integration v1.9

**Tanggal:** 21 Agustus 2026

**Status:** Dynamic peak parameter selection

## Perubahan API

Endpoint performance summary menambahkan object:

```json
{
  "peak_metric": {
    "family": "speed",
    "title": "Peak Speed",
    "source": "snapshot_tag",
    "items": [
      {
        "tag_code": "SMM.CL-DPN-01.SQUEEZING_01.SPEED_PV",
        "signal_role": "SQUEEZING_01_SPEED_PV",
        "engineering_unit": "m/min",
        "peak_value": 20.4,
        "peak_at": "2026-08-21T07:12:00.000Z"
      }
    ]
  }
}
```

Angka pada contoh hanya menunjukkan bentuk kontrak.

## Aturan Pemilihan

1. Kandidat wajib merupakan tag aktif dengan role PV, unit, dan telemetry numerik pada scope.
2. Role yang cocok dengan key pada `asset_snapshot.values_json` mendapat prioritas.
3. Jika tidak ada exact match, backend memakai kandidat aktif yang memiliki historian.
4. Kandidat dikelompokkan berdasarkan family: temperature, speed, position, loadcell, level, flow, width, atau parameter umum.
5. Card hanya membandingkan item satu family dan engineering unit agar nilai berbeda satuan tidak dicampur.
