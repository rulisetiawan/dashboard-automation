# PostgreSQL Local Integration v1.4

**Tanggal:** 27 Agustus 2026  
**Status:** Akses LAN terbatas aktif

## Perubahan dari v1.3

Instance PostgreSQL native pada komputer ini telah disiapkan untuk menerima koneksi ke database `pt_smm_scada` dari jaringan pabrik `192.168.100.0/24`.

Konfigurasi aktif:

```text
listen_addresses = '*'
port = 5432
database = pt_smm_scada
source network = 192.168.100.0/24
authentication = scram-sha-256
```

Aturan `pg_hba.conf`:

```text
host    pt_smm_scada    all    192.168.100.0/24    scram-sha-256
```

Windows Firewall mengizinkan inbound TCP port `5432` hanya dari `192.168.100.0/24`. Akses global seperti `0.0.0.0/0` tidak digunakan.

## Alamat server yang digunakan client

`DB_HOST` pada komputer client harus berisi alamat IP komputer yang menjalankan instance PostgreSQL ini, bukan selalu `localhost` dan bukan otomatis `192.168.100.82`.

Pada saat konfigurasi diterapkan, alamat interface komputer ini terdeteksi sebagai `169.254.150.227/16`. Agar mudah dijangkau dari jaringan `192.168.100.0/24`, komputer ini sebaiknya memperoleh IP tetap pada subnet tersebut atau tersedia routing dua arah menuju alamat aktifnya.

Komputer `192.168.100.82` adalah host terpisah dan konfigurasi PostgreSQL pada host tersebut tidak berubah oleh konfigurasi ini.

## Validasi dari komputer client

```powershell
Test-NetConnection -ComputerName IP_KOMPUTER_DATABASE -Port 5432
```

Jika `TcpTestSucceeded` bernilai `True`, client dapat menggunakan konfigurasi berikut dengan kredensial PostgreSQL yang sah:

```text
DB_HOST=IP_KOMPUTER_DATABASE
DB_PORT=5432
DB_NAME=pt_smm_scada
DB_USER=USER_DATABASE
DB_PASSWORD=PASSWORD_DATABASE
DATABASE_SSL=false
```

Gunakan role aplikasi dengan hak minimum untuk pemakaian operasional. Role superuser `postgres` tidak direkomendasikan untuk client dashboard.
