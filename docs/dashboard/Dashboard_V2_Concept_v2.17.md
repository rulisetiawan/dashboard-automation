# Dashboard V2 Concept v2.17

**Versi:** 2.17  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.16.md`  
**Fokus perubahan:** Stabilitas interaksi Plant Overview saat pembaruan realtime

## Stabilitas scroll

- Posisi scroll dipulihkan pada siklus render yang sama, sebelum chart diinisialisasi.
- Tidak ada lagi koreksi scroll tertunda pada `requestAnimationFrame` yang dapat melawan input scroll pengguna.
- Render realtime menunggu 1,2 detik setelah interaksi terakhir, termasuk wheel, scroll, touch, pointer, keyboard, dan focus control.

## Production Output by Batch

- Kontrol Effective, Actual, Estimated, process, production date, dan shift menggunakan event delegation pada document.
- Event tetap berfungsi walaupun isi Overview diperbarui oleh realtime.
- Setiap request memiliki request ID; hanya response request terbaru yang boleh memperbarui tampilan.
- Perubahan filter dapat memulai request terbaru tanpa tertahan oleh request lama yang masih berjalan.
- Error request disimpan untuk filter aktif sehingga API yang gagal tidak membentuk loop render otomatis; refresh realtime atau perubahan filter tetap dapat mencoba ulang.

## Perilaku realtime

- Pembaruan realtime tidak dibuang, tetapi ditahan selama pengguna aktif berinteraksi.
- Setelah periode idle tercapai, data terbaru dirender dengan posisi viewport yang tetap dipertahankan.
