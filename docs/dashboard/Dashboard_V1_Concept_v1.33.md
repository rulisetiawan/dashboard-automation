# Dashboard V1 Concept v1.33

**Tanggal:** 21 Agustus 2026  
**Status:** Seluruh tag aktif tersedia pada Historical Trends

## Perubahan

- Dropdown Sensor Trend mengambil seluruh tag aktif milik asset dari `tag_definition`.
- Batas delapan tag pada versi sebelumnya dihapus.
- Aggregate historian hanya diminta ketika sebuah tag dipilih agar jumlah query tidak mengikuti jumlah seluruh tag mesin.
- Tag numerik menampilkan grafik average, minimum, maksimum, dan last value.
- Tag text/digital atau tag yang belum mempunyai sample numerik tetap terlihat, tetapi menampilkan status belum ada data trend numerik.
- Styling Historical Trends diselaraskan dengan card, panel header, segmented range, select, badge, spacing, dan warna dashboard utama.

## Alur

```text
Buka detail asset
  -> baca seluruh tag aktif asset
  -> tampilkan Tag Selector
  -> operator memilih tag
  -> query aggregate hanya untuk tag terpilih + time range
  -> render trend aktual
```

Pendekatan on-demand ini diperlukan agar Jetflow dengan jumlah section, winch, motor, sensor, dan step yang besar tetap ringan.
