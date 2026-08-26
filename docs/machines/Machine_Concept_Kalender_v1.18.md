# Machine Concept Kalender v1.18

**Versi:** 1.18  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Penyederhanaan P&ID dan koreksi Expander–Upper/Lower

## Perubahan tampilan

- P&ID dipisahkan menjadi gambar alur proses dan status strip titik monitoring.
- Simbol instrument yang sebelumnya bertabrakan dengan jalur kain dipindahkan ke status strip.
- Area selain Expander–Upper/Lower dipertahankan.

## Koreksi Expander–Upper/Lower

- Tiga roller expander disusun pada satu sumbu diagonal dan diberi fungsi `OPEN WIDTH & ALIGNMENT`.
- Roller tanpa fungsi yang jelas di dalam frame upper/lower dihapus.
- Hanya `ENTRY GUIDE` dan `EXIT GUIDE` yang ditampilkan sebagai guide roller proses.
- Upper felt ditempatkan di atas-kiri dan lower felt di bawah-kanan mengikuti susunan referensi mesin.
- Jalur kain masuk dari expander, mengelilingi upper felt, turun mengelilingi lower felt, kemudian keluar melalui exit guide menuju cooling belt.
- Posisi pengukuran loadcell ditandai sebagai bearing point `LC-U` dan `LC-L`, bukan digambar sebagai roller proses tambahan.

Seluruh element code live tetap dipertahankan sehingga perubahan SVG tidak mengubah integrasi `instrument_state` dan WebSocket.
