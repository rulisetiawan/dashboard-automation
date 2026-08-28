# Dashboard V2 Concept v2.8

**Versi:** 2.8  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.7.md`  
**Fokus perubahan:** Penegasan visual status pada area card

## Status summary

Setiap area card menampilkan empat summary status dengan warna semantik yang konsisten:

- `Run`: hijau;
- `Idle`: slate blue;
- `Warn`: amber;
- `Fault`: merah.

Status dengan jumlah lebih dari nol mendapat border penuh, garis aksen, dan bayangan ringan. Status bernilai nol tetap terlihat sebagai referensi tetapi memakai opacity lebih rendah.

## Status utama card

Area card memiliki garis atas dan tint sangat ringan berdasarkan prioritas kondisi:

1. Fault;
2. Warning;
3. Running;
4. Idle;
5. Offline bila tidak ada mesin pada empat status tersebut.

Perbaikan ini memastikan area dengan seluruh mesin idle ditampilkan sebagai `IDLE`, bukan `OFFLINE`.

## Konsistensi data

Perubahan hanya memengaruhi presentasi. Nilai status tetap berasal dari `asset_snapshot.machine_state`, WebSocket tetap memperbarui snapshot aktual, dan aturan drill-down area/mesin tidak berubah.
