# Konsep Dashboard V1

## Versi 1.3 — Plant Management Question Center

**Tanggal:** 15 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V1_Concept_v1.2.md`

## 1. Tujuan Pembaruan

Plant Overview harus menjawab pertanyaan management secara langsung tanpa mengharuskan pengguna menggabungkan beberapa grafik atau menghitung data manual.

## 2. Pertanyaan Utama

| Pertanyaan | Scope | Jawaban dashboard |
|---|---|---|
| Mesin mana saja yang running? | Live Now | Jumlah operating, jumlah normal/warning, dan tabel seluruh mesin aktif |
| Mesin stop, maintenance, atau bermasalah yang mana? | Live Now | Total awareness, breakdown kondisi, dan tabel mesin terkait |
| Berapa total output produksi? | Selected Range | Total good fabric, average interval, dan peak interval |
| Bagaimana penggunaan utilitas sekarang? | Live Now | Electrical demand, water flow, steam production/header, dan thermal oil supply |
| Berapa total konsumsi utilitas? | Selected Range | Electrical energy, water, steam, dan thermal oil dalam satu periode yang sama |
| Berapa batch yang sedang proses? | Live Now | Jumlah batch number unik pada active process run |
| Berapa batch yang sudah selesai? | Selected Range | Jumlah completion berdasarkan historian batch |

## 3. Machine Status Directory

Plant Overview memiliki dua tabel scrollable:

1. Mesin Running Sekarang, termasuk mesin yang masih operating tetapi memiliki warning.
2. Stop / Maintenance / Problem, diurutkan mulai dari Fault, Problem, Maintenance, lalu Stopped.

Setiap baris menampilkan machine ID, process, area/lane, batch number, dan condition. Baris mesin dapat dibuka langsung menuju halaman detail mesin.

## 4. Pemisahan Live dan Historical

- Machine state, active batch, dan utility operating condition adalah Live Now.
- Production output, completed batch, serta total utility consumption mengikuti Selected Range.
- Pemilih 1H, 8H, 24H, dan 7D tersedia langsung pada Management Question Center.
- Mesin running dengan warning boleh muncul pada daftar running sekaligus daftar problem. Hal ini merupakan overlap yang disengaja karena mesin tetap menghasilkan output tetapi membutuhkan perhatian.
- Total utility tidak dijumlahkan menjadi satu angka karena electrical, water, steam, dan thermal oil memiliki satuan berbeda.

## 5. Kebutuhan Integrasi

- Maintenance harus berasal dari work order atau maintenance state aktual, bukan inferensi idle.
- Batch aktif harus menggunakan unique batch identity dan hubungan process run lintas mesin.
- Completed batch harus menggunakan event completion yang tervalidasi historian/MES.
- Utility live dan total harus memiliki timestamp, quality, serta coverage meter.
- Good output harus mengikuti hasil produksi yang lolos definisi quality yang disepakati.

## 6. Batasan V1.3

- Seluruh nilai masih simulated.
- Klasifikasi Maintenance pada demo diturunkan dari mesin idle dan belum berasal dari CMMS.
- Completed batch dan total steam/thermal oil belum berasal dari historian aktual.
