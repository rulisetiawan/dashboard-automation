# Frontend Dashboard V1.0

**Tanggal:** 14 Agustus 2026  
**Status:** Prototype frontend selesai  
**Mode:** Read-only dengan simulated data  

## Fitur

- Plant Overview dan textile process flow.
- Jetflow monitoring dengan dynamic winch 2–8.
- Calator Standard dan Bianco multi-speed monitoring.
- Dryer multi-chamber temperature heatmap.
- Kalender upper-lower balance, sensor, motor, dan quality context.
- Electrical, water, steam, dan thermal oil utility monitoring.
- Chemical dispensing, pipe route, dan tujuh varian usage.
- Alarm acknowledgement dan event sequence.
- Historical Trend Explorer.
- Data Health Center.
- Responsive desktop, tablet, dan mobile layout.
- Simulasi nilai real-time pada frontend.

## Interaksi

- Navigasi antarmodul tanpa reload halaman.
- Pemilihan machine.
- Perubahan rentang trend.
- Alarm acknowledgement.
- Alarm search dan severity filter.
- Drill-down dari process flow.
- Live value simulation.

## Batasan

- Data masih berupa simulated operational data.
- Belum terhubung ke PLC, gateway, historian, database, atau API.
- Tidak ada write-back atau machine control.
- Authentication dan role enforcement belum diaktifkan.
- Formula KPI dan alarm limit belum menggunakan data engineering aktual.
- Output reference serta unit beberapa sensor masih menunggu validasi lapangan.

## File Frontend

- `index.html` — application shell.
- `styles.css` — hybrid-light industrial design system.
- `app.js` — data model demo, page rendering, interaction, chart, dan live simulation.

## Tahap Berikutnya

1. Menentukan mesin pilot.
2. Mengumpulkan existing tag list.
3. Menetapkan asset dan tag naming.
4. Menghubungkan sumber data read-only.
5. Mengganti simulated data dengan API atau historian.
6. Memvalidasi nilai dashboard terhadap HMI dan instrument aktual.

