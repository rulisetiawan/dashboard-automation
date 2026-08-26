# Machine Concept Kalender v1.15

**Versi:** 1.15  
**Tanggal:** 24 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Prioritas posisi P&ID dan persistent minimize control

## Posisi halaman

P&ID Kalender ditempatkan tepat setelah header identitas mesin. Urutan awal detail mesin menjadi:

1. breadcrumb dan page header;
2. identitas, status, batch, progress, dan active alarm mesin;
3. P&ID Kalender;
4. performance summary;
5. live sensor measurements;
6. batch tracking, historian, equipment, dan analisis lanjutan.

Dengan urutan ini operator dapat melihat gambaran proses sebelum membaca card summary dan detail data.

## Minimize dan expand

Header P&ID memiliki tombol **Minimize P&ID** dan **Expand P&ID**.

- Toggle hanya mengubah container P&ID, bukan me-render ulang seluruh halaman.
- Posisi scroll tidak berubah ketika tombol ditekan.
- Saat minimized, canvas, legend, deskripsi, dan footer disembunyikan; identitas P&ID serta tombol expand tetap terlihat.
- Kondisi minimized disimpan pada local browser preference.
- Data refresh atau pembukaan ulang halaman mempertahankan pilihan terakhir pengguna.

## Kontrak data

Perubahan posisi dan visibility tidak mengubah SVG, `data-element-code`, tag, REST API, WebSocket, maupun kontrak `instrument_state`.
