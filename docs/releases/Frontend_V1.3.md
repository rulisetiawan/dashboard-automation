# Frontend Dashboard V1.3

**Tanggal:** 14 Agustus 2026  
**Status:** Selesai  
**Fokus:** Remote display placeholder per mesin

## Ringkasan

Frontend V1.3 menambahkan reserved viewport Remote Display pada setiap halaman detail mesin. Area ini akan digunakan untuk menampilkan remote HMI atau display mesin melalui integrasi IP pada tahap berikutnya.

## Cakupan

Remote Display tersedia pada detail:

- Jetflow.
- Calator.
- Dryer.
- Kalender.
- Dispensing Calator.

## Kondisi Saat Ini

- Viewport masih berupa kotak kosong.
- Tidak ada koneksi ke IP mesin.
- Tidak ada iframe, VNC, RDP, WebRTC, atau remote-control protocol.
- Tidak ada credential yang disimpan pada frontend.
- Status ditampilkan sebagai `IP not configured`.

## Prinsip Integrasi Berikutnya

- Konfigurasi endpoint disimpan per Asset ID, bukan hard-coded di browser.
- Credential dan session token tidak boleh dikirim sebagai plain text.
- Remote display harus melewati gateway atau reverse proxy OT yang disetujui.
- Akses awal sebaiknya view-only.
- Remote control memerlukan role, approval, audit log, timeout, dan safety review terpisah.
- Kegagalan remote display tidak boleh memengaruhi PLC, HMI lokal, atau fungsi dashboard monitoring.

## Informasi yang Masih Diperlukan

- Jenis display atau HMI pada setiap mesin.
- Vendor dan protocol remote-access yang didukung.
- IP scheme serta network zone.
- Ketersediaan web display, VNC, RDP, atau gateway converter.
- Authentication dan authorization requirement.
- Kebijakan cybersecurity OT dan remote-control approval.
