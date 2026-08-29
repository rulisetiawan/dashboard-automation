# Live Value Ingestion API v1.1

**Versi:** 1.1  
**Tanggal:** 29 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Live_Value_Ingestion_API_v1.0.md`  
**Fokus perubahan:** Payload feedback Auto/Manual Chemical Dispensing

## Tag

```text
SMM.{ASSET_ID}.MACHINE.AUTO_MODE_FB
```

Nilai yang direkomendasikan adalah `value_number: 1` untuk Auto dan `value_number: 0` untuk Manual. `value_text: "AUTO"` atau `value_text: "MANUAL"` juga diterima sebagai alternatif, tetapi satu item tidak boleh mengirim keduanya.

## Contoh

```json
{
  "gateway_id": "NODERED-DSP-01",
  "source_ts": "2026-08-29T07:05:00.000Z",
  "values": [
    {
      "asset_id": "DSP-DPN-01",
      "tag_code": "SMM.DSP-DPN-01.MACHINE.AUTO_MODE_FB",
      "value_number": 1,
      "quality": "GOOD",
      "message_id": "683b552a-c4d2-4e29-a60a-5bb27e784c99"
    }
  ]
}
```

Kirim ke `POST /api/v1/ingestion/live-values` dengan `X-API-Key` yang sama seperti live loadcell. Tag ini latest-only pada route tersebut dan diperbarui realtime ke dashboard.
