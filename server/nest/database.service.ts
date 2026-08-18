import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool, QueryResultRow } from "pg";

const projectRoot = resolve(process.cwd());
const migrationFile = resolve(projectRoot, "postgres", "migrations", "0001_non_jetflow_local.sql");

const processConfig = {
  calator: { code: "CL", label: "Calator", areas: [["DPN", "Depan", 2], ["BLK", "Belakang", 9], ["TMR", "Timur", 7]] },
  dryer: { code: "DR", label: "Dryer", areas: [["DPN", "Depan", 1], ["BLK", "Belakang", 2], ["TMR", "Timur", 3]] },
  kalender: { code: "KL", label: "Kalender", areas: [["DPN", "Depan", 7], ["BLK", "Belakang", 7], ["TMR", "Timur", 7]] },
  chemical: { code: "DSP", label: "Dispensing Calator", areas: [["DPN", "Depan", 1], ["BLK", "Belakang", 2], ["TMR", "Timur", 2]] },
};

const seedTagMap: Record<string, string[]> = {
  calator: ["FEEDING.SPEED_PV", "SQUEEZING_01.SPEED_PV", "SQUEEZING_02.SPEED_PV", "OVERFEED_OUT.SPEED_PV", "DANCER.POSITION_PV", "PRODUCTION.OUTPUT_TOTAL_M"],
  dryer: ["LINE.SPEED_PV", "CHAMBER_01.TEMP_PV", "CHAMBER_02.TEMP_PV", "THERMAL_OIL.SUPPLY_TEMP_PV", "PRODUCTION.OUTPUT_TOTAL_M"],
  kalender: ["UPPER_FELT.LOADCELL_PV", "LOWER_FELT.LOADCELL_PV", "UPPER_FELT.TEMP_PV", "LOWER_FELT.TEMP_PV", "DANCER.POSITION_PV", "FABRIC.WIDTH_PV"],
  chemical: ["TANK_01.LOADCELL_TOTAL_KG", "TANK_02.LEVEL_PV", "INLET_VALVE_01.OPEN_FB", "TRANSFER_VALVE.OPEN_FB"],
};

function seedState(index: number, areaIndex: number) {
  const marker = index + areaIndex * 5;
  if (marker % 19 === 0 && marker > 0) return "fault";
  if (marker % 11 === 0 && marker > 0) return "warning";
  if (marker % 7 === 0) return "idle";
  return "running";
}

function seedAssets(): any[] {
  return (Object.entries(processConfig) as [string, any][]).flatMap(([process, config]) => config.areas.flatMap(([areaCode, areaName, count]: [string, string, number], areaIndex: number) =>
    Array.from({ length: count }, (_, index) => {
      const state = seedState(index, areaIndex);
      const active = state === "running" || state === "warning";
      const assetId = `${config.code}-${areaCode}-${String(index + 1).padStart(2, "0")}`;
      const configJson = process === "calator"
        ? { subtype: index % 6 === 5 ? "Bianco" : "Standard", recipe: active ? ["WASH-S04", "SOFT-B12", "SOFT-B08"][index % 3] : "—" }
        : process === "dryer"
          ? { chambers: 6 + ((index + areaIndex) % 2) * 2, recipe: active ? ["DRY-COT-18", "DRY-POL-22", "DRY-COT-16"][index % 3] : "—" }
          : process === "kalender"
            ? { recipe: active ? ["FIN-COT-07", "FIN-POL-05", "FIN-COT-09"][index % 3] : "—" }
            : { recipe: active ? "CHEM-TRANSFER-07" : "—" };
      return { assetId, process, areaCode, areaName, displayName: `${config.label === "Dispensing Calator" ? "Dispensing" : config.label} ${areaName} ${String(index + 1).padStart(2, "0")}`, subtype: configJson.subtype || null, configJson, state, batch: active ? `DB-260818-${String(areaIndex * 20 + index + 1).padStart(3, "0")}` : "—", progress: active ? 31 + ((index * 13 + areaIndex * 17) % 63) : 0 };
    }),
  ));
}

function dispenserForCalator(calatorId: string) {
  const [, area, numberValue] = calatorId.split("-");
  const number = Number(numberValue);
  if (area === "DPN") return "DSP-DPN-01";
  if (area === "BLK") return number <= 5 ? "DSP-BLK-01" : "DSP-BLK-02";
  return number <= 4 ? "DSP-TMR-01" : "DSP-TMR-02";
}

function seedChemicalTransactions(now: number) {
  const rows = [
    [0.3, "REQ-CL-260818-041", "CL-DPN-01", "CH-02", "Softener B", 126, 126.2, "Automatic", "Completed", "Auto PLC", "Weighing 2 / 2"],
    [0.8, "REQ-CL-260818-040", "CL-BLK-04", "CH-01", "Softener A", 184, 183.7, "Automatic", "Completed", "Auto PLC", "Weighing 1 / 1"],
    [1.2, "REQ-CL-260818-039", "CL-TMR-03", "CH-05", "Fixing Agent", 74, 74, "Manual", "Completed", "A. Raka", "Manual verified"],
    [1.8, "REQ-CL-260818-038", "CL-BLK-02", "CH-03", "Washing Agent", 112, 109.6, "Automatic", "Hold", "Auto PLC", "Weighing 2 / 3"],
    [2.4, "REQ-CL-260818-037", "CL-DPN-02", "CH-04", "Anti-static", 48, 48.1, "Manual", "Completed", "S. Deni", "Manual verified"],
    [3.1, "REQ-CL-260818-036", "CL-TMR-06", "CH-06", "Neutralizer", 62, null, "Automatic", "Weighing", "Auto PLC", "Weighing 1 / 2"],
  ];
  return rows.map(([hoursAgo, requestCode, calatorId, chemicalCode, chemicalName, targetKg, actualKg, mode, status, operatorName, stage], index) => ({
    transactionId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    requestCode, dispenserId: dispenserForCalator(String(calatorId)), calatorId, chemicalCode, chemicalName, targetKg, actualKg, mode, status, operatorName, stage,
    occurredAt: new Date(now - Number(hoursAgo) * 60 * 60 * 1000).toISOString(),
  }));
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    const required = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"];
    if (!databaseUrl && required.some((field) => !process.env[field])) {
      throw new Error("Isi DATABASE_URL atau seluruh DB_HOST, DB_PORT, DB_NAME, DB_USER, dan DB_PASSWORD pada .env.");
    }
    this.pool = new Pool({
      ...(databaseUrl ? { connectionString: databaseUrl } : { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD }),
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query("SELECT 1 AS connected");
      await this.pool.query(await readFile(migrationFile, "utf8"));
      await this.seedDatabase();
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown database error";
      throw new Error(`Koneksi PostgreSQL native gagal: ${detail}`);
    }
  }

  async onModuleDestroy() { await this.pool.end(); }

  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) {
    return this.pool.query<T>(text, values);
  }

  private async seedDatabase() {
    const result = await this.query<{ count: number }>("SELECT COUNT(*)::int AS count FROM asset");
    if (Number(result.rows[0]?.count) > 0) return;
    const now = new Date().toISOString();
    for (const asset of seedAssets()) {
      await this.query("INSERT INTO asset (asset_id, process_type, area_code, area_name, display_name, subtype, config_json, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$8)", [asset.assetId, asset.process, asset.areaCode, asset.areaName, asset.displayName, asset.subtype, JSON.stringify(asset.configJson), now]);
      await this.query("INSERT INTO asset_snapshot (asset_id, machine_state, batch_no, progress_percent, connected, source_ts, quality, updated_at) VALUES ($1,$2,$3,$4,TRUE,$5,'SIMULATED',$5)", [asset.assetId, asset.state, asset.batch, asset.progress, now]);
      for (const signal of seedTagMap[asset.process]) {
        await this.query("INSERT INTO tag_definition (tag_code, asset_id, signal_role, source_status, created_at) VALUES ($1,$2,$3,'PENDING_MAPPING',$4)", [`SMM.${asset.areaCode}.${asset.assetId}.${signal}`, asset.assetId, signal.endsWith("_PV") ? "PV" : "STATE", now]);
      }
    }
    for (const item of seedChemicalTransactions(Date.now())) {
      await this.query("INSERT INTO chemical_transaction (transaction_id, request_code, dispenser_id, calator_id, chemical_code, chemical_name, target_kg, actual_kg, mode, status, operator_name, stage, occurred_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [item.transactionId, item.requestCode, item.dispenserId, item.calatorId, item.chemicalCode, item.chemicalName, item.targetKg, item.actualKg, item.mode, item.status, item.operatorName, item.stage, item.occurredAt, now]);
    }
    for (const [code, label, value, unit] of [["ELECTRICAL_DEMAND", "Electrical demand", 1.84, "MW"], ["WATER_FLOW", "Water consumption rate", 184, "m³/h"], ["STEAM_FLOW", "Steam production", 12.8, "t/h"], ["THERMAL_OIL_SUPPLY", "Thermal oil supply", 218.4, "°C"]]) {
      await this.query("INSERT INTO utility_snapshot (utility_code, label, value, unit, quality, source_ts, updated_at) VALUES ($1,$2,$3,$4,'SIMULATED',$5,$5)", [code, label, value, unit, now]);
    }
    await this.query("INSERT INTO backend_meta (meta_key, meta_value, updated_at) VALUES ('non_jetflow_seed_v1','1',$1)", [now]);
  }
}
