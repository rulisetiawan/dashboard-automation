# Chemical Dispensing Calator Concept v1.8

**Versi:** 1.8  
**Tanggal:** 24 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Live valve state pada P&ID dispensing

## Perubahan

- Inlet valve, transfer valve, dan route valve dapat menerima status dari view `instrument_state`.
- Binding memakai canonical `element_code` yang sama dengan atribut SVG `data-element-code`.
- Initial state dimuat melalui REST dan perubahan berikutnya diterima melalui WebSocket asset room.
- Update hanya mengganti class visual elemen terkait sehingga P&ID tidak berkedip dan posisi scroll tidak berubah.

Contoh: `SMM.DSP-DPN-01.INLET_VALVE_01.OPEN_FB` mengontrol elemen `INLET_VALVE_01` pada SVG.
