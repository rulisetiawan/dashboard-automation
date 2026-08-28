# Dashboard V2 Concept v2.19

**Versi:** 2.19  
**Tanggal:** 28 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.18.md`  
**Fokus perubahan:** Login eksklusif dan session pengguna

## Login experience

- Login menjadi gerbang awal sebelum dashboard dan koneksi realtime dijalankan.
- Identitas utama menonjolkan `Digital Automation Dashboard` dan `Digital Automation Department`.
- Tagline resmi pada hero adalah `Smart Manufacturing System · PT SMM`.
- Visual memakai dark industrial navy, grid teknis halus, cyan glow, dan panel login terang yang tetap konsisten dengan tema dashboard.
- Form mendukung username/email, password visibility, penyimpanan username lokal opsional, status error, dan loading state.

## Authenticated session

- Setelah login, nama, inisial, department, dan role pengguna tampil pada header.
- Menu profil menyediakan detail session dan tombol sign out.
- Dashboard, pengambilan data, dan WebSocket baru dimulai setelah `GET /api/v1/auth/session` berhasil.
- Session yang kedaluwarsa mengembalikan pengguna ke login tanpa membuka data dashboard.

## Responsive behavior

- Desktop memakai split hero dan login panel.
- Tablet mengubah layout menjadi hero di atas dan form di bawah.
- Mobile memakai full-height login surface tanpa border luar.

