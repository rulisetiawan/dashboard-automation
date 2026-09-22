// ============================================================================
// Page: Wastewater Treatment Plant (WWTP / IPAL)
// ============================================================================

function actualWwtpPage() {
  if (!wwtpData.data && !wwtpData.loading) void loadWwtpData();
  const tabs = [
    ["summary", "Summary IPAL"],
    ["inlet", "Inlet Monitoring"],
    ["pid", "P&ID Overview"],
  ].map(([val, label]) => `<button class="${state.wwtp.tab === val ? "active" : ""}" data-wwtp-tab="${val}">${label}</button>`).join("");

  const header = `${pageHead("wwtp", `<span class="range-badge">POSTGRES DB LINK</span>`)}<nav class="wwtp-tabs">${tabs}</nav>${state.wwtp.tab !== "pid" ? wwtpRangeToolbar() : ""}`;

  let bodyHtml = "";
  if (wwtpData.loading && !wwtpData.data) {
    bodyHtml = panel("Memuat Data WWTP", "Membaca telemetri sensor dari database IPAL melalui database link", `<div class="actual-historian-loading">Loading WWTP IPAL telemetry…</div>`);
  } else if (wwtpData.error && !wwtpData.data) {
    bodyHtml = panel("Data WWTP Tidak Tersedia", "Periksa koneksi foreign data wrapper ke database ipal_monitoring", actualEmpty(wwtpData.error));
  } else {
    const data = wwtpData.data || {};
    if (state.wwtp.tab === "inlet") bodyHtml = wwtpInletView(data);
    else if (state.wwtp.tab === "pid") bodyHtml = wwtpPidView(data);
    else bodyHtml = wwtpSummaryView(data);
  }

  return `<div id="wwtp-page-container">${header}<div id="wwtp-tab-body">${bodyHtml}</div></div>`;
}

async function requestAlarmConfiguration(force = false) {
  if (alarmConfiguration.loading || (alarmConfiguration.loaded && !force)) return;
  alarmConfiguration.loading = true;
  alarmConfiguration.error = null;
  try {
    const [alarmResponse, deviationResponse] = await Promise.all([
      fetch("/api/v1/alarm-rules", { cache: "no-store" }),
      fetch("/api/v1/process-deviation-rules", { cache: "no-store" }),
    ]);
    if (!alarmResponse.ok) throw new Error("Alarm rule API belum tersedia.");
    if (!deviationResponse.ok) throw new Error("Process deviation rule API belum tersedia.");
    alarmConfiguration.rules = (await alarmResponse.json()).rules || [];
    alarmConfiguration.deviationRules = (await deviationResponse.json()).rules || [];
    alarmConfiguration.loaded = true;
  } catch (error) {
    alarmConfiguration.error = error instanceof Error ? error.message : "Alarm rule configuration unavailable";
  } finally {
    alarmConfiguration.loading = false;
    if (state.page === "alarms") requestHistorianRender();
  }
}

async function requestAlarmTags(assetId) {
  if (!assetId || alarmConfiguration.tagsByAsset.has(assetId) || alarmConfiguration.tagLoading.has(assetId)) return;
  alarmConfiguration.tagLoading.add(assetId);
  alarmConfiguration.tagErrors.delete(assetId);
  try {
    const response = await fetch(`/api/v1/alarm-rules/tags?asset_id=${encodeURIComponent(assetId)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Tag registry asset tidak dapat dimuat.");
    alarmConfiguration.tagsByAsset.set(assetId, (await response.json()).tags || []);
  } catch (error) {
    alarmConfiguration.tagsByAsset.set(assetId, []);
    alarmConfiguration.tagErrors.set(assetId, error instanceof Error ? error.message : "Tag registry unavailable");
  } finally {
    alarmConfiguration.tagLoading.delete(assetId);
    if (state.page === "alarms") requestHistorianRender();
  }
}

function alarmRuleOperator(ruleType) {
  return ["HIGH", "HIGH_HIGH"].includes(ruleType) ? "≥" : "≤";
}

function captureAlarmRuleDraft(form) {
  if (!form) return;
  const data = new FormData(form);
  const current = state.alarmConfig.draft || {};
  const valueOrCurrent = (key, fallback = "") => data.has(key) ? data.get(key) : (current[key] ?? fallback);
  state.alarmConfig.draft = {
    ...current,
    rule_name: valueOrCurrent("rule_name"),
    asset_id: valueOrCurrent("asset_id", state.alarmConfig.assetId),
    tag_code: valueOrCurrent("tag_code", state.alarmConfig.tagCode),
    rule_type: valueOrCurrent("rule_type", "HIGH"),
    severity: valueOrCurrent("severity", "WARNING"),
    threshold_value: valueOrCurrent("threshold_value"),
    hysteresis_value: valueOrCurrent("hysteresis_value", "0"),
    delay_seconds: valueOrCurrent("delay_seconds", "0"),
    alarm_message: valueOrCurrent("alarm_message"),
    recommendation: valueOrCurrent("recommendation"),
    enabled: Boolean(form.elements.enabled?.checked),
  };
}

function alarmDecimal(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  return normalized ? Number(normalized) : Number.NaN;
}

function alarmRuleConfigPanel() {
  if (!alarmConfiguration.loaded && !alarmConfiguration.loading) void requestAlarmConfiguration();
  const assets = actualFleet().slice().sort((left, right) => `${left.process}-${left.id}`.localeCompare(`${right.process}-${right.id}`));
  const editing = alarmConfiguration.rules.find((rule) => rule.rule_id === state.alarmConfig.editingRuleId) || null;
  const draft = state.alarmConfig.draft || {};
  const requestedAssetId = draft.asset_id || editing?.asset_id || state.alarmConfig.assetId;
  if (!assets.some((asset) => asset.id === requestedAssetId)) state.alarmConfig.assetId = assets[0]?.id || null;
  else state.alarmConfig.assetId = requestedAssetId;
  const assetId = state.alarmConfig.assetId;
  if (assetId && !alarmConfiguration.tagsByAsset.has(assetId) && !alarmConfiguration.tagLoading.has(assetId)) void requestAlarmTags(assetId);
  const tags = alarmConfiguration.tagsByAsset.get(assetId) || [];
  const selectedTag = draft.tag_code || editing?.tag_code || state.alarmConfig.tagCode || tags[0]?.tag_code || "";
  if (!editing && selectedTag && state.alarmConfig.tagCode !== selectedTag) state.alarmConfig.tagCode = selectedTag;
  const fieldValue = (key, fallback = "") => actualText(draft[key] ?? editing?.[key] ?? fallback);
  const selectedOption = (value, current) => value === current ? "selected" : "";
  const ruleType = draft.rule_type || editing?.rule_type || "HIGH";
  const severity = draft.severity || editing?.severity || "WARNING";
  const enabled = draft.enabled ?? (editing ? Boolean(editing.enabled) : true);
  const tagError = alarmConfiguration.tagErrors.get(assetId);
  const form = assets.length ? `<form class="alarm-rule-form" data-alarm-rule-form data-rule-id="${actualText(editing?.rule_id || "")}">
    <div class="alarm-rule-form-head"><div><span class="eyebrow">${editing ? "EDIT RULE" : "NEW RULE"}</span><h3>${editing ? actualText(editing.rule_name) : "Configure sensor alarm"}</h3><p>Rule disimpan di PostgreSQL dan dievaluasi 24/7 oleh NestJS alarm engine.</p></div><label class="alarm-enabled-control"><input type="checkbox" name="enabled" ${enabled ? "checked" : ""}/><span>Rule enabled</span></label></div>
    <div class="alarm-rule-form-grid">
      <label class="field-group"><span>Machine / Asset</span><select class="select-control" name="asset_id" data-alarm-rule-asset required>${assets.map((asset) => `<option value="${actualText(asset.id)}" ${selectedOption(asset.id, assetId)}>${actualText(asset.id)} · ${actualText(asset.name)}</option>`).join("")}</select></label>
      <label class="field-group alarm-tag-field"><span>Tag monitored</span><select class="select-control" name="tag_code" data-alarm-rule-tag required ${alarmConfiguration.tagLoading.has(assetId) ? "disabled" : ""}>${tags.length ? tags.map((tag) => `<option value="${actualText(tag.tag_code)}" ${selectedOption(tag.tag_code, selectedTag)}>${actualText(tag.signal_role)}${tag.engineering_unit ? ` · ${actualText(tag.engineering_unit)}` : ""}</option>`).join("") : `<option value="">${alarmConfiguration.tagLoading.has(assetId) ? "Loading tags…" : "No active tag"}</option>`}</select>${tagError ? `<small class="field-error">${actualText(tagError)}</small>` : ""}</label>
      <label class="field-group"><span>Rule type</span><select class="select-control" name="rule_type">${["HIGH", "HIGH_HIGH", "LOW", "LOW_LOW"].map((value) => `<option value="${value}" ${selectedOption(value, ruleType)}>${value.replace("_", "-")}</option>`).join("")}</select></label>
      <label class="field-group"><span>Severity</span><select class="select-control" name="severity">${["INFO", "WARNING", "CRITICAL"].map((value) => `<option value="${value}" ${selectedOption(value, severity)}>${value}</option>`).join("")}</select></label>
      <label class="field-group"><span>Threshold</span><input class="search-control" name="threshold_value" type="text" inputmode="decimal" value="${fieldValue("threshold_value")}" placeholder="Contoh: 170 atau 170,5" required/></label>
      <label class="field-group"><span>Hysteresis</span><input class="search-control" name="hysteresis_value" type="text" inputmode="decimal" value="${fieldValue("hysteresis_value", 0)}" placeholder="Contoh: 2 atau 2,5" required/></label>
      <label class="field-group"><span>Activation delay</span><div class="alarm-input-unit"><input class="search-control" name="delay_seconds" type="number" min="0" max="86400" step="1" value="${fieldValue("delay_seconds", 0)}" required/><span>sec</span></div></label>
      <label class="field-group alarm-name-field"><span>Alarm name</span><input class="search-control" name="rule_name" value="${fieldValue("rule_name")}" maxlength="160" placeholder="Contoh: Upper temperature high" required/></label>
      <label class="field-group alarm-message-field"><span>Alarm message</span><textarea class="search-control" name="alarm_message" maxlength="500" placeholder="Keterangan yang muncul pada popup">${fieldValue("alarm_message")}</textarea></label>
      <label class="field-group alarm-message-field"><span>Operator recommendation</span><textarea class="search-control" name="recommendation" maxlength="1000" placeholder="Tindakan pemeriksaan yang direkomendasikan">${fieldValue("recommendation")}</textarea></label>
    </div>
    <div class="alarm-rule-form-foot"><span>Safety trip dan interlock tetap berada di PLC. Rule ini khusus monitoring SCADA/MES.</span><div>${editing ? `<button class="button ghost" type="button" data-alarm-rule-cancel>Cancel</button>` : ""}<button class="button primary" type="submit" ${!tags.length ? "disabled" : ""}>${editing ? "Update rule" : "Save alarm rule"}</button></div></div>
  </form>` : actualEmpty("Belum ada asset aktif untuk membuat alarm rule.");
  const ruleRows = alarmConfiguration.rules.length ? alarmConfiguration.rules.map((rule) => {
    const stateTone = rule.evaluation_state === "ACTIVE" ? "warning" : rule.evaluation_state === "PENDING" ? "neutral" : "good";
    return `<tr><td><strong>${actualText(rule.rule_name)}</strong><small>${actualText(rule.process_type)} · ${actualText(rule.area_code)}</small></td><td><strong>${actualText(rule.asset_id)}</strong><small class="mono">${actualText(rule.tag_code)}</small></td><td><span class="data-pill neutral">${actualText(rule.rule_type)}</span></td><td class="mono"><strong>${alarmRuleOperator(rule.rule_type)} ${actualText(rule.threshold_value)}</strong> ${actualText(rule.engineering_unit || "")}</td><td class="mono">${actualText(rule.hysteresis_value)} ${actualText(rule.engineering_unit || "")}<small>${actualText(rule.delay_seconds)} sec delay</small></td><td><span class="data-pill ${String(rule.severity).toLowerCase() === "critical" ? "warning" : "neutral"}">${actualText(rule.severity)}</span></td><td><span class="data-pill ${stateTone}">${actualText(rule.evaluation_state || "NOT EVALUATED")}</span><small>${rule.last_value == null ? "No sample" : `Last ${actualText(Number(rule.last_value).toLocaleString("id-ID", { maximumFractionDigits: 2 }))}`}</small></td><td><div class="alarm-rule-row-actions"><button class="button small" data-alarm-rule-edit="${actualText(rule.rule_id)}">Edit</button><button class="button small ${rule.enabled ? "ghost" : "primary"}" data-alarm-rule-toggle="${actualText(rule.rule_id)}" data-rule-enabled="${rule.enabled}">${rule.enabled ? "Disable" : "Enable"}</button></div></td></tr>`;
  }).join("") : `<tr><td colspan="8">${actualEmpty(alarmConfiguration.loading ? "Loading alarm rules…" : "Belum ada alarm rule. Gunakan form di atas untuk membuat rule pertama.")}</td></tr>`;
  const staticRulePanel = `<section class="card alarm-rule-configuration" id="alarm-rule-configuration">
    <div class="alarm-rule-config-header"><div><span class="eyebrow">ALARM CONFIGURATION</span><h2>Tag Threshold & Severity Rules</h2><p>Frontend mengatur rule; backend mengevaluasi telemetry dan mencatat lifecycle alarm.</p></div><span class="range-badge">${alarmConfiguration.rules.length} RULES</span></div>
    ${alarmConfiguration.error ? `<div class="alarm-config-error">${actualText(alarmConfiguration.error)}</div>` : form}
    <div class="table-wrap alarm-rule-table-wrap"><table class="data-table alarm-rule-table"><thead><tr><th>Rule</th><th>Asset / Tag</th><th>Type</th><th>Threshold</th><th>Stability</th><th>Severity</th><th>Engine State</th><th>Action</th></tr></thead><tbody>${ruleRows}</tbody></table></div>
  </section>`;
  return `${staticRulePanel}${processDeviationRuleConfigPanel()}`;
}

async function saveAlarmRule(form) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  captureAlarmRuleDraft(form);
  const draft = state.alarmConfig.draft;
  const thresholdValue = alarmDecimal(draft.threshold_value);
  const hysteresisValue = alarmDecimal(draft.hysteresis_value);
  const delaySeconds = Number(draft.delay_seconds);
  if (!Number.isFinite(thresholdValue) || !Number.isFinite(hysteresisValue) || !Number.isFinite(delaySeconds)) {
    showToast("Nilai belum valid", "Threshold, hysteresis, dan activation delay harus berupa angka.");
    if (submit) submit.disabled = false;
    return;
  }
  const payload = {
    rule_name: draft.rule_name, asset_id: draft.asset_id, tag_code: draft.tag_code,
    rule_type: draft.rule_type, severity: draft.severity, threshold_value: thresholdValue,
    hysteresis_value: hysteresisValue, delay_seconds: delaySeconds,
    alarm_message: draft.alarm_message, recommendation: draft.recommendation, enabled: draft.enabled,
  };
  const ruleId = form.dataset.ruleId;
  try {
    const response = await fetch(ruleId ? `/api/v1/alarm-rules/${encodeURIComponent(ruleId)}` : "/api/v1/alarm-rules", {
      method: ruleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(Array.isArray(result.message) ? result.message.join(" · ") : result.message || "Alarm rule gagal disimpan.");
    state.alarmConfig.editingRuleId = null;
    state.alarmConfig.draft = {};
    alarmConfiguration.loaded = false;
    showToast(ruleId ? "Alarm rule updated" : "Alarm rule created", `${payload.rule_name} disimpan dan akan dievaluasi backend.`);
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Save failed", error instanceof Error ? error.message : "Alarm rule gagal disimpan.");
    if (submit) submit.disabled = false;
  }
}

async function toggleAlarmRule(ruleId, enabled) {
  try {
    const response = await fetch(`/api/v1/alarm-rules/${encodeURIComponent(ruleId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify({ enabled }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Rule status gagal diubah.");
    alarmConfiguration.loaded = false;
    showToast(enabled ? "Rule enabled" : "Rule disabled", "Perubahan disimpan di PostgreSQL.");
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Update failed", error instanceof Error ? error.message : "Rule status gagal diubah.");
  }
}

function captureDeviationRuleDraft(form) {
  if (!form) return;
  const data = new FormData(form);
  const current = state.alarmConfig.deviationDraft || {};
  const valueOrCurrent = (key, fallback = "") => data.has(key) ? data.get(key) : (current[key] ?? fallback);
  state.alarmConfig.deviationDraft = {
    ...current,
    rule_code: valueOrCurrent("rule_code"),
    rule_name: valueOrCurrent("rule_name"),
    asset_id: valueOrCurrent("asset_id", state.alarmConfig.deviationAssetId),
    pv_tag_code: valueOrCurrent("pv_tag_code", state.alarmConfig.deviationPvTagCode),
    sv_tag_code: valueOrCurrent("sv_tag_code", state.alarmConfig.deviationSvTagCode),
    sv_signal_role: valueOrCurrent("sv_signal_role"),
    setpoint_key: valueOrCurrent("setpoint_key"),
    step_code: valueOrCurrent("step_code"),
    deviation_mode: valueOrCurrent("deviation_mode", "ABSOLUTE"),
    tolerance_low: valueOrCurrent("tolerance_low", "0"),
    tolerance_high: valueOrCurrent("tolerance_high", "0"),
    startup_grace_seconds: valueOrCurrent("startup_grace_seconds", "0"),
    expected_reach_time_seconds: valueOrCurrent("expected_reach_time_seconds"),
    stable_confirmation_seconds: valueOrCurrent("stable_confirmation_seconds", "0"),
    deviation_delay_seconds: valueOrCurrent("deviation_delay_seconds", "0"),
    clear_confirmation_seconds: valueOrCurrent("clear_confirmation_seconds", "0"),
    hysteresis_value: valueOrCurrent("hysteresis_value", "0"),
    minimum_sv_change: valueOrCurrent("minimum_sv_change", "0"),
    change_confirmation_seconds: valueOrCurrent("change_confirmation_seconds", "0"),
    severity: valueOrCurrent("severity", "WARNING"),
    impact_code: valueOrCurrent("impact_code", "PROCESS"),
    alarm_message: valueOrCurrent("alarm_message"),
    recommendation: valueOrCurrent("recommendation"),
    monitor_reach: Boolean(form.elements.monitor_reach?.checked),
    monitor_hold: Boolean(form.elements.monitor_hold?.checked),
    pause_on_machine_hold: Boolean(form.elements.pause_on_machine_hold?.checked),
    enabled: Boolean(form.elements.enabled?.checked),
  };
}

function processDeviationRuleConfigPanel() {
  const assets = actualFleet().filter((asset) => asset.process !== "chemical").slice().sort((left, right) => `${left.process}-${left.id}`.localeCompare(`${right.process}-${right.id}`));
  const editing = alarmConfiguration.deviationRules.find((rule) => rule.rule_id === state.alarmConfig.editingDeviationRuleId) || null;
  const draft = state.alarmConfig.deviationDraft || {};
  const requestedAssetId = draft.asset_id || editing?.asset_id || state.alarmConfig.deviationAssetId;
  state.alarmConfig.deviationAssetId = assets.some((asset) => asset.id === requestedAssetId) ? requestedAssetId : assets[0]?.id || null;
  const assetId = state.alarmConfig.deviationAssetId;
  if (assetId && !alarmConfiguration.tagsByAsset.has(assetId) && !alarmConfiguration.tagLoading.has(assetId)) void requestAlarmTags(assetId);
  const tags = alarmConfiguration.tagsByAsset.get(assetId) || [];
  const pvTags = tags.filter((tag) => /(^|[._])PV($|[._])|_PV$/i.test(tag.signal_role) || /_PV$/i.test(tag.tag_code));
  const svTags = tags.filter((tag) => /(^|[._])SV($|[._])|_SV$/i.test(tag.signal_role) || /_SV$/i.test(tag.tag_code));
  const selectedPv = draft.pv_tag_code || editing?.pv_tag_code || state.alarmConfig.deviationPvTagCode || pvTags[0]?.tag_code || "";
  const selectedSv = draft.sv_tag_code || editing?.sv_tag_code || state.alarmConfig.deviationSvTagCode || "";
  const fieldValue = (key, fallback = "") => actualText(draft[key] ?? editing?.[key] ?? fallback);
  const selectedOption = (value, current) => value === current ? "selected" : "";
  const checked = (key, fallback = true) => (draft[key] ?? (editing ? Boolean(editing[key]) : fallback)) ? "checked" : "";
  const deviationMode = draft.deviation_mode || editing?.deviation_mode || "ABSOLUTE";
  const severity = draft.severity || editing?.severity || "WARNING";
  const impactCode = draft.impact_code || editing?.impact_code || "PROCESS";
  const form = assets.length ? `<form class="alarm-rule-form process-deviation-rule-form" data-deviation-rule-form data-rule-id="${actualText(editing?.rule_id || "")}">
    <div class="alarm-rule-form-head"><div><span class="eyebrow">${editing ? "EDIT PROCESS DEVIATION" : "NEW PROCESS DEVIATION"}</span><h3>${editing ? actualText(editing.rule_name) : "Configure PV / SV target monitoring"}</h3><p>Rule hanya dievaluasi ketika process run aktif. Fase RAMPING tetap normal sampai reach-time terlampaui.</p></div><label class="alarm-enabled-control"><input type="checkbox" name="enabled" ${checked("enabled")}/><span>Rule enabled</span></label></div>
    <div class="alarm-rule-form-grid deviation-rule-form-grid">
      <label class="field-group"><span>Machine / Asset</span><select class="select-control" name="asset_id" data-deviation-rule-asset required>${assets.map((asset) => `<option value="${actualText(asset.id)}" ${selectedOption(asset.id, assetId)}>${actualText(asset.id)} · ${actualText(asset.name)}</option>`).join("")}</select></label>
      <label class="field-group"><span>PV parameter</span><select class="select-control" name="pv_tag_code" data-deviation-pv-tag required>${pvTags.length ? pvTags.map((tag) => `<option value="${actualText(tag.tag_code)}" ${selectedOption(tag.tag_code, selectedPv)}>${actualText(tag.signal_role)}${tag.engineering_unit ? ` · ${actualText(tag.engineering_unit)}` : ""}</option>`).join("") : `<option value="">No PV tag registered</option>`}</select></label>
      <label class="field-group"><span>SV telemetry tag (optional)</span><select class="select-control" name="sv_tag_code" data-deviation-sv-tag><option value="">Use signal role / process setpoint</option>${svTags.map((tag) => `<option value="${actualText(tag.tag_code)}" ${selectedOption(tag.tag_code, selectedSv)}>${actualText(tag.signal_role)}${tag.engineering_unit ? ` · ${actualText(tag.engineering_unit)}` : ""}</option>`).join("")}</select></label>
      <label class="field-group"><span>SV signal role (optional)</span><input class="search-control" name="sv_signal_role" value="${fieldValue("sv_signal_role")}" placeholder="TEMPERATURE_UPPER_SV"/></label>
      <label class="field-group"><span>Process setpoint key (optional)</span><input class="search-control" name="setpoint_key" value="${fieldValue("setpoint_key")}" placeholder="temperature_upper_c"/></label>
      <label class="field-group"><span>Jetflow step code (optional)</span><input class="search-control" name="step_code" value="${fieldValue("step_code")}" placeholder="TEMPERATURE_CONTROL"/></label>
      <label class="field-group"><span>Rule code</span><input class="search-control" name="rule_code" value="${fieldValue("rule_code")}" maxlength="120" placeholder="KL_TEMP_UPPER_TARGET" required/></label>
      <label class="field-group alarm-name-field"><span>Rule name</span><input class="search-control" name="rule_name" value="${fieldValue("rule_name")}" maxlength="160" placeholder="Upper temperature target" required/></label>
      <label class="field-group"><span>Tolerance mode</span><select class="select-control" name="deviation_mode"><option value="ABSOLUTE" ${selectedOption("ABSOLUTE", deviationMode)}>Absolute unit</option><option value="PERCENT" ${selectedOption("PERCENT", deviationMode)}>Percent of SV</option></select></label>
      <label class="field-group"><span>Tolerance below SV</span><input class="search-control" name="tolerance_low" type="text" inputmode="decimal" value="${fieldValue("tolerance_low", 0)}" required/></label>
      <label class="field-group"><span>Tolerance above SV</span><input class="search-control" name="tolerance_high" type="text" inputmode="decimal" value="${fieldValue("tolerance_high", 0)}" required/></label>
      <label class="field-group"><span>Startup grace</span><div class="alarm-input-unit"><input class="search-control" name="startup_grace_seconds" type="number" min="0" max="86400" value="${fieldValue("startup_grace_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Expected reach time</span><div class="alarm-input-unit"><input class="search-control" name="expected_reach_time_seconds" type="number" min="0" max="604800" value="${fieldValue("expected_reach_time_seconds")}" placeholder="Optional"/><span>sec</span></div></label>
      <label class="field-group"><span>Stable confirmation</span><div class="alarm-input-unit"><input class="search-control" name="stable_confirmation_seconds" type="number" min="0" max="86400" value="${fieldValue("stable_confirmation_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Deviation delay</span><div class="alarm-input-unit"><input class="search-control" name="deviation_delay_seconds" type="number" min="0" max="86400" value="${fieldValue("deviation_delay_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Clear confirmation</span><div class="alarm-input-unit"><input class="search-control" name="clear_confirmation_seconds" type="number" min="0" max="86400" value="${fieldValue("clear_confirmation_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Clear hysteresis</span><input class="search-control" name="hysteresis_value" type="text" inputmode="decimal" value="${fieldValue("hysteresis_value", 0)}"/></label>
      <label class="field-group"><span>Minimum SV change</span><input class="search-control" name="minimum_sv_change" type="text" inputmode="decimal" value="${fieldValue("minimum_sv_change", 0)}"/></label>
      <label class="field-group"><span>SV change confirmation</span><div class="alarm-input-unit"><input class="search-control" name="change_confirmation_seconds" type="number" min="0" max="86400" value="${fieldValue("change_confirmation_seconds", 0)}"/><span>sec</span></div></label>
      <label class="field-group"><span>Severity</span><select class="select-control" name="severity">${["INFO", "WARNING", "CRITICAL"].map((value) => `<option value="${value}" ${selectedOption(value, severity)}>${value}</option>`).join("")}</select></label>
      <label class="field-group"><span>Production impact</span><select class="select-control" name="impact_code">${["PROCESS", "QUALITY", "OUTPUT", "DOWNTIME", "UTILITY", "EQUIPMENT"].map((value) => `<option value="${value}" ${selectedOption(value, impactCode)}>${value}</option>`).join("")}</select></label>
      <label class="field-group alarm-message-field"><span>Alarm message</span><textarea class="search-control" name="alarm_message" maxlength="500">${fieldValue("alarm_message")}</textarea></label>
      <label class="field-group alarm-message-field"><span>Recommendation</span><textarea class="search-control" name="recommendation" maxlength="1000">${fieldValue("recommendation")}</textarea></label>
    </div>
    <div class="deviation-monitor-options"><label><input type="checkbox" name="monitor_reach" ${checked("monitor_reach")}/> Monitor time-to-target</label><label><input type="checkbox" name="monitor_hold" ${checked("monitor_hold")}/> Monitor hold-target</label><label><input type="checkbox" name="pause_on_machine_hold" ${checked("pause_on_machine_hold")}/> Pause timer when machine HOLD</label></div>
    <div class="alarm-rule-form-foot"><span>WARNING/CRITICAL diteruskan ke header alarm; seluruh severity tetap masuk Batch Abnormal Log.</span><div>${editing ? `<button class="button ghost" type="button" data-deviation-rule-cancel>Cancel</button>` : ""}<button class="button primary" type="submit" ${!pvTags.length ? "disabled" : ""}>${editing ? "Update deviation rule" : "Save deviation rule"}</button></div></div>
  </form>` : actualEmpty("Belum ada asset proses aktif.");
  const rows = alarmConfiguration.deviationRules.length ? alarmConfiguration.deviationRules.map((rule) => `<tr>
    <td><strong>${actualText(rule.rule_name)}</strong><small class="mono">${actualText(rule.rule_code)}</small></td>
    <td><strong>${actualText(rule.asset_id || rule.process_type)}</strong><small class="mono">${actualText(rule.pv_tag_code || rule.pv_signal_role)}</small></td>
    <td>${actualText(rule.sv_tag_code || rule.sv_signal_role || rule.setpoint_key)}<small>${actualText(rule.step_code || "Continuous target")}</small></td>
    <td class="mono">-${actualText(rule.tolerance_low)} / +${actualText(rule.tolerance_high)}<small>${actualText(rule.deviation_mode)}</small></td>
    <td class="mono">Reach ${actualText(rule.expected_reach_time_seconds ?? "—")}s<small>Stable ${actualText(rule.stable_confirmation_seconds)}s · Hold ${actualText(rule.deviation_delay_seconds)}s</small></td>
    <td><span class="data-pill ${String(rule.severity).toLowerCase() === "critical" ? "warning" : "neutral"}">${actualText(rule.severity)}</span><small>${actualText(rule.impact_code)}</small></td>
    <td><span class="data-pill ${Number(rule.deviating_count) ? "warning" : "good"}">${Number(rule.deviating_count) ? `${actualText(rule.deviating_count)} DEVIATING` : `${actualText(rule.active_tracker_count)} TRACKERS`}</span></td>
    <td><div class="alarm-rule-row-actions"><button class="button small" data-deviation-rule-edit="${actualText(rule.rule_id)}">Edit</button><button class="button small ${rule.enabled ? "ghost" : "primary"}" data-deviation-rule-toggle="${actualText(rule.rule_id)}" data-rule-enabled="${rule.enabled}">${rule.enabled ? "Disable" : "Enable"}</button></div></td>
  </tr>`).join("") : `<tr><td colspan="8">${actualEmpty("Belum ada process deviation rule.")}</td></tr>`;
  return `<section class="card alarm-rule-configuration process-deviation-configuration" id="process-deviation-configuration">
    <div class="alarm-rule-config-header"><div><span class="eyebrow">BATCH PROCESS DEVIATION</span><h2>PV / SV Target Achievement Rules</h2><p>Konfigurasi reach-time, stable confirmation, hold-target, tolerance, dan revision ketika SV berubah.</p></div><span class="range-badge">${alarmConfiguration.deviationRules.length} RULES</span></div>
    ${form}
    <div class="table-wrap alarm-rule-table-wrap"><table class="data-table alarm-rule-table deviation-rule-table"><thead><tr><th>Rule</th><th>Scope / PV</th><th>SV / Step</th><th>Tolerance</th><th>Timing</th><th>Severity</th><th>Engine State</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

async function saveDeviationRule(form) {
  const submit = form.querySelector('button[type="submit"]');
  if (submit) submit.disabled = true;
  captureDeviationRuleDraft(form);
  const draft = state.alarmConfig.deviationDraft;
  const numericFields = ["tolerance_low", "tolerance_high", "startup_grace_seconds", "stable_confirmation_seconds", "deviation_delay_seconds", "clear_confirmation_seconds", "hysteresis_value", "minimum_sv_change", "change_confirmation_seconds"];
  const payload = { ...draft };
  for (const field of numericFields) {
    payload[field] = alarmDecimal(draft[field]);
    if (!Number.isFinite(payload[field])) {
      showToast("Nilai belum valid", `${field} harus berupa angka.`);
      if (submit) submit.disabled = false;
      return;
    }
  }
  payload.expected_reach_time_seconds = String(draft.expected_reach_time_seconds || "").trim() === "" ? null : Number(draft.expected_reach_time_seconds);
  payload.sv_tag_code = draft.sv_tag_code || null;
  payload.sv_signal_role = draft.sv_signal_role || null;
  payload.setpoint_key = draft.setpoint_key || null;
  payload.step_code = draft.step_code || null;
  if (!payload.sv_tag_code && !payload.sv_signal_role && !payload.setpoint_key) {
    showToast("SV source required", "Pilih SV tag atau isi SV signal role/process setpoint key.");
    if (submit) submit.disabled = false;
    return;
  }
  const ruleId = form.dataset.ruleId;
  try {
    const response = await fetch(ruleId ? `/api/v1/process-deviation-rules/${encodeURIComponent(ruleId)}` : "/api/v1/process-deviation-rules", {
      method: ruleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Process deviation rule gagal disimpan.");
    state.alarmConfig.editingDeviationRuleId = null;
    state.alarmConfig.deviationDraft = {};
    alarmConfiguration.loaded = false;
    showToast(ruleId ? "Deviation rule updated" : "Deviation rule created", `${payload.rule_name} akan dievaluasi pada process run aktif.`);
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Save failed", error instanceof Error ? error.message : "Process deviation rule gagal disimpan.");
    if (submit) submit.disabled = false;
  }
}

async function toggleDeviationRule(ruleId, enabled) {
  try {
    const response = await fetch(`/api/v1/process-deviation-rules/${encodeURIComponent(ruleId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-Operator-Name": "Dashboard Engineer" },
      body: JSON.stringify({ enabled }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Deviation rule status gagal diubah.");
    alarmConfiguration.loaded = false;
    showToast(enabled ? "Deviation rule enabled" : "Deviation rule disabled", "Perubahan disimpan di PostgreSQL.");
    await requestAlarmConfiguration(true);
  } catch (error) {
    showToast("Update failed", error instanceof Error ? error.message : "Deviation rule status gagal diubah.");
  }
}

async function acknowledgeActualAlarm(alarmEventId) {
  try {
    const response = await fetch(`/api/v1/alarm-events/${encodeURIComponent(alarmEventId)}/acknowledge`, { method: "PATCH", headers: { "X-Operator-Name": "Dashboard Operator" } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Acknowledge gagal.");
    showToast("Alarm acknowledged", `${result.alarm?.title || "Alarm"} dicatat oleh Dashboard Operator.`);
    await connectNonJetflowBackend();
  } catch (error) {
    showToast("Acknowledge failed", error instanceof Error ? error.message : "Acknowledge gagal.");
  }
}
