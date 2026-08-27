# PostgreSQL Local Integration v1.5

**Tanggal:** 27 Agustus 2026  
**Status:** API live-value siap LAN

## Perubahan dari v1.4

Selain akses PostgreSQL 5432, backend NestJS menyediakan Live Value Ingestion API pada TCP port `8787`. Akses firewall API dibatasi ke komputer `192.168.100.82`; aturan PostgreSQL v1.4 tidak berubah.

```text
Source IP: 192.168.100.82
Destination: komputer dashboard
Protocol: TCP
Port: 8787
```

Jika Node-RED berjalan pada komputer dashboard yang sama, gunakan `http://localhost:8787`. Dari `192.168.100.82`, gunakan alamat IP komputer dashboard yang dapat dirutekan dari jaringan tersebut.

Port 8787 tidak memberikan akses langsung ke PostgreSQL. Request tetap melewati validasi backend dan dapat dilindungi dengan `INGEST_API_KEY`/header `X-API-Key`.

