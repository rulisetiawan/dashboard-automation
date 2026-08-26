# Dashboard V2 Concept v2.3

**Versi:** 2.3  
**Tanggal:** 26 Agustus 2026  
**Status:** Aktif  
**Baseline:** Melanjutkan `Dashboard_V2_Concept_v2.2.md`  
**Fokus perubahan:** Visibilitas heartbeat dan status controller pada card asset

## Tujuan

User harus dapat memvalidasi bahwa data mesin atau dispensing masih berasal dari controller yang aktif sebelum membaca machine state, valve position, alarm, atau nilai proses.

## Tampilan koneksi

Status heartbeat ditampilkan pada:

- card mesin per area;
- hero detail mesin;
- direktori asset plant;
- card overview Chemical Dispensing;
- hero detail Chemical Dispensing;
- header P&ID Chemical Dispensing.

Card umum memakai `Connected` / `Disconnected`. Konteks yang secara khusus menjelaskan PLC/controller memakai `Controller Active` / `Controller Offline`. Detail kecil menampilkan umur heartbeat atau timeout.

## Aturan status

```text
heartbeat GOOD + aktif + age ≤ stale limit
→ connected / controller active

heartbeat hilang, BAD, tidak aktif, atau age > stale limit
→ disconnected / controller offline
```

Batas awal tetap 30 detik dan dibaca dari metadata heartbeat asset. Dashboard menghitung umur heartbeat setiap detik tanpa melakukan insert historian atau full-page render.

## Pemisahan makna

Connection state tidak menggantikan:

- machine operating state;
- posisi aktual valve;
- feedback quality;
- alarm/fault state;
- data freshness analog.

Contoh yang valid adalah controller aktif tetapi valve position error. Jika controller offline, posisi valve menjadi stale/unknown dan tidak langsung disebut position error.

## Konsistensi realtime

Event komunikasi memperbarui model dan indikator DOM secara langsung. Arsitektur interaction-safe rendering v2.2 tetap dipertahankan; heartbeat tidak mengganti seluruh `page-content` dan tidak mengganggu pointer, filter, dropdown, atau posisi scroll.

