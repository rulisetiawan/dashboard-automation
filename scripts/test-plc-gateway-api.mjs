import assert from "node:assert/strict";
import { ApiController } from "../dist-backend/server/nest/api.controller.js";
import { TagDefinitionController } from "../dist-backend/server/nest/tag-definition.controller.js";
import { TelemetryIngestController } from "../dist-backend/server/nest/telemetry-ingest.controller.js";

console.log("=== RUNNING PLC GATEWAY API TESTS ===");

// Mock DatabaseService
class MockDatabaseService {
  constructor() {
    this.assets = [
      {
        asset_id: "JETFLOW_01",
        display_name: "Jetflow Machine #01",
        process_type: "DYEING",
        area_code: "PROD_AREA_1",
        area_name: "Gedung Produksi 1",
        active: true,
      },
      {
        asset_id: "IPAL_EQUALISASI",
        display_name: "Bak Equalisasi IPAL",
        process_type: "WASTE_WATER",
        area_code: "WWTP",
        area_name: "Instalasi Pengolahan Air Limbah",
        active: true,
      },
    ];

    this.tags = [
      {
        tag_code: "JF01_TEMP_ACTUAL",
        asset_id: "JETFLOW_01",
        signal_role: "MEASUREMENT",
        engineering_unit: "°C",
        source_status: "MAPPED",
        active: true,
      },
      {
        tag_code: "JF01_PRESSURE",
        asset_id: "JETFLOW_01",
        signal_role: "MEASUREMENT",
        engineering_unit: "Bar",
        source_status: "MAPPED",
        active: true,
      },
      {
        tag_code: "JF01_PUMP_RUN",
        asset_id: "JETFLOW_01",
        signal_role: "STATUS",
        engineering_unit: "",
        source_status: "MAPPED",
        active: true,
      },
    ];

    this.telemetrySamples = [];
  }

  async query(sql, values = []) {
    const text = sql.trim().toLowerCase();

    // 1. GET /assets
    if (text.includes("from asset") && text.startsWith("select asset_id")) {
      let filtered = [...this.assets];
      if (values.length > 0) {
        if (values[0] === true || values[0] === false) {
          filtered = filtered.filter((a) => a.active === values[0]);
        }
        if (values.length > 1 && typeof values[1] === "string") {
          filtered = filtered.filter((a) => a.area_code === values[1]);
        }
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    // Existing asset query (dashboard)
    if (text.includes("from asset a") && text.includes("left join asset_snapshot")) {
      return {
        rows: this.assets.map((a) => ({
          ...a,
          machine_state: "running",
          batch_no: "BATCH-001",
          progress_percent: 50,
          connected: true,
          source_ts: new Date().toISOString(),
          quality: "GOOD",
          values_json: {},
        })),
        rowCount: this.assets.length,
      };
    }

    // Asset check
    if (text.startsWith("select asset_id from asset where asset_id = $1")) {
      const found = this.assets.find((a) => a.asset_id === values[0]);
      return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
    }

    if (text.includes("where asset_id = any($1::text[])")) {
      const ids = new Set(values[0]);
      const matched = this.assets.filter((a) => ids.has(a.asset_id));
      return { rows: matched, rowCount: matched.length };
    }

    // 2. GET /tag-definitions
    if (text.includes("from tag_definition") && text.startsWith("select tag_code")) {
      let filtered = [...this.tags];
      if (values.includes(true)) {
        filtered = filtered.filter((t) => t.active === true);
      }
      const assetIdVal = values.find((v) => typeof v === "string");
      if (assetIdVal) {
        filtered = filtered.filter((t) => t.asset_id === assetIdVal);
      }
      return { rows: filtered, rowCount: filtered.length };
    }

    // Tag check
    if (text.includes("from tag_definition where tag_code = any($1::text[])")) {
      const codes = new Set(values[0]);
      const matched = this.tags.filter((t) => codes.has(t.tag_code));
      return { rows: matched, rowCount: matched.length };
    }

    // 3. POST /tag-definitions
    if (text.startsWith("insert into tag_definition")) {
      const [tag_code, asset_id, signal_role, engineering_unit, source_status, active] = values;
      const existingIdx = this.tags.findIndex((t) => t.tag_code === tag_code);
      const tagObj = { tag_code, asset_id, signal_role, engineering_unit, source_status, active };
      if (existingIdx >= 0) this.tags[existingIdx] = tagObj;
      else this.tags.push(tagObj);
      return { rows: [tagObj], rowCount: 1 };
    }

    // 4. POST /telemetry/ingest
    if (text.startsWith("insert into telemetry_sample")) {
      const [asset_id, tag_code, source_ts, value_number, value_text, quality, gateway_id, message_id] = values;
      const sample = { id: this.telemetrySamples.length + 1, asset_id, tag_code, source_ts, value_number, value_text, quality, gateway_id, message_id };
      this.telemetrySamples.push(sample);
      return { rows: [{ id: sample.id, tag_code: sample.tag_code }], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }

  async transaction(handler) {
    return handler(this);
  }
}

// Mock RealtimeGateway
class MockRealtimeGateway {
  constructor() {
    this.publishedTags = [];
  }
  async publishInstrumentTags(tags) {
    this.publishedTags.push(...tags);
  }
}

async function runTests() {
  const db = new MockDatabaseService();
  const realtime = new MockRealtimeGateway();

  const apiController = new ApiController(db);
  const tagDefController = new TagDefinitionController(db);
  const telemetryIngestController = new TelemetryIngestController(db, realtime);

  // Test 1: GET /api/v1/assets (PLC Gateway default array format)
  console.log("Test 1: GET /api/v1/assets (PLC Gateway mode)");
  const assetsDefault = await apiController.assets(undefined, undefined, undefined, undefined);
  assert(Array.isArray(assetsDefault), "Response must be an Array");
  assert.equal(assetsDefault.length, 2);
  assert.equal(assetsDefault[0].asset_id, "JETFLOW_01");
  assert.equal(assetsDefault[0].display_name, "Jetflow Machine #01");
  assert.equal(assetsDefault[0].process_type, "DYEING");
  assert.equal(assetsDefault[0].area_code, "PROD_AREA_1");
  assert.equal(assetsDefault[0].area_name, "Gedung Produksi 1");
  assert.equal(assetsDefault[0].active, true);
  console.log("✓ Test 1 Passed:", JSON.stringify(assetsDefault[0]));

  // Test 1b: GET /api/v1/assets?process=jetflow (Dashboard backward compatibility)
  console.log("Test 1b: GET /api/v1/assets?process=jetflow (Dashboard UI mode)");
  const assetsDashboard = await apiController.assets("jetflow", undefined, undefined, undefined);
  assert(assetsDashboard.data_mode === "ACTUAL_DATABASE", "Dashboard mode must return data_mode");
  assert(Array.isArray(assetsDashboard.assets), "Dashboard mode must return assets array");
  console.log("✓ Test 1b Passed");

  // Test 2: GET /api/v1/tag-definitions?asset_id=JETFLOW_01
  console.log("Test 2: GET /api/v1/tag-definitions?asset_id=JETFLOW_01");
  const tagsFiltered = await tagDefController.getTagDefinitions("JETFLOW_01", "true");
  assert(Array.isArray(tagsFiltered), "Response must be an Array");
  assert.equal(tagsFiltered.length, 3);
  assert.equal(tagsFiltered[0].tag_code, "JF01_TEMP_ACTUAL");
  assert.equal(tagsFiltered[0].signal_role, "MEASUREMENT");
  assert.equal(tagsFiltered[0].engineering_unit, "°C");
  assert.equal(tagsFiltered[0].source_status, "MAPPED");
  assert.equal(tagsFiltered[0].active, true);
  console.log("✓ Test 2 Passed:", JSON.stringify(tagsFiltered[0]));

  // Test 3: POST /api/v1/tag-definitions
  console.log("Test 3: POST /api/v1/tag-definitions");
  const newTag = await tagDefController.createTagDefinition({
    tag_code: "JF01_LEVEL_TANK",
    asset_id: "JETFLOW_01",
    signal_role: "MEASUREMENT",
    engineering_unit: "%",
    source_status: "MAPPED",
    active: true,
  });
  assert.equal(newTag.status, "success");
  assert.equal(newTag.message, "Tag definition created");
  assert.equal(newTag.tag_code, "JF01_LEVEL_TANK");
  console.log("✓ Test 3 Passed:", JSON.stringify(newTag));

  // Test 4: POST /api/v1/telemetry/ingest
  console.log("Test 4: POST /api/v1/telemetry/ingest");
  const telemetryPayload = [
    {
      asset_id: "JETFLOW_01",
      tag_code: "JF01_TEMP_ACTUAL",
      source_ts: "2026-09-23T08:35:00.125Z",
      value_number: 85.50,
      value_text: null,
      quality: "GOOD",
      gateway_id: "plc-gateway-01",
      message_id: "8f3b2a14-7e8c-4a31-b8d9-2c3e1a5f6e7d",
    },
    {
      asset_id: "JETFLOW_01",
      tag_code: "JF01_PUMP_RUN",
      source_ts: "2026-09-23T08:35:00.125Z",
      value_number: 1.0,
      value_text: "true",
      quality: "GOOD",
      gateway_id: "plc-gateway-01",
      message_id: "8f3b2a14-7e8c-4a31-b8d9-2c3e1a5f6e7d",
    },
  ];

  const ingestResult = await telemetryIngestController.ingestTelemetry(telemetryPayload);
  assert.equal(ingestResult.status, "success");
  assert.equal(ingestResult.received, 2);
  assert.equal(ingestResult.inserted, 2);
  assert.equal(db.telemetrySamples.length, 2);
  assert.equal(db.telemetrySamples[0].value_number, 85.50);
  assert.equal(db.telemetrySamples[1].value_text, "true");
  assert.equal(realtime.publishedTags.length, 2);
  console.log("✓ Test 4 Passed:", JSON.stringify(ingestResult));

  console.log("\nALL TESTS PASSED SUCCESSFULLY! 🎉");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
