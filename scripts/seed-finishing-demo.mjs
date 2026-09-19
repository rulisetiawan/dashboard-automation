import { randomUUID } from "node:crypto";
import pg from "pg";

const follow = process.argv.includes("--follow");
const demoProcesses = ["continuous", "inspecting", "finishing", "setting_dongnam"];
const demoGateway = "FINISHING-DEMO";
const sampleCount = 33;
const sampleIntervalMs = 15 * 60_000;

const pool = new pg.Pool({
  ...(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

function stableUuid(value) {
  const suffix = Math.abs(Number(value)).toString(16).padStart(12, "0").slice(-12);
  return `f1a10000-0000-4000-9000-${suffix}`;
}

function processCode(processType) {
  return { continuous: "CT", inspecting: "INSP", finishing: "FIN", setting_dongnam: "SD" }[processType];
}

function machineState(index, processType) {
  if (processType === "finishing") return "running";
  if (index % 11 === 0) return "fault";
  if (index % 7 === 0) return "warning";
  if (index % 5 === 0) return "idle";
  return "running";
}

function latestValue(processType, role, index) {
  const offset = index % 12;
  const upperRole = String(role).toUpperCase();
  if (upperRole === "COMM_HEARTBEAT") return 1;
  if (upperRole === "LINE_SPEED_PV") return 22 + offset * 1.15;
  if (upperRole === "RUNTIME_TOTAL_H") return 1280 + index * 73.4;
  if (upperRole === "OUTPUT_TOTAL_M") return 42300 + index * 2180.5;
  if (upperRole === "CHEMICAL_CONSUMPTION_KG") return 1380 + index * 96.4;
  if (/CHEMICAL_0?1_CONSUMPTION_KG/.test(upperRole)) return 420 + index * 18.2;
  if (/CHEMICAL_0?2_CONSUMPTION_KG/.test(upperRole)) return 360 + index * 15.6;
  if (/CHEMICAL_0?3_CONSUMPTION_KG/.test(upperRole)) return 330 + index * 13.8;
  if (/CHEMICAL_0?4_CONSUMPTION_KG/.test(upperRole)) return 270 + index * 11.4;
  if (upperRole.includes("TEMPERATURE_ZONE_01")) return processType === "setting_dongnam" ? 168 + offset * 0.25 : processType === "finishing" ? 132 + offset * 0.2 : 88 + offset * 0.18;
  if (upperRole.includes("TEMPERATURE_ZONE_02")) return processType === "setting_dongnam" ? 170 + offset * 0.22 : processType === "finishing" ? 130 + offset * 0.2 : 91 + offset * 0.16;
  if (upperRole.includes("TEMPERATURE_ZONE_03")) return processType === "setting_dongnam" ? 169 + offset * 0.2 : 93 + offset * 0.14;
  if (upperRole.includes("TEMPERATURE_ZONE_04")) return processType === "setting_dongnam" ? 166 + offset * 0.18 : 90 + offset * 0.12;
  if (upperRole.includes("PADDER_01_PRESSURE")) return 3.4 + offset * 0.03;
  if (upperRole.includes("PADDER_02_PRESSURE")) return 3.7 + offset * 0.025;
  if (upperRole.includes("PADDER_03_PRESSURE")) return 3.5 + offset * 0.02;
  if (upperRole === "PROCESS_PRESSURE_PV") return 4.6 + offset * 0.04;
  if (upperRole === "DEFECT_COUNT") return 8 + offset;
  if (upperRole === "DEFECT_LENGTH_M") return 1.2 + offset * 0.16;
  if (upperRole === "QUALITY_GRADE") return index % 6 === 0 ? "B" : "A";
  if (upperRole === "CAMERA_CONNECTED") return 1;
  if (upperRole === "CAMERA_INSPECTION_ACTIVE") return machineState(index, processType) === "running" ? 1 : 0;
  if (upperRole === "CAMERA_DEFECT_TYPE") return index % 3 === 0 ? "Oil Spot" : index % 3 === 1 ? "Weaving Line" : "Color Variation";
  if (upperRole === "CAMERA_DEFECT_POSITION_M") return 84 + offset * 17.5;
  if (upperRole === "FABRIC_WIDTH_PV") return 178 + offset * 0.35;
  if (upperRole === "OVERFEED_PV") return 7.5 + offset * 0.28;
  return 0;
}

function historicalValue(latest, role, sampleIndex, assetIndex) {
  if (typeof latest !== "number") return latest;
  const ratio = sampleIndex / Math.max(1, sampleCount - 1);
  const upperRole = String(role).toUpperCase();
  if (upperRole === "COMM_HEARTBEAT") return 1;
  if (upperRole.includes("OUTPUT_TOTAL")) return latest - (1 - ratio) * (680 + assetIndex * 22);
  if (upperRole.includes("RUNTIME_TOTAL")) return latest - (1 - ratio) * 8;
  if (upperRole.includes("CONSUMPTION")) return latest - (1 - ratio) * (42 + assetIndex * 1.8);
  if (upperRole === "DEFECT_COUNT") return Math.max(0, Math.round(latest - (1 - ratio) * 5));
  if (upperRole === "DEFECT_LENGTH_M") return Math.max(0, latest - (1 - ratio) * 0.8);
  const amplitude = Math.max(Math.abs(latest) * 0.012, 0.08);
  return latest + Math.sin(sampleIndex * 0.58 + assetIndex * 0.31) * amplitude;
}

async function seedDemoData() {
  const now = new Date();
  const assetsResult = await pool.query(`
    SELECT asset_id, process_type, display_name
    FROM asset
    WHERE active = TRUE AND process_type = ANY($1::text[])
    ORDER BY process_type, asset_id
  `, [demoProcesses]);
  const assets = assetsResult.rows;
  if (assets.length !== 21) throw new Error(`Expected 21 finishing assets, found ${assets.length}. Run migrations first.`);

  const client = await pool.connect();
  let telemetryRows = 0;
  let equipmentRows = 0;
  try {
    await client.query("BEGIN");
    const assetIds = assets.map((asset) => asset.asset_id);
    await client.query(`
      DELETE FROM telemetry_sample
      WHERE gateway_id = $1 AND asset_id = ANY($2::text[])
    `, [demoGateway, assetIds]);
    await client.query(`
      DELETE FROM equipment_telemetry_sample
      WHERE gateway_id = $1
        AND equipment_id IN (
          SELECT equipment_id FROM equipment WHERE asset_id = ANY($2::text[])
        )
    `, [demoGateway, assetIds]);

    for (const [assetIndex, asset] of assets.entries()) {
      const state = machineState(assetIndex, asset.process_type);
      const progress = state === "idle" ? 100 : state === "fault" ? 46 : 34 + (assetIndex * 7) % 58;
      const batchNo = `DEMO-${processCode(asset.process_type)}-${String(assetIndex + 1).padStart(3, "0")}`;
      const recipeCode = `DEMO-${processCode(asset.process_type)}-SETUP`;
      const tags = (await client.query(`
        SELECT tag_code, signal_role, engineering_unit
        FROM tag_definition
        WHERE asset_id = $1 AND active = TRUE
        ORDER BY tag_code
      `, [asset.asset_id])).rows;
      const values = { source: demoGateway, demo_sample: true };
      for (const tag of tags) values[String(tag.signal_role).toLowerCase()] = latestValue(asset.process_type, tag.signal_role, assetIndex);

      await client.query(`
        UPDATE asset
        SET config_json = config_json || $2::jsonb, updated_at = $3
        WHERE asset_id = $1
      `, [asset.asset_id, JSON.stringify({ demo_sample: true, demo_source: demoGateway }), now]);
      await client.query(`
        UPDATE asset_snapshot
        SET machine_state = $2, batch_no = $3, progress_percent = $4, connected = TRUE,
            source_ts = $5, quality = 'GOOD', values_json = $6::jsonb, updated_at = $5
        WHERE asset_id = $1
      `, [asset.asset_id, state, batchNo, progress, now, JSON.stringify(values)]);

      await client.query(`
        INSERT INTO production_batch (
          batch_no, customer_name, fabric_type, fabric_weight_gsm, target_width_cm,
          target_output_kg, delivery_target_at, batch_status, created_at, updated_at,
          source_system, external_reference, source_updated_at, payload_json
        ) VALUES ($1, 'DEMO CUSTOMER', 'Demo Finishing Fabric', 180, 180, 850, $2, 'IN_PROCESS', $3, $3, $4, $1, $3, $5::jsonb)
        ON CONFLICT (batch_no) DO UPDATE SET
          batch_status = EXCLUDED.batch_status, updated_at = EXCLUDED.updated_at,
          source_updated_at = EXCLUDED.source_updated_at, payload_json = EXCLUDED.payload_json
      `, [batchNo, new Date(now.getTime() + 86400000), now, demoGateway, JSON.stringify({ demo_sample: true })]);

      const runId = stableUuid(10000 + assetIndex);
      const runStartedAt = new Date(now.getTime() - (75 + assetIndex * 4) * 60_000);
      const outputQuantity = 460 + assetIndex * 31;
      await client.query(`
        INSERT INTO batch_process_run (
          process_run_id, batch_no, asset_id, process_type, recipe_code, run_status,
          started_at, output_quantity, output_unit, created_at, updated_at,
          source_system, external_run_id, source_updated_at, progress_percent, payload_json
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'m',$9,$9,$10,$11,$9,$12,$13::jsonb)
        ON CONFLICT (process_run_id) DO UPDATE SET
          run_status = EXCLUDED.run_status, started_at = EXCLUDED.started_at,
          output_quantity = EXCLUDED.output_quantity, progress_percent = EXCLUDED.progress_percent,
          source_updated_at = EXCLUDED.source_updated_at, payload_json = EXCLUDED.payload_json,
          updated_at = EXCLUDED.updated_at
      `, [runId, batchNo, asset.asset_id, asset.process_type, recipeCode, state === "fault" ? "HOLD" : "RUNNING", runStartedAt, outputQuantity, now, demoGateway, runId, progress, JSON.stringify({ demo_sample: true })]);

      await client.query(`
        INSERT INTO machine_state_event (
          state_event_id, asset_id, machine_state, started_at, ended_at,
          reason_code, source_ts, quality, created_at
        ) VALUES ($1,$2,$3,$4,NULL,'DEMO_SAMPLE',$5,'GOOD',$5)
        ON CONFLICT (state_event_id) DO UPDATE SET
          machine_state = EXCLUDED.machine_state, started_at = EXCLUDED.started_at,
          ended_at = NULL, reason_code = EXCLUDED.reason_code, source_ts = EXCLUDED.source_ts
      `, [stableUuid(20000 + assetIndex), asset.asset_id, state, new Date(now.getTime() - 8 * 60 * 60_000), now]);

      for (const [tagIndex, tag] of tags.entries()) {
        const latest = latestValue(asset.process_type, tag.signal_role, assetIndex);
        const isText = typeof latest === "string";
        const points = String(tag.signal_role).toUpperCase() === "COMM_HEARTBEAT" || isText ? [sampleCount - 1] : Array.from({ length: sampleCount }, (_, index) => index);
        for (const sampleIndex of points) {
          const sourceTs = new Date(now.getTime() - (sampleCount - 1 - sampleIndex) * sampleIntervalMs);
          const value = historicalValue(latest, tag.signal_role, sampleIndex, assetIndex);
          await client.query(`
            INSERT INTO telemetry_sample (
              asset_id, tag_code, source_ts, value_number, value_text, quality,
              gateway_id, message_id, ingested_at
            ) VALUES ($1,$2,$3,$4,$5,'GOOD',$6,$7,$8)
          `, [asset.asset_id, tag.tag_code, sourceTs, typeof value === "number" ? value : null, typeof value === "string" ? value : null, demoGateway, stableUuid(300000 + assetIndex * 10000 + tagIndex * 100 + sampleIndex), now]);
          telemetryRows += 1;
        }
      }

      const equipmentId = `${asset.asset_id}-MTR-MAIN`;
      const amps = 18 + assetIndex * 0.7;
      const power = 8.5 + assetIndex * 0.85;
      const frequency = 32 + (assetIndex % 8) * 1.7;
      await client.query(`
        INSERT INTO equipment (
          equipment_id, asset_id, equipment_type, equipment_code, display_name,
          category, config_json, active, created_at, updated_at
        ) VALUES ($1,$2,'MOTOR_3_PHASE','MAIN','Main Drive','line',$3::jsonb,TRUE,$4,$4)
        ON CONFLICT (equipment_id) DO UPDATE SET
          display_name = EXCLUDED.display_name, category = EXCLUDED.category,
          config_json = EXCLUDED.config_json, active = TRUE, updated_at = EXCLUDED.updated_at
      `, [equipmentId, asset.asset_id, JSON.stringify({ demo_sample: true, source: demoGateway, rated_voltage_v: 400 }), now]);
      await client.query(`
        INSERT INTO equipment_snapshot (
          equipment_id, equipment_state, current_r_a, current_s_a, current_t_a,
          voltage_rs_v, voltage_st_v, voltage_tr_v, active_power_kw,
          drive_frequency_hz, runtime_hours, energy_kwh, maintenance_due_at,
          source_ts, quality, values_json, updated_at
        ) VALUES ($1,$2,$3,$4,$5,399.4,400.2,399.0,$6,$7,$8,$9,$10,$11,'GOOD',$12::jsonb,$11)
        ON CONFLICT (equipment_id) DO UPDATE SET
          equipment_state = EXCLUDED.equipment_state, current_r_a = EXCLUDED.current_r_a,
          current_s_a = EXCLUDED.current_s_a, current_t_a = EXCLUDED.current_t_a,
          active_power_kw = EXCLUDED.active_power_kw, drive_frequency_hz = EXCLUDED.drive_frequency_hz,
          runtime_hours = EXCLUDED.runtime_hours, energy_kwh = EXCLUDED.energy_kwh,
          maintenance_due_at = EXCLUDED.maintenance_due_at, source_ts = EXCLUDED.source_ts,
          quality = EXCLUDED.quality, values_json = EXCLUDED.values_json, updated_at = EXCLUDED.updated_at
      `, [equipmentId, state, amps + 0.2, amps, amps - 0.15, power, frequency, 840 + assetIndex * 44, 5200 + assetIndex * 310, new Date(now.getTime() + 30 * 86400000), now, JSON.stringify({ demo_sample: true, source: demoGateway })]);

      for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
        const sourceTs = new Date(now.getTime() - (sampleCount - 1 - sampleIndex) * sampleIntervalMs);
        const variation = Math.sin(sampleIndex * 0.52 + assetIndex * 0.24) * 0.04;
        await client.query(`
          INSERT INTO equipment_telemetry_sample (
            equipment_id, source_ts, equipment_state, current_r_a, current_s_a, current_t_a,
            voltage_rs_v, voltage_st_v, voltage_tr_v, active_power_kw,
            drive_frequency_hz, runtime_hours, energy_kwh, quality, gateway_id,
            message_id, ingested_at
          ) VALUES ($1,$2,$3,$4,$5,$6,399.4,400.2,399.0,$7,$8,$9,$10,'GOOD',$11,$12,$13)
          ON CONFLICT (message_id) DO UPDATE SET
            source_ts = EXCLUDED.source_ts, equipment_state = EXCLUDED.equipment_state,
            current_r_a = EXCLUDED.current_r_a, current_s_a = EXCLUDED.current_s_a,
            current_t_a = EXCLUDED.current_t_a, active_power_kw = EXCLUDED.active_power_kw,
            drive_frequency_hz = EXCLUDED.drive_frequency_hz,
            runtime_hours = EXCLUDED.runtime_hours, energy_kwh = EXCLUDED.energy_kwh,
            ingested_at = EXCLUDED.ingested_at
        `, [equipmentId, sourceTs, state, amps * (1 + variation) + 0.2, amps * (1 + variation), amps * (1 + variation) - 0.15, power * (1 + variation), frequency * (1 + variation * 0.15), 840 + assetIndex * 44 - (sampleCount - 1 - sampleIndex) * 0.25, 5200 + assetIndex * 310 - (sampleCount - 1 - sampleIndex) * power * 0.25, demoGateway, stableUuid(600000 + assetIndex * 100 + sampleIndex), now]);
        equipmentRows += 1;
      }
    }

    const alarmAssets = assets.filter((_, index) => index % 7 === 0).slice(0, 3);
    for (const [alarmIndex, asset] of alarmAssets.entries()) {
      const tag = (await client.query(`
        SELECT tag_code FROM tag_definition
        WHERE asset_id = $1 AND signal_role <> 'COMM_HEARTBEAT'
        ORDER BY tag_code LIMIT 1
      `, [asset.asset_id])).rows[0];
      await client.query(`
        INSERT INTO alarm_event (
          alarm_event_id, asset_id, tag_code, batch_no, area_code, severity,
          event_state, alarm_code, title, detail, occurred_at, cleared_at,
          acknowledged_at, acknowledged_by, source_ts, created_at,
          event_class, trigger_value, threshold_value, recommendation
        ) VALUES ($1,$2,$3,$4,'FIN',$5,$6,$7,$8,$9,$10,$11,NULL,NULL,$10,$10,'DEMO_SAMPLE',$12,$13,$14)
        ON CONFLICT (alarm_event_id) DO UPDATE SET
          event_state = EXCLUDED.event_state, title = EXCLUDED.title,
          detail = EXCLUDED.detail, occurred_at = EXCLUDED.occurred_at,
          cleared_at = EXCLUDED.cleared_at, source_ts = EXCLUDED.source_ts
      `, [stableUuid(700000 + alarmIndex), asset.asset_id, tag?.tag_code || null, `DEMO-${processCode(asset.process_type)}-${String(assets.indexOf(asset) + 1).padStart(3, "0")}`, alarmIndex === 2 ? "CRITICAL" : "WARNING", alarmIndex === 1 ? "CLEARED" : "ACTIVE", `DEMO-${asset.asset_id}`, alarmIndex === 2 ? "Drive overload demo" : "Process deviation demo", "Data contoh untuk validasi tampilan alarm dan exception.", new Date(now.getTime() - (alarmIndex + 1) * 22 * 60_000), alarmIndex === 1 ? new Date(now.getTime() - 8 * 60_000) : null, alarmIndex === 2 ? 38.7 : 4.8, alarmIndex === 2 ? 35 : 4.5, "Verifikasi kondisi mesin dan konfirmasi data aktual sebelum tindakan."]);
    }

    const rollupFrom = new Date(now.getTime() - 9 * 60 * 60_000);
    await client.query("SELECT refresh_equipment_rollups($1::timestamptz, $2::timestamptz)", [rollupFrom, now]);
    await client.query("SELECT refresh_machine_state_rollups($1::timestamptz, $2::timestamptz)", [rollupFrom, now]);

    await client.query("COMMIT");
    console.log(JSON.stringify({ source: demoGateway, assets: assets.length, telemetry_rows: telemetryRows, equipment_rows: equipmentRows, follow }));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function refreshDemoHeartbeat() {
  const now = new Date();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const assets = (await client.query(`
      SELECT asset_id FROM asset
      WHERE active = TRUE AND process_type = ANY($1::text[])
      ORDER BY asset_id
    `, [demoProcesses])).rows;
    for (const asset of assets) {
      const tagCode = `SMM.${asset.asset_id}.COMMUNICATION.HEARTBEAT`;
      await client.query(`
        INSERT INTO tag_latest (
          tag_code, asset_id, value_number, value_text, quality, source_ts,
          ingested_at, gateway_id, message_id, updated_at
        ) VALUES ($1,$2,1,NULL,'GOOD',$3,$3,$4,$5,$3)
        ON CONFLICT (tag_code) DO UPDATE SET
          value_number = 1, value_text = NULL, quality = 'GOOD',
          source_ts = EXCLUDED.source_ts, ingested_at = EXCLUDED.ingested_at,
          gateway_id = EXCLUDED.gateway_id, message_id = EXCLUDED.message_id,
          updated_at = EXCLUDED.updated_at
      `, [tagCode, asset.asset_id, now, demoGateway, randomUUID()]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  await seedDemoData();
  await refreshDemoHeartbeat();
  if (!follow) {
    await pool.end();
    return;
  }
  console.log("FINISHING-DEMO heartbeat follower aktif setiap 10 detik. Tekan Ctrl+C untuk berhenti.");
  const timer = setInterval(() => {
    void refreshDemoHeartbeat().catch((error) => console.error(`Heartbeat demo gagal: ${error.message}`));
  }, 10_000);
  const stop = async () => {
    clearInterval(timer);
    await pool.end();
    process.exit(0);
  };
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
