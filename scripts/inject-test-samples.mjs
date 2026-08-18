import { randomUUID } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

const now = new Date();
const iso = now.toISOString();
const uuid = (number) => `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const unitFor = (key) => key.includes("temperature") ? "°C" : key.includes("level") || key.includes("position") || key.includes("progress") ? "%" : key.includes("speed") ? "m/min" : key.includes("loadcell") ? "kg" : key.includes("output") ? "m" : key.includes("water") ? "m³" : key.includes("flow") ? "m³/h" : "";

const assets = [
  {
    id: "JF-LA-01", process: "jetflow", area: "LA", areaLabel: "Lane A", name: "Jetflow Lane A 01 · TEST SAMPLE", subtype: "3 Winch", batch: "TEST-JF-0001", recipe: "TEST-DYE-01", progress: 38.4,
    values: { main_tank_temperature_pv: 92.6, main_tank_temperature_sv: 95.0, main_tank_level_pv: 71.8, main_tank_level_sv: 70.0, water_flow_pv: 124.5, dosing_tank_1_temperature_pv: 58.2, dosing_tank_2_temperature_pv: 42.7, tank_1_level_pv: 64.8, tank_2_level_pv: 37.2 },
    motors: [["WINCH-01", "Winch 1", "winch", 22.4, 10.8, 38.0], ["WINCH-02", "Winch 2", "winch", 21.9, 10.5, 37.8], ["WINCH-03", "Winch 3", "winch", 22.8, 11.0, 38.2], ["MAIN-PUMP", "Main Pump", "pump", 46.2, 24.6, 42.0], ["CIRCULATION", "Circulation Pump", "pump", 38.7, 19.8, 38.0], ["DOSING-01", "Dosing Pump 1", "pump", 18.4, 7.6, 28.0], ["DOSING-02", "Dosing Pump 2", "pump", 16.8, 6.9, 27.0], ["MIXER-01", "Mixer 1", "mixer", 14.6, 5.3, 22.1], ["MIXER-02", "Mixer 2", "mixer", 14.2, 5.1, 21.8]],
  },
  {
    id: "CL-DPN-01", process: "calator", area: "DPN", areaLabel: "Depan", name: "Calator Depan 01 · TEST SAMPLE", subtype: "Standard", batch: "TEST-CL-0001", recipe: "TEST-WASH-01", progress: 43.1,
    values: { feeding_speed_pv: 18.4, overfeed_out_speed_pv: 19.2, dancer_position_pv: 51.6, output_total_m: 742.0, water_consumption_m3: 12.4 },
    motors: [["FEED", "Feeding", "line", 28.4, 13.8, 18.4], ["SQ-01", "Squeezing 1", "line", 24.8, 11.7, 18.2], ["SQ-02", "Squeezing 2", "line", 25.1, 11.9, 18.0], ["OF-OUT", "Overfeed Out", "line", 21.7, 9.8, 19.2], ["FOLDER", "Folder", "line", 18.6, 8.2, 17.8], ["PLAIT", "Plaiter", "line", 27.8, 14.3, 17.6]],
  },
  {
    id: "DR-DPN-01", process: "dryer", area: "DPN", areaLabel: "Depan", name: "Dryer Depan 01 · TEST SAMPLE", subtype: "6 Chamber", batch: "TEST-DR-0001", recipe: "TEST-DRY-01", progress: 56.8,
    values: { line_speed_pv: 24.6, chamber_1_temperature_pv: 148.1, chamber_2_temperature_pv: 147.8, chamber_3_temperature_pv: 148.4, chamber_4_temperature_pv: 147.6, chamber_5_temperature_pv: 148.0, chamber_6_temperature_pv: 147.9, thermal_oil_supply_temperature_pv: 218.1, output_total_m: 628.0 },
    motors: [["MAIN-DRIVE", "Main Drive", "drive", 32.4, 17.6, 24.6], ["FAN-01", "Chamber Fan 1", "fan", 11.4, 4.6, 36.0], ["FAN-02", "Chamber Fan 2", "fan", 11.8, 4.8, 36.2], ["FAN-03", "Chamber Fan 3", "fan", 12.1, 4.9, 36.0], ["FAN-04", "Chamber Fan 4", "fan", 11.7, 4.7, 36.1], ["FAN-05", "Chamber Fan 5", "fan", 12.2, 5.0, 36.2], ["FAN-06", "Chamber Fan 6", "fan", 11.9, 4.8, 36.0], ["EXHAUST", "Exhaust Fan", "fan", 19.8, 9.1, 38.0], ["COOLING", "Cooling Fan", "fan", 13.6, 5.8, 31.0]],
  },
  {
    id: "KL-DPN-01", process: "kalender", area: "DPN", areaLabel: "Depan", name: "Kalender Depan 01 · TEST SAMPLE", subtype: "Finishing", batch: "TEST-KL-0001", recipe: "TEST-FIN-01", progress: 67.2,
    values: { loadcell_upper_pv: 480.6, loadcell_lower_pv: 473.4, temperature_upper_pv: 126.4, temperature_lower_pv: 125.7, dancing_roller_position_pv: 53.6, fabric_width_pv: 181.2, overfeed_pv: 8.6, output_total_m: 590.0 },
    motors: [["INLET", "Inlet", "line", 28.6, 14.8, 36.0], ["EXP-L", "Expander L", "line", 24.8, 12.9, 34.0], ["EXP-R", "Expander R", "line", 25.2, 13.1, 34.0], ["UP-FELT", "Upper Felt", "felt", 31.4, 16.2, 42.0], ["LOW-FELT", "Lower Felt", "felt", 30.9, 15.9, 42.0], ["COOL", "Cooling Belt", "belt", 18.6, 9.4, 28.0], ["CONVEYOR", "Conveyor Belt", "belt", 16.2, 8.1, 25.0], ["PLAIT", "Plaiter", "line", 27.8, 14.3, 36.0], ["TABLE", "Conveyor Table", "table", 21.6, 11.2, 30.0], ["UPDOWN", "Up Down Table", "table", 14.8, 7.6, 22.0]],
  },
  {
    id: "DSP-DPN-01", process: "chemical", area: "DPN", areaLabel: "Depan", name: "Dispensing Calator Depan 01 · TEST SAMPLE", subtype: "2 Tank", batch: "TEST-CL-0001", recipe: "TEST-CH-01", progress: 100,
    values: { tank_1_loadcell_kg: 126.2, tank_2_level_pv: 66.4, inlet_valve_1_open_fb: 1, transfer_valve_open_fb: 1 },
    motors: [["INLET-PUMP", "Inlet Pump", "pump", 8.4, 3.1, 25.0], ["TANK-MIXER", "Tank 1 Mixer", "mixer", 6.2, 2.2, 22.0], ["TRANSFER", "Transfer Pump", "pump", 12.8, 5.4, 31.0]],
  },
];

async function run() {
  await pool.query("BEGIN");
  try {
    for (const [assetIndex, asset] of assets.entries()) {
      await pool.query("INSERT INTO asset (asset_id,process_type,area_code,area_name,display_name,subtype,config_json,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$8) ON CONFLICT (asset_id) DO UPDATE SET display_name=EXCLUDED.display_name,subtype=EXCLUDED.subtype,config_json=EXCLUDED.config_json,updated_at=EXCLUDED.updated_at", [asset.id, asset.process, asset.area, asset.areaLabel, asset.name, asset.subtype, JSON.stringify({ source: "TEST_SAMPLE", recipe: asset.recipe, test_sample: true }), iso]);
      await pool.query("INSERT INTO asset_snapshot (asset_id,machine_state,batch_no,progress_percent,connected,source_ts,quality,values_json,updated_at) VALUES ($1,'running',$2,$3,TRUE,$4,'GOOD',$5::jsonb,$4) ON CONFLICT (asset_id) DO UPDATE SET machine_state=EXCLUDED.machine_state,batch_no=EXCLUDED.batch_no,progress_percent=EXCLUDED.progress_percent,connected=EXCLUDED.connected,source_ts=EXCLUDED.source_ts,quality=EXCLUDED.quality,values_json=EXCLUDED.values_json,updated_at=EXCLUDED.updated_at", [asset.id, asset.batch, asset.progress, iso, JSON.stringify({ source: "TEST_SAMPLE", ...asset.values })]);
      await pool.query("INSERT INTO production_batch (batch_no,customer_name,fabric_type,fabric_weight_gsm,target_width_cm,target_output_kg,delivery_target_at,batch_status,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,'IN_PROCESS',$8,$8) ON CONFLICT (batch_no) DO UPDATE SET batch_status=EXCLUDED.batch_status,updated_at=EXCLUDED.updated_at", [asset.batch, "TEST CUSTOMER", "Textile Test Fabric", 180, 181, 850, new Date(now.getTime() + 86400000).toISOString(), iso]);
      await pool.query("INSERT INTO batch_process_run (process_run_id,batch_no,asset_id,process_type,recipe_code,run_status,started_at,output_quantity,output_unit,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,'RUNNING',$6,$7,'m',$6,$6) ON CONFLICT (process_run_id) DO UPDATE SET run_status=EXCLUDED.run_status,output_quantity=EXCLUDED.output_quantity,updated_at=EXCLUDED.updated_at", [uuid(20001 + assetIndex), asset.batch, asset.id, asset.process, asset.recipe, iso, asset.values.output_total_m || 0]);
      for (const [tagIndex, [key, numericValue]] of Object.entries(asset.values).entries()) {
        const tagCode = `SMM.TEST.${asset.id}.${key.toUpperCase()}`;
        const unit = unitFor(key);
        await pool.query("INSERT INTO tag_definition (tag_code,asset_id,signal_role,engineering_unit,source_status,created_at) VALUES ($1,$2,$3,$4,'TEST_SAMPLE',$5) ON CONFLICT (tag_code) DO UPDATE SET signal_role=EXCLUDED.signal_role,engineering_unit=EXCLUDED.engineering_unit,source_status=EXCLUDED.source_status", [tagCode, asset.id, key.toUpperCase(), unit, iso]);
        for (let offset = 24; offset >= 0; offset--) {
          const variation = key.endsWith("_sv") ? 0 : Math.sin((24 - offset) * 0.48 + tagIndex) * Math.max(Number(numericValue) * 0.018, 0.12);
          await pool.query("INSERT INTO telemetry_sample (asset_id,tag_code,source_ts,value_number,quality,gateway_id,message_id,ingested_at) VALUES ($1,$2,$3,$4,'GOOD','LOCAL-TEST',$5,$6) ON CONFLICT (message_id,tag_code) DO UPDATE SET source_ts=EXCLUDED.source_ts,value_number=EXCLUDED.value_number,quality=EXCLUDED.quality,ingested_at=EXCLUDED.ingested_at", [asset.id, tagCode, new Date(now.getTime() - offset * 60 * 60_000).toISOString(), Number(numericValue) + variation, uuid(100000 + assetIndex * 10000 + tagIndex * 100 + offset), iso]);
        }
      }
      for (const [equipmentIndex, [code, name, category, amps, kw, hz]] of asset.motors.entries()) {
        const equipmentId = `${asset.id}-MTR-${code}`;
        const phaseOffset = equipmentIndex % 3;
        await pool.query("INSERT INTO equipment (equipment_id,asset_id,equipment_type,equipment_code,display_name,category,config_json,created_at,updated_at) VALUES ($1,$2,'MOTOR_3_PHASE',$3,$4,$5,$6::jsonb,$7,$7) ON CONFLICT (equipment_id) DO UPDATE SET display_name=EXCLUDED.display_name,category=EXCLUDED.category,config_json=EXCLUDED.config_json,updated_at=EXCLUDED.updated_at", [equipmentId, asset.id, code, name, category, JSON.stringify({ source: "TEST_SAMPLE", rated_voltage_v: 400 }), iso]);
        await pool.query("INSERT INTO equipment_snapshot (equipment_id,equipment_state,current_r_a,current_s_a,current_t_a,voltage_rs_v,voltage_st_v,voltage_tr_v,active_power_kw,drive_frequency_hz,runtime_hours,energy_kwh,maintenance_due_at,source_ts,quality,values_json,updated_at) VALUES ($1,'running',$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'GOOD',$14::jsonb,$13) ON CONFLICT (equipment_id) DO UPDATE SET equipment_state=EXCLUDED.equipment_state,current_r_a=EXCLUDED.current_r_a,current_s_a=EXCLUDED.current_s_a,current_t_a=EXCLUDED.current_t_a,voltage_rs_v=EXCLUDED.voltage_rs_v,voltage_st_v=EXCLUDED.voltage_st_v,voltage_tr_v=EXCLUDED.voltage_tr_v,active_power_kw=EXCLUDED.active_power_kw,drive_frequency_hz=EXCLUDED.drive_frequency_hz,runtime_hours=EXCLUDED.runtime_hours,energy_kwh=EXCLUDED.energy_kwh,maintenance_due_at=EXCLUDED.maintenance_due_at,source_ts=EXCLUDED.source_ts,quality=EXCLUDED.quality,values_json=EXCLUDED.values_json,updated_at=EXCLUDED.updated_at", [equipmentId, amps + phaseOffset * 0.2, amps - 0.1, amps - phaseOffset * 0.1, 399.1, 400.3, 398.7, kw, hz, 720 + equipmentIndex * 38, 3400 + equipmentIndex * 112, new Date(now.getTime() + (30 + equipmentIndex) * 86400000).toISOString(), iso, JSON.stringify({ source: "TEST_SAMPLE", current_imbalance_percent: 0.8 + phaseOffset * 0.2 })]);
        for (let offset = 24; offset >= 0; offset--) {
          const trend = Math.sin((24 - offset) * 0.43 + equipmentIndex * 0.6) * 0.055;
          const current = amps * (1 + trend);
          const power = kw * (1 + trend * 1.15);
          await pool.query("INSERT INTO equipment_telemetry_sample (equipment_id,source_ts,equipment_state,current_r_a,current_s_a,current_t_a,voltage_rs_v,voltage_st_v,voltage_tr_v,active_power_kw,drive_frequency_hz,runtime_hours,energy_kwh,quality,gateway_id,message_id,ingested_at) VALUES ($1,$2,'running',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'GOOD','LOCAL-TEST',$13,$14) ON CONFLICT (message_id) DO UPDATE SET source_ts=EXCLUDED.source_ts,current_r_a=EXCLUDED.current_r_a,current_s_a=EXCLUDED.current_s_a,current_t_a=EXCLUDED.current_t_a,active_power_kw=EXCLUDED.active_power_kw,drive_frequency_hz=EXCLUDED.drive_frequency_hz,runtime_hours=EXCLUDED.runtime_hours,energy_kwh=EXCLUDED.energy_kwh,ingested_at=EXCLUDED.ingested_at", [equipmentId, new Date(now.getTime() - offset * 60 * 60_000).toISOString(), current + phaseOffset * 0.18, current - 0.12, current - phaseOffset * 0.08, 399 + Math.sin(offset) * 1.4, 400 + Math.cos(offset) * 1.1, 398.8 + Math.sin(offset * 0.7), power, hz * (1 + trend * 0.12), 720 + equipmentIndex * 38 - offset, 3400 + equipmentIndex * 112 - offset * power, uuid(200000 + assetIndex * 10000 + equipmentIndex * 100 + offset), iso]);
        }
      }
    }
    const jetflowRunId = uuid(20001);
    const jetflowProgramId = uuid(9001);
    const jetflowSteps = [
      ["FILLING", "Filling", { level_sv_percent: 70 }], ["DRAIN", "Drain", { level_sv_percent: 5 }], ["RINSE_COOLING", "Rinse Cooling", { temperature_sv_c: 50 }], ["CHECK_PH", "Check PH", { ph_target: 6.5 }],
      ["TEMPERATURE_CONTROL", "Temperature Control", { temperature_sv_c: 95 }], ["INJECT_DT_1", "Inject DT 1", { dosing_target_l: 18 }], ["INJECT_DT_2", "Inject DT 2", { dosing_target_l: 12 }], ["DOSING_DT_1", "Dosing DT 1", { dosing_rate_l_min: 2.1 }],
      ["DOSING_DT_2", "Dosing DT 2", { dosing_rate_l_min: 1.8 }], ["LOAD", "Load", {}], ["UNLOAD", "Unload", {}], ["ST_TO_MT_FILLING", "ST To MT Filling", { level_sv_percent: 65 }],
    ];
    await pool.query("INSERT INTO process_program_version (program_version_id,program_code,version_no,process_type,recipe_code,version_status,change_reason,approved_by,approved_at,effective_from,config_json,created_at) VALUES ($1,'TEST-JF-DYE',1,'jetflow','TEST-DYE-01','RELEASED','TEST_SAMPLE baseline','LOCAL-TEST',$2,$2,$3::jsonb,$2) ON CONFLICT (program_version_id) DO UPDATE SET version_status=EXCLUDED.version_status,config_json=EXCLUDED.config_json", [jetflowProgramId, iso, JSON.stringify({ source: "TEST_SAMPLE" })]);
    await pool.query("UPDATE batch_process_run SET program_version_id=$1 WHERE process_run_id=$2", [jetflowProgramId, jetflowRunId]);
    for (const [index, [code, name, setpoint]] of jetflowSteps.entries()) {
      const programStepId = uuid(9101 + index);
      const executionId = uuid(9201 + index);
      const startedAt = new Date(now.getTime() - (12 - index) * 12 * 60_000).toISOString();
      const status = index < 3 ? "COMPLETED" : index === 3 ? "IN_PROGRESS" : "PENDING";
      const endedAt = index < 3 ? new Date(now.getTime() - (11 - index) * 12 * 60_000).toISOString() : null;
      await pool.query("INSERT INTO process_program_step (program_step_id,program_version_id,sequence_no,step_code,step_name,completion_rule,setpoint_json,expected_duration_seconds,created_at) VALUES ($1,$2,$3,$4,$5,'PLC_STEP_COMPLETE',$6::jsonb,720,$7) ON CONFLICT (program_step_id) DO UPDATE SET setpoint_json=EXCLUDED.setpoint_json", [programStepId, jetflowProgramId, index + 1, code, name, JSON.stringify(setpoint), iso]);
      await pool.query("INSERT INTO process_step_execution (step_execution_id,process_run_id,program_step_id,step_no,step_code,step_name,status,started_at,ended_at,setpoint_json,actual_json,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12,$12) ON CONFLICT (step_execution_id) DO UPDATE SET status=EXCLUDED.status,started_at=EXCLUDED.started_at,ended_at=EXCLUDED.ended_at,setpoint_json=EXCLUDED.setpoint_json,actual_json=EXCLUDED.actual_json,updated_at=EXCLUDED.updated_at", [executionId, jetflowRunId, programStepId, index + 1, code, name, status, startedAt, endedAt, JSON.stringify(setpoint), JSON.stringify(index <= 3 ? setpoint : {}), iso]);
      if (index > 0 && index <= 3) await pool.query("INSERT INTO process_transition_event (transition_event_id,process_run_id,from_step_execution_id,to_step_execution_id,transition_type,transition_status,reason_code,source_signal,source_ts,requested_by,detail_json,created_at) VALUES ($1,$2,$3,$4,'AUTOMATIC','APPLIED','PLC_STEP_COMPLETE','SMM.JETFLOW.LA.JF-LA-01.BATCH.PROCESS_STEP_CODE',$5,'LOCAL-TEST',$6::jsonb,$5) ON CONFLICT (transition_event_id) DO UPDATE SET source_ts=EXCLUDED.source_ts,detail_json=EXCLUDED.detail_json", [uuid(9301 + index), jetflowRunId, uuid(9200 + index), executionId, startedAt, JSON.stringify({ source: "TEST_SAMPLE", from_step: index, to_step: index + 1 })]);
    }
    await pool.query("INSERT INTO chemical_transaction (transaction_id,request_code,dispenser_id,calator_id,chemical_code,chemical_name,target_kg,actual_kg,mode,status,operator_name,stage,occurred_at,created_at) VALUES ($1,'TEST-REQ-0001','DSP-DPN-01','CL-DPN-01','TEST-CH-01','Softener Test',126,126.2,'Automatic','Completed','LOCAL-TEST','Weighing 1 / 1',$2,$2) ON CONFLICT (transaction_id) DO UPDATE SET actual_kg=EXCLUDED.actual_kg,status=EXCLUDED.status,occurred_at=EXCLUDED.occurred_at", [uuid(4001), iso]);
    for (const [code, label, value, unit] of [["TEST_ELECTRICAL_DEMAND", "Electrical demand · TEST SAMPLE", 14.8, "kW"], ["TEST_WATER_CONSUMPTION", "Water consumption · TEST SAMPLE", 12.4, "m³"], ["TEST_STEAM_CONSUMPTION", "Steam consumption · TEST SAMPLE", 0.42, "t"], ["TEST_THERMAL_OIL", "Thermal oil supply · TEST SAMPLE", 218.1, "°C"]]) {
      await pool.query("INSERT INTO utility_snapshot (utility_code,label,value,unit,quality,source_ts,updated_at) VALUES ($1,$2,$3,$4,'TEST_SAMPLE',$5,$5) ON CONFLICT (utility_code) DO UPDATE SET label=EXCLUDED.label,value=EXCLUDED.value,unit=EXCLUDED.unit,quality=EXCLUDED.quality,source_ts=EXCLUDED.source_ts,updated_at=EXCLUDED.updated_at", [code, label, value, unit, iso]);
    }
    for (const [sampleIndex, [code, value, unit]] of [["TEST_ELECTRICAL_ENERGY", 12450.2, "kWh"], ["TEST_WATER_TOTAL", 8210.6, "m³"], ["TEST_STEAM_TOTAL", 418.3, "t"]].entries()) {
      for (let offset = 2; offset >= 0; offset--) {
        await pool.query("INSERT INTO utility_sample (utility_code,source_ts,value_number,engineering_unit,quality,gateway_id,message_id,ingested_at) VALUES ($1,$2,$3,$4,'GOOD','LOCAL-TEST',$5,$6)", [code, new Date(now.getTime() - offset * 60 * 60_000).toISOString(), value - offset * (sampleIndex + 1) * 0.8, unit, randomUUID(), iso]);
      }
    }
    for (const [assetIndex, asset] of assets.entries()) {
      const startedAt = new Date(now.getTime() - (assetIndex + 1) * 45 * 60_000).toISOString();
      await pool.query("INSERT INTO machine_state_event (state_event_id,asset_id,machine_state,started_at,ended_at,reason_code,source_ts,quality,created_at) VALUES ($1,$2,'running',$3,$4,'TEST_SAMPLE',$5,'GOOD',$5) ON CONFLICT (state_event_id) DO UPDATE SET started_at=EXCLUDED.started_at,ended_at=EXCLUDED.ended_at,source_ts=EXCLUDED.source_ts", [uuid(6001 + assetIndex), asset.id, startedAt, iso, iso]);
    }
    await pool.query("COMMIT");
    console.log(JSON.stringify({ source: "TEST_SAMPLE", assets: assets.length, equipment: assets.reduce((total, asset) => total + asset.motors.length, 0) }));
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
}

run();
