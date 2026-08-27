# P&ID Live State Architecture v1.3

**Versi:** 1.3  
**Tanggal:** 27 Agustus 2026  
**Status:** Implemented  
**Baseline:** Melanjutkan `PID_Live_State_Architecture_v1.2.md`  
**Scope:** Binding nilai analog aktual pada SVG

## Binding nilai

`instrument_state` tetap menjadi projection tunggal untuk state diskrit dan nilai analog. Frontend mencocokkan pasangan `element_code` + `parameter_code` dengan atribut SVG:

```text
data-element-code="TANK_01"
data-pid-live-value="WEIGHT_PV"
```

Nilai menggunakan `value_number` dan `engineering_unit`. Quality efektif menentukan apakah teks dianggap aktual atau diberi label stale/error.

## Jalur realtime

Live Value Ingestion API melakukan UPSERT ke `tag_latest`, lalu menerbitkan `instrument:delta` hanya ke room asset aktif. Full snapshot tetap tersedia melalui Instrument State API saat halaman dibuka atau WebSocket reconnect.

Heartbeat, machine state, valve feedback, dan nilai analog tetap merupakan status yang berbeda. Angka loadcell tidak boleh dianggap valid hanya karena nilainya tersedia; quality dan heartbeat harus tetap terlihat.

