# Dashboard V1 Concept v1.55

**Tanggal:** 22 Agustus 2026

**Status:** Header-anchored alarm notification panel

## Diubah

- Popup alarm dipindahkan dari pojok kanan bawah menjadi notification panel yang menempel pada ikon alarm di header.
- Panel terbuka tepat di bawah ikon dan berkembang ke arah bawah dengan tinggi maksimum mengikuti viewport.
- Jika alarm cukup banyak, panel menggunakan scroll internal sehingga tidak menutup menu atau kontrol pada bagian bawah halaman.
- Popup alarm dipisahkan dari toast aplikasi biasa. Pesan seperti save, export, dan acknowledge tetap tampil sebagai toast singkat pada lokasi sebelumnya.

## Lifecycle

Perubahan posisi tidak mengubah lifecycle alarm. Alarm critical tetap persisten sampai event clear, sedangkan warning dan info tetap dapat diminimalkan atau ditutup. Badge header tetap menunjukkan seluruh alarm aktif.
