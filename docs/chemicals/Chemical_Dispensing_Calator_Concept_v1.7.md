# Chemical Dispensing Calator Concept v1.7

**Versi:** 1.7

**Tanggal:** 24 Agustus 2026

**Status:** Aktif

**Fokus perubahan:** Modernisasi P&ID dispensing skid dan standardisasi binding elemen SVG

## Layout P&ID

P&ID Chemical Dispensing Calator dibagi menjadi tiga zona yang mengikuti arah aliran kiri ke kanan:

1. **Supply & Valve Rack** — delapan inlet tersusun sejajar, masing-masing memiliki source label, actuated valve, dan junction ke common manifold.
2. **Weighing & Transfer** — common manifold masuk ke Tank 1, Tank 1 menggunakan loadcell, lalu chemical melewati transfer valve dan transfer pump menuju Tank 2.
3. **Calator Distribution** — outlet Tank 2 masuk ke satu distribution header dengan cabang yang sejajar menuju seluruh Calator yang didukung unit tersebut.

Struktur ini menghilangkan pipa silang dari dua sisi vessel dan menyediakan ruang tepi yang konsisten agar diagram lebih mudah dibaca pada layar dashboard.

## Visual language

- garis biru gelap: manifold atau header utama;
- garis cyan: jalur proses aktif/siap dihubungkan ke live state;
- hijau: elemen ready atau connected;
- putih dan biru muda: vessel, source card, dan destination card;
- garis putus-putus: sinyal instrument/loadcell;
- simbol valve menggunakan dua segitiga, stem, dan actuator agar lebih dekat dengan bahasa P&ID industrial.

## Element code SVG

Setiap elemen operasional memiliki atribut `data-element-code` yang dapat dicocokkan dengan view PostgreSQL `instrument_state`:

| Elemen | Element code |
|---|---|
| Inlet valve 1–8 | `INLET_VALVE_01` sampai `INLET_VALVE_08` |
| Supply manifold | `SUPPLY_MANIFOLD` |
| Tank 1 | `TANK_01` |
| Loadcell Tank 1 | `TANK_01_LOADCELL` |
| Transfer line | `TRANSFER_LINE` |
| Transfer valve | `TRANSFER_VALVE` |
| Transfer pump | `TRANSFER_PUMP` |
| Tank 2 | `TANK_02` |
| Distribution manifold | `DISTRIBUTION_MANIFOLD` |
| Route Calator | `ROUTE_CL_01`, `ROUTE_CL_02`, dan seterusnya |

## Sumber label chemical

Nama dan kode chemical pada supply rack membaca `available_chemicals` dari analytics PostgreSQL. Jalur pertama dicadangkan untuk process water. Jika master chemical belum lengkap, diagram menggunakan label line generik tanpa membuat nilai proses atau status sensor palsu.

## Kesiapan live state

Versi ini menyiapkan struktur visual dan identifier elemen. Status aktual berikutnya dapat diterapkan dengan mengubah class state pada group SVG berdasarkan REST `GET /api/v1/assets/{assetId}/instrument-states` dan event WebSocket `instrument:delta`, tanpa menggambar ulang P&ID.

## Batasan

Diagram ini merupakan process schematic dashboard dan belum menggantikan P&ID engineering resmi. Nomor valve, arah fail-safe, interlock, ukuran pipa, material, dan instrument loop harus divalidasi terhadap drawing serta SOP aktual sebelum commissioning.
