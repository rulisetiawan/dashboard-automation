# PostgreSQL Local Integration v1.6

**Tanggal:** 28 Agustus 2026  
**Status:** HBA aktif; firewall menunggu Administrator

## Temuan jaringan

Komputer server dikenal sebagai `192.168.100.82`, tetapi koneksi aktual menuju Ethernet laptop memakai alamat sumber `169.254.150.182`. Ethernet laptop menggunakan `169.254.150.227/16`.

Port aplikasi Node.js terlihat dapat diakses karena terdapat rule program Node.js yang lebih luas. PostgreSQL hanya memiliki rule untuk sumber `192.168.100.0/24`, sehingga TCP `5432` dari alamat APIPA tidak cocok dengan firewall maupun `pg_hba.conf`.

## Izin HBA aktif

```text
Source IP  : 169.254.150.182/32
Destination: komputer dashboard
Database   : pt_smm_scada
Protocol   : TCP
Port       : 5432
Auth       : scram-sha-256
```

Konfigurasi `pg_hba.conf`:

```conf
host    pt_smm_scada    all    169.254.150.182/32    scram-sha-256
```

PostgreSQL telah di-reload melalui `pg_reload_conf()` dan `pg_hba_file_rules` memverifikasi rule tanpa error. Rule lama `192.168.100.0/24` tetap aktif. Tidak ada izin untuk seluruh subnet APIPA.

## Firewall menunggu Administrator

Pembuatan rule firewall ditolak oleh Windows dari sesi non-elevated. Jalankan skrip berikut melalui PowerShell **Run as Administrator**:

```powershell
& '.\scripts\enable-postgresql-nodered-169.254.150.182.ps1'
```

Skrip hanya membuat atau memperbarui satu rule inbound TCP `5432` untuk remote address `169.254.150.182`.

## Catatan operasional

Alamat `169.254.x.x` merupakan APIPA dan dapat berubah setelah restart atau perubahan adapter. Untuk operasi permanen, gunakan alamat statis yang tidak konflik pada subnet OT resmi, kemudian ganti rule firewall dan `pg_hba.conf` sesuai alamat tersebut.
