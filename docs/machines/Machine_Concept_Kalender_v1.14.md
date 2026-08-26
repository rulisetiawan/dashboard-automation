# Machine Concept Kalender v1.14

**Versi:** 1.14  
**Tanggal:** 24 Agustus 2026  
**Status:** Aktif  
**Fokus perubahan:** Penyederhanaan fabric threading dan perbaikan collision P&ID

## Perbaikan fabric path

Fabric path Kalender diubah menjadi satu lintasan kontinu tanpa arah yang berulang:

1. fabric masuk melalui inlet roller;
2. turun menuju width measurement dan expander;
3. naik mengitari upper felt;
4. masuk langsung ke area nip dan mengitari lower felt;
5. keluar menuju cooling belt;
6. turun satu kali melalui dancing roller;
7. naik ke conveyor belt;
8. turun melalui chute menuju lipatan kain di atas plaiter table.

Kurva lama yang kembali ke area loadcell dihapus agar fabric line tidak terlihat kusut atau saling menimpa.

## Perbaikan posisi instrument

- Loadcell tidak lagi digambar sebagai roller tambahan di tengah fabric path.
- Loadcell Upper dan Lower menjadi instrument callout yang terhubung ke roll menggunakan signal line.
- Temperature Lower, Loadcell Lower, dan motor Lower dipisahkan pada area bawah heating zone.
- Lower steam branch dipindahkan ke sisi kanan roll agar tidak memotong fabric path pada area nip.
- Lebar fabric line dan outline dikurangi agar equipment serta label tetap terbaca.

## Element code

Seluruh `data-element-code` versi 1.13 dipertahankan. Perubahan hanya memengaruhi layout visual dan tidak mengubah kontrak tag atau binding `instrument_state`.
