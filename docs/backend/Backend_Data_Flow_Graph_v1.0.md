# Backend Data Flow Graph v1.0

**Tanggal:** 15 Agustus 2026  
**Status:** Baseline graph arsitektur data dan traceability

## 1. Alur utama OT ke dashboard

```mermaid
flowchart LR
  subgraph OT["OT Network · Read-only"]
    PLC["PLC / HMI\nJetflow · Calator · Dryer · Kalender"]
    DRIVE["VFD & Motor\nR/S/T · kW · Hz · state"]
    METER["Power / Water / Steam / Thermal Oil Meter"]
    DISP["Dispensing PLC\nTank · Valve · Loadcell"]
    PLC --> EDGE["OT Edge Gateway\nOPC UA · Modbus · vendor driver"]
    DRIVE --> EDGE
    METER --> EDGE
    DISP --> EDGE
  end

  subgraph DMZ["OT DMZ"]
    EDGE --> BUFFER["Local buffer\nStore & forward"]
    BUFFER --> RELAY["Secure relay / MQTT TLS\nDevice certificate · ACL"]
  end

  subgraph DATA["IT Data Platform"]
    RELAY --> INGEST["Telemetry ingestion\nValidate · deduplicate · normalize"]
    INGEST --> RAW["Historian\nPostgreSQL + TimescaleDB\ntag_sample"]
    INGEST --> LATEST["Live snapshot\ntag_latest / cache"]
    RAW --> STREAM["Stream & event processor\nKPI · alarm · state · aggregate"]
    STREAM --> KPI["Derived data\nRuntime · consumption · output · abnormality"]
    MES["MES context\nBatch · recipe · order · quality\nchemical request · maintenance"] --> CONTEXT["Context service"]
    RAW --> CONTEXT
    CONTEXT --> KPI
    REG["Asset & Tag Registry\nVersioned source mapping\ndashboard binding"] --> INGEST
    REG --> API
  end

  subgraph USERS["Applications"]
    LATEST --> API["Read-only API\nREST · WebSocket"]
    KPI --> API
    API --> DASH["PT.SMM Smart Manufacturing Dashboard"]
    API --> EXPORT["CSV / report"]
    KPI --> AI["Analytics / AI\nAdvisory recommendation only"]
  end

  AI -. "recommendation + audit\n(no PLC writeback)" .-> DASH
```

## 2. Siklus satu sample tag

```mermaid
sequenceDiagram
  participant P as PLC / Meter / Drive
  participant E as OT Edge Gateway
  participant I as Ingestion Service
  participant H as Historian + Snapshot
  participant S as Stream Processor
  participant A as API / Dashboard

  P->>E: Value + source timestamp + source quality
  E->>E: Scale, unit, schema, local buffer
  E->>I: Telemetry envelope (message_id, tag_code)
  I->>I: Validate active mapping + deduplicate
  I->>H: Write tag_sample and update tag_latest
  H->>S: Raw sample / state change
  S->>S: Delta totalizer, state interval, PV-SV rule
  S->>H: KPI, alarm/event, rollup aggregate
  A->>H: Snapshot or historical query by asset/tag/range
  H-->>A: Value, unit, quality, source timestamp, context
```

## 3. Traceability batch sampai analisis

```mermaid
flowchart TD
  ORDER["Production order\nCustomer · fabric · delivery target"] --> BATCH["Batch / fabric number"]
  BATCH --> RUN1["Jetflow run\nRecipe · color · process step"]
  RUN1 --> RUN2["Calator run\nSpeed · dancer · chemical use"]
  RUN2 --> RUN3["Dryer run\nSpeed · chamber profile · thermal oil"]
  RUN3 --> RUN4["Kalender run\nLoadcell · temperature · width"]
  RUN4 --> QC["QC / final result"]

  JTAG["Jetflow tag samples + events"] --> RUN1
  CTAG["Calator tag samples + dispensing transactions"] --> RUN2
  DTAG["Dryer tag samples + motor diagnostic"] --> RUN3
  KTAG["Kalender tag samples + motor diagnostic"] --> RUN4
  UTIL["Utility interval\nwater · energy · steam · thermal oil"] --> RUN1
  UTIL --> RUN2
  UTIL --> RUN3
  UTIL --> RUN4

  RUN1 --> INVEST["Batch investigation\nPV/SV · step overlay · abnormal log\nconsumption · equipment event"]
  RUN2 --> INVEST
  RUN3 --> INVEST
  RUN4 --> INVEST
  QC --> INVEST
```

## 4. Batas keamanan

```mermaid
flowchart LR
  DASH["Dashboard / API / AI"]
  ITFW["IT Firewall"]
  DMZ["DMZ relay\nTLS + allowlist"]
  OTFW["OT Firewall"]
  EDGE["Read-only OT Gateway"]
  PLC["PLC / Drive controller"]

  DASH --> ITFW --> DMZ --> OTFW --> EDGE --> PLC
  PLC -. "telemetry only" .-> EDGE
  DASH -. "No direct PLC route\nNo writeback in V1" .-> PLC
```

## Pembacaan graph

- Registry berada di pusat karena tag yang sama dipakai oleh ingestion, historian, API, dan dashboard binding.
- `tag_sample` menjaga bukti raw data; `tag_latest` menjaga respons live; KPI/event adalah data turunan yang tetap dapat ditelusuri.
- Batch/run menjadi simpul penghubung antara data mesin, utility, chemical, motor, dan QC sehingga analisis ketidaksesuaian tidak hanya melihat satu sensor.
