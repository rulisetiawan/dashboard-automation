# Machine Concept Finishing Line v1.0

**Tanggal:** 19 September 2026  
**Status:** Baseline commissioning

## Tujuan

Menambahkan monitoring operasional untuk 21 mesin pada area Finishing sebagai empat proses independen: Continuous, Inspecting, Finishing, dan Setting Dongnam. Seluruh halaman memakai PostgreSQL sebagai sumber aktual dan menampilkan `NO DATA` sampai tag lapangan tersedia.

## Continuous — 4 mesin

Fokus utama adalah mengetahui konsumsi obat per mesin dan per periode. Tag awal mencakup total konsumsi chemical, konsumsi Chemical 01–04, speed, runtime, output, temperature Zone 01–04, serta pressure Roll Padder 01–03.

Konsumsi historis harus dihitung sebagai delta totalizer pada awal dan akhir rentang. Jika sumber chemical menggunakan flow rate, backend perlu mengintegrasikan nilai terhadap waktu sebelum disajikan sebagai kg konsumsi.

## Inspecting — 12 mesin

Mesin membuka kain dari roll untuk inspeksi. Parameter awal:

- line speed, runtime, dan output panjang kain;
- defect count dan total defect length;
- quality grade;
- status koneksi kamera dan status inspeksi otomatis;
- defect type dan posisi defect dalam meter.

Integrasi kamera masih berstatus `PLANNED`. Event kamera nantinya harus menyimpan referensi asset, batch/roll, posisi meter, jenis cacat, confidence, timestamp, dan pointer image tanpa menyimpan file besar di telemetry.

## Finishing — 1 mesin

Parameter baseline adalah line speed, runtime, output, dua temperature zone, dan process pressure. Dictionary ini merupakan baseline commissioning dan dapat diperluas setelah diagram mesin serta daftar I/O divalidasi.

## Setting Dongnam — 4 mesin

Fokus monitoring adalah line speed, runtime, output, temperature Zone 01–04, fabric width, dan overfeed. Output memakai totalizer meter bila tersedia; estimate dari speed historian hanya menjadi fallback.

## Koneksi dan kualitas data

- Setiap mesin memiliki `COMM_HEARTBEAT` dengan batas stale 30 detik.
- Tidak ada heartbeat valid berarti mesin ditampilkan disconnected/offline.
- Tag proses memakai freshness berdasarkan timestamp tag.
- Data bad/stale tetap tersimpan di historian, tetapi tidak dipakai sebagai nilai aktual tervalidasi.
- Asset baru mulai dari `PENDING_MAPPING` dan tidak diberi nilai dummy.
