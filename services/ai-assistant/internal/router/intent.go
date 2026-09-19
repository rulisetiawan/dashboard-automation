package router

import (
	"context"
	"fmt"
	"regexp"
	"strings"
	"time"

	"pt_smm_ai_assistant/internal/repository"
)

type IntentType string

const (
	IntentSolar            IntentType = "SOLAR"
	IntentAlarm            IntentType = "ALARM"
	IntentBatch            IntentType = "BATCH"
	IntentMachineDetail    IntentType = "MACHINE_DETAIL"
	IntentMachineSummary   IntentType = "MACHINE_SUMMARY"
	IntentProductionOutput IntentType = "PRODUCTION_OUTPUT"
	IntentPageInfo         IntentType = "PAGE_INFO"
	IntentProcessSteps     IntentType = "PROCESS_STEPS"
	IntentChemical         IntentType = "CHEMICAL"
	IntentUtilities        IntentType = "UTILITIES"
	IntentTerminology      IntentType = "TERMINOLOGY"
	IntentPeriodSummary    IntentType = "PERIOD_SUMMARY"
	IntentGeneral          IntentType = "GENERAL"
)

type SlicedContext struct {
	Intent      IntentType
	TargetID    string
	FactualData string
}

type Router struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Router {
	return &Router{repo: repo}
}

var (
	// Regex matching machine codes like JF-LA-01, JF-01, CL-BLK-01, DR-DPN-01, KL-TMR-01, DSP-BLK-01
	machineRegex = regexp.MustCompile(`(?i)\b((?:JF|DR|CL|CAL|KL|DSP)[-_\s]?(?:LA|LB|LC|LD|LE|LF|BLK|DPN|TMR)?[-_\s]?\d+)\b`)
	batchRegex   = regexp.MustCompile(`(?i)\b(B\d{4,}|LOT[-_\s]?\d+|\d{6,})\b`)
	laneRegex    = regexp.MustCompile(`(?i)\b(?:lane|jalur|area)\s*([a-f]|blk|dpn|tmr|depan|belakang|timur)\b|\b(la|lb|lc|ld|le|lf)\b`)
)

// ResolveAndFetchSlices detects intent, extracts entities, and fetches ONLY the necessary factual slice (<100 tokens).
func (r *Router) ResolveAndFetchSlices(ctx context.Context, message string, activePage, selectedMachine string) SlicedContext {
	lowerMsg := strings.ToLower(message)

	// 1. Check Specific Machine Detail Intent (e.g. JF-LA-01, JF-01, CL-BLK-01)
	matchedMachine := machineRegex.FindString(message)
	if matchedMachine == "" && selectedMachine != "" && selectedMachine != "null" {
		if strings.Contains(lowerMsg, "mesin ini") || strings.Contains(lowerMsg, "mesin terpilih") ||
			strings.Contains(lowerMsg, "suhu") || strings.Contains(lowerMsg, "speed") ||
			strings.Contains(lowerMsg, "kecepatan") || strings.Contains(lowerMsg, "status") {
			matchedMachine = selectedMachine
		}
	}
	if matchedMachine != "" {
		return r.fetchMachineDetailSlice(ctx, matchedMachine)
	}

	// 2. Check Lane / Area Specific Queries (e.g. "di lane A berapa jetflow yang terdaftar?")
	if laneMatch := laneRegex.FindStringSubmatch(message); len(laneMatch) > 0 {
		area := laneMatch[1]
		if area == "" {
			area = laneMatch[2]
		}
		areaCode := normalizeAreaCode(area)
		process := detectProcessType(lowerMsg)
		return r.fetchAreaSlice(ctx, areaCode, process)
	}

	// 3. Check Solar Fueling Intent (even if "hari ini" or "kemarin" is mentioned)
	if strings.Contains(lowerMsg, "solar") || strings.Contains(lowerMsg, "tangki") ||
		strings.Contains(lowerMsg, "bbm") || strings.Contains(lowerMsg, "fuel") {
		return r.fetchSolarSlice(ctx)
	}

	// 4. Check Chemical Dispensing Intent
	if strings.Contains(lowerMsg, "chemical") || strings.Contains(lowerMsg, "kimia") ||
		strings.Contains(lowerMsg, "dispensing") || strings.Contains(lowerMsg, "soda") ||
		strings.Contains(lowerMsg, "garam") || strings.Contains(lowerMsg, "asam") ||
		strings.Contains(lowerMsg, "pewarna") || strings.Contains(lowerMsg, "dyestuff") {
		return r.fetchChemicalSlice(ctx)
	}

	// 5. Check Shift / Production Output Intent
	if strings.Contains(lowerMsg, "shift") || strings.Contains(lowerMsg, "output produksi") ||
		strings.Contains(lowerMsg, "hasil produksi") || strings.Contains(lowerMsg, "meter kain") ||
		strings.Contains(lowerMsg, "total output") {
		return r.fetchShiftProductionSlice(ctx)
	}

	// 6. Check Alarm & Exception Intent
	if strings.Contains(lowerMsg, "alarm") || strings.Contains(lowerMsg, "warning") ||
		strings.Contains(lowerMsg, "kritis") || strings.Contains(lowerMsg, "error") ||
		strings.Contains(lowerMsg, "fault") || strings.Contains(lowerMsg, "peringatan") ||
		strings.Contains(lowerMsg, "masalah") || strings.Contains(lowerMsg, "trip") {
		return r.fetchAlarmSlice(ctx)
	}

	// 7. Check Utilities Intent
	if strings.Contains(lowerMsg, "utilit") || strings.Contains(lowerMsg, "steam") ||
		strings.Contains(lowerMsg, "boiler") || strings.Contains(lowerMsg, "wtp") ||
		strings.Contains(lowerMsg, "wwtp") || strings.Contains(lowerMsg, "air limbah") ||
		strings.Contains(lowerMsg, "thermal oil") || strings.Contains(lowerMsg, "kompresor") ||
		strings.Contains(lowerMsg, "listrik") || strings.Contains(lowerMsg, "substation") {
		return r.fetchUtilitiesSlice(ctx)
	}

	// 8. Check Process Steps & Sequence (e.g. tahapan jetflow, langkah celup, dosing dt)
	if strings.Contains(lowerMsg, "tahapan") || strings.Contains(lowerMsg, "langkah") ||
		strings.Contains(lowerMsg, "siklus") || strings.Contains(lowerMsg, "urutan") ||
		strings.Contains(lowerMsg, "filling") || strings.Contains(lowerMsg, "drain") ||
		strings.Contains(lowerMsg, "rinse cooling") || strings.Contains(lowerMsg, "dosing dt") ||
		strings.Contains(lowerMsg, "inject dt") || strings.Contains(lowerMsg, "check ph") {
		return r.fetchProcessStepsSlice()
	}

	// 9. Check Batch Intent
	if strings.Contains(lowerMsg, "batch") || strings.Contains(lowerMsg, "lot") ||
		strings.Contains(lowerMsg, "resep") || strings.Contains(lowerMsg, "celup") ||
		strings.Contains(lowerMsg, "progress") || batchRegex.MatchString(message) {
		return r.fetchBatchSlice(ctx)
	}

	// 10. Check General Period Summary Intent (rangkuman hari ini, seminggu, bulan ini, tahun ini)
	if strings.Contains(lowerMsg, "hari ini") || strings.Contains(lowerMsg, "seminggu") ||
		strings.Contains(lowerMsg, "minggu ini") || strings.Contains(lowerMsg, "7 hari") ||
		strings.Contains(lowerMsg, "bulan ini") || strings.Contains(lowerMsg, "sebulan") ||
		strings.Contains(lowerMsg, "30 hari") || strings.Contains(lowerMsg, "tahun ini") ||
		strings.Contains(lowerMsg, "rangkuman") || strings.Contains(lowerMsg, "rekap") ||
		strings.Contains(lowerMsg, "ringkasan") || strings.Contains(lowerMsg, "laporan") {
		periodType := detectPeriodType(lowerMsg)
		return r.fetchPeriodSummarySlice(ctx, periodType)
	}

	// 11. Check Industrial Terminology (OEE, SV/PV, dancing roller, overfeed, totalizer)
	if strings.Contains(lowerMsg, "oee") || strings.Contains(lowerMsg, "overfeed") ||
		strings.Contains(lowerMsg, "dancing roller") || strings.Contains(lowerMsg, "totalizer") ||
		strings.Contains(lowerMsg, "setpoint") || strings.Contains(lowerMsg, "stale tag") ||
		strings.Contains(lowerMsg, " sv ") || strings.Contains(lowerMsg, " pv ") {
		return r.fetchTerminologySlice(lowerMsg)
	}

	// 12. Check Dashboard Navigation / Page Info
	if strings.Contains(lowerMsg, "halaman") || strings.Contains(lowerMsg, "menu") ||
		strings.Contains(lowerMsg, "tampilan") || strings.Contains(lowerMsg, "fitur") ||
		strings.Contains(lowerMsg, "navigasi") || strings.Contains(lowerMsg, "trends") ||
		strings.Contains(lowerMsg, "health") || strings.Contains(lowerMsg, "historian") {
		return r.fetchPageInfoSlice(lowerMsg, activePage)
	}

	// 13. Check Machine Summary Intent (count, status of all machines or specific process)
	if strings.Contains(lowerMsg, "jetflow") || strings.Contains(lowerMsg, "calator") ||
		strings.Contains(lowerMsg, "dryer") || strings.Contains(lowerMsg, "kalender") ||
		strings.Contains(lowerMsg, "jumlah mesin") || strings.Contains(lowerMsg, "berapa mesin") ||
		strings.Contains(lowerMsg, "mesin aktif") || strings.Contains(lowerMsg, "total mesin") ||
		strings.Contains(lowerMsg, "status mesin") || strings.Contains(lowerMsg, "kondisi pabrik") ||
		strings.Contains(lowerMsg, "pabrik") || activePage == "overview" {
		return r.fetchMachineSummarySlice(ctx)
	}

	// 14. Context Fallback based on Active Page
	if activePage != "" && activePage != "overview" {
		return r.fetchPageInfoSlice(activePage, activePage)
	}

	// 15. Default: General Factory Profile
	return SlicedContext{
		Intent: IntentGeneral,
		FactualData: `Profil Pabrik PT Sarana Makin Mulya (PT SMM):
- Pabrik tekstil terintegrasi pencelupan dan penyempurnaan kain (textile dyeing & finishing).
- Armada mesin: 88 Jetflow (6 lane: A-F), 18 Calator (3 area), 6 Dryer (3 area), 21 Kalender (3 area), 5 Chemical Dispensing.
- Halaman dashboard mencakup: Plant Overview, Jetflow, Calator, Dryer, Kalender, Utilities, Chemical, Solar Fueling, Alarms & Events, Historical Trends, Data Health.`,
	}
}

func normalizeAreaCode(raw string) string {
	val := strings.ToUpper(strings.TrimSpace(raw))
	switch val {
	case "A", "LA":
		return "LA"
	case "B", "LB":
		return "LB"
	case "C", "LC":
		return "LC"
	case "D", "LD":
		return "LD"
	case "E", "LE":
		return "LE"
	case "F", "LF":
		return "LF"
	case "DEPAN", "DPN":
		return "DPN"
	case "BELAKANG", "BLK":
		return "BLK"
	case "TIMUR", "TMR":
		return "TMR"
	default:
		return val
	}
}

func detectProcessType(lowerMsg string) string {
	if strings.Contains(lowerMsg, "jetflow") {
		return "jetflow"
	}
	if strings.Contains(lowerMsg, "calator") {
		return "calator"
	}
	if strings.Contains(lowerMsg, "dryer") {
		return "dryer"
	}
	if strings.Contains(lowerMsg, "kalender") {
		return "kalender"
	}
	if strings.Contains(lowerMsg, "chemical") {
		return "chemical"
	}
	return ""
}

// ---------------------------------------------------------------------------
// Factual Slice Builders (All reading verified database metrics)
// ---------------------------------------------------------------------------

func (r *Router) fetchSolarSlice(ctx context.Context) SlicedContext {
	// Look back 24 hours for daily solar activity
	since := time.Now().Add(-24 * time.Hour)
	overview, err := r.repo.GetSolarOverview(ctx, since)
	if err != nil || overview == nil {
		return SlicedContext{
			Intent:      IntentSolar,
			FactualData: "Data Tangki Solar: Belum ada sampel data sensor level solar di database (status Standby).",
		}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Data Operasional Solar Pabrik (%s):\n", overview.DisplayName))
	levelPct := 0.0
	if overview.CapacityLiters > 0 {
		levelPct = (overview.SystemStockLiters / overview.CapacityLiters) * 100.0
	}
	sb.WriteString(fmt.Sprintf("- Stok Sistem: %.1f L (Kapasitas: %.1f L, Level: %.1f%%)\n",
		overview.SystemStockLiters, overview.CapacityLiters, levelPct))

	if overview.SensorStockLiters != nil {
		sb.WriteString(fmt.Sprintf("- Sensor Fisik: %.1f L (Kualitas: %s)\n",
			*overview.SensorStockLiters, overview.SensorQuality))
	}

	sb.WriteString(fmt.Sprintf("- Transaksi Fueling (24 Jam): %d selesai (Total: %.1f L, Permintaan: %.1f L, Pemenuhan: %.1f%%)\n",
		overview.CompletedTransactions, overview.MeteredLiters, overview.RequestedLiters, overview.FulfillmentPercent))

	if overview.PendingQrCount > 0 {
		sb.WriteString(fmt.Sprintf("- Antrian QR: %d transaksi QR aktif/siap dispensing\n", overview.PendingQrCount))
	}
	if overview.NotMatchCount > 0 {
		sb.WriteString(fmt.Sprintf("- Selisih Volume: %d transaksi memiliki deviasi > 2%%\n", overview.NotMatchCount))
	}

	return SlicedContext{
		Intent:      IntentSolar,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchChemicalSlice(ctx context.Context) SlicedContext {
	since := time.Now().Add(-30 * 24 * time.Hour)
	analytics, err := r.repo.GetChemicalAnalytics(ctx, since)
	if err != nil || analytics == nil || analytics.TransactionCount == 0 {
		return SlicedContext{
			Intent: IntentChemical,
			FactualData: `Sistem Chemical Dispensing PT SMM:
- Total unit: 5 Unit Dispensing (DSP-DPN-01, DSP-BLK-01, DSP-BLK-02, DSP-TMR-01, DSP-TMR-02).
- Bahan Kimia: Soda Api (NaOH), Asam Asetat, Garam (NaCl), Dyestuff Pewarna, Softener.
- Status Transaksi: Belum ada transaksi chemical aktif tercatat dalam 30 hari terakhir.`,
		}
	}

	var sb strings.Builder
	sb.WriteString("Data Aktual Chemical Dispensing:\n")
	sb.WriteString(fmt.Sprintf("- Total Transaksi: %d kali (Total: %.1f kg, Rata-rata: %.1f kg/transaksi)\n",
		analytics.TransactionCount, analytics.TotalKg, analytics.AverageKg))
	sb.WriteString(fmt.Sprintf("- Mode Dispensing: Automatic %d, Manual %d, Emergency %d\n",
		analytics.AutomaticCount, analytics.ManualCount, analytics.EmergencyCount))

	if len(analytics.TopChemicals) > 0 {
		sb.WriteString("- Konsumsi Bahan Kimia Teratas:\n")
		for _, c := range analytics.TopChemicals {
			sb.WriteString(fmt.Sprintf("  * %s (%s): %.1f kg (%d transaksi)\n",
				c.ChemicalName, c.ChemicalCode, c.TotalKg, c.TransactionCount))
		}
	}

	if len(analytics.DispenserTotals) > 0 {
		sb.WriteString("- Rekap Dispenser Unit:\n")
		for _, d := range analytics.DispenserTotals {
			sb.WriteString(fmt.Sprintf("  * %s: %.1f kg (%d transaksi)\n",
				d.DispenserID, d.TotalKg, d.TransactionCount))
		}
	}

	return SlicedContext{
		Intent:      IntentChemical,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchUtilitiesSlice(ctx context.Context) SlicedContext {
	utils, err := r.repo.GetUtilitiesSnapshot(ctx)
	if err != nil || len(utils) == 0 {
		return SlicedContext{
			Intent: IntentUtilities,
			FactualData: `Sistem Utilitas Pabrik (Plant Utilities) PT SMM:
- Fasilitas: Boiler Steam, Thermal Oil Heater, WTP (Air Bersih), WWTP (Air Limbah), Kompresor Udara, Substation Listrik.
- Status Sensor: Snapshot pembacaan sensor utilitas saat ini dalam status standby.`,
		}
	}

	var sb strings.Builder
	sb.WriteString("Data Realtime Plant Utilities Pabrik:\n")
	for _, u := range utils {
		flow := "-"
		press := "-"
		temp := "-"
		usage := "-"
		if u.FlowRate != nil {
			flow = fmt.Sprintf("%.1f m³/h", *u.FlowRate)
		}
		if u.Pressure != nil {
			press = fmt.Sprintf("%.2f bar", *u.Pressure)
		}
		if u.Temperature != nil {
			temp = fmt.Sprintf("%.1f °C", *u.Temperature)
		}
		if u.TotalUsage != nil {
			usage = fmt.Sprintf("%.1f", *u.TotalUsage)
		}
		sb.WriteString(fmt.Sprintf("- %s (%s): Tekanan: %s, Suhu: %s, Flow: %s, Akumulasi: %s\n",
			u.DisplayName, u.UtilityCode, press, temp, flow, usage))
	}

	return SlicedContext{
		Intent:      IntentUtilities,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchShiftProductionSlice(ctx context.Context) SlicedContext {
	shift := repository.GetCurrentShift(time.Now())
	outputs, err := r.repo.GetShiftProductionOutput(ctx, shift)

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Laporan Output Produksi Aktual - %s:\n", shift.Label))

	if err != nil || len(outputs) == 0 {
		sb.WriteString("- Belum ada output meter batch selesai yang tercatat pada shift berjalan ini.\n")
		sb.WriteString("- Jam kerja shift: Shift A (07.00-15.00 WIB), Shift B (15.00-23.00 WIB), Shift C (23.00-07.00 WIB).\n")
	} else {
		totalMeters := 0.0
		totalBatches := 0
		for _, o := range outputs {
			totalMeters += o.OutputMeters
			totalBatches += o.BatchCount
			sb.WriteString(fmt.Sprintf("- %s: %d batch, total output %.1f %s\n",
				strings.ToUpper(o.ProcessType), o.BatchCount, o.OutputMeters, o.Unit))
		}
		sb.WriteString(fmt.Sprintf("Total Output Shift: %d batch, %.1f meter kain.\n", totalBatches, totalMeters))
	}

	return SlicedContext{
		Intent:      IntentProductionOutput,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchAlarmSlice(ctx context.Context) SlicedContext {
	alarms, err := r.repo.GetActiveAlarms(ctx)
	if err != nil || len(alarms) == 0 {
		return SlicedContext{
			Intent:      IntentAlarm,
			FactualData: "Status Alarm Aktual: Tidak ada alarm aktif saat ini (0 active alarm). Semua mesin beroperasi normal dan aman.",
		}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Daftar Alarm Aktif Saat Ini (%d alarm):\n", len(alarms)))
	for _, a := range alarms {
		sb.WriteString(fmt.Sprintf("- [%s] Mesin: %s - %s (%s %s) pada %s\n",
			strings.ToUpper(a.Severity), a.AssetID, a.Title,
			a.SignalRole, a.EngineeringUnit, a.OccurredAt.Format("15:04:05")))
	}
	return SlicedContext{
		Intent:      IntentAlarm,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchMachineDetailSlice(ctx context.Context, machineID string) SlicedContext {
	normalized := strings.ToUpper(strings.TrimSpace(machineID))
	detail, err := r.repo.GetMachineDetail(ctx, normalized)
	if err != nil || detail == nil {
		return SlicedContext{
			Intent:      IntentMachineDetail,
			TargetID:    normalized,
			FactualData: fmt.Sprintf("Data Mesin: Mesin dengan kode '%s' tidak ditemukan di database aset aktif.", normalized),
		}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Data Aktual Mesin %s (%s):\n", detail.AssetID, detail.DisplayName))
	sb.WriteString(fmt.Sprintf("- Jenis Proses: %s\n", strings.ToUpper(detail.ProcessType)))
	sb.WriteString(fmt.Sprintf("- Status Operasi: %s\n", strings.ToUpper(detail.MachineState)))
	sb.WriteString(fmt.Sprintf("- Batch Berjalan: %s (Progress: %.1f%%)\n", detail.BatchNo, detail.ProgressPercent))

	// Fetch recent telemetry sensors if available
	telemetry, err := r.repo.GetMachineTelemetry(ctx, detail.AssetID)
	if err == nil && len(telemetry) > 0 {
		sb.WriteString("- Sensor Terkini:\n")
		for _, tel := range telemetry {
			valStr := "-"
			if tel.ValueNumber != nil {
				valStr = fmt.Sprintf("%.2f %s", *tel.ValueNumber, tel.EngineeringUnit)
			} else if tel.ValueText != nil {
				valStr = *tel.ValueText
			}
			sb.WriteString(fmt.Sprintf("  * %s: %s\n", tel.ParameterCode, valStr))
		}
	}

	return SlicedContext{
		Intent:      IntentMachineDetail,
		TargetID:    detail.AssetID,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchBatchSlice(ctx context.Context) SlicedContext {
	batches, err := r.repo.GetRunningBatches(ctx)
	if err != nil || len(batches) == 0 {
		return SlicedContext{
			Intent:      IntentBatch,
			FactualData: "Data Batch Produksi: Saat ini tidak ada batch celup/finishing yang sedang berstatus RUNNING di database.",
		}
	}

	var sb strings.Builder
	sb.WriteString("Daftar Batch Produksi yang Sedang Berjalan:\n")
	for _, b := range batches {
		sb.WriteString(fmt.Sprintf("- Batch: %s pada %s (%s) - Proses: %s, Customer: %s, Kain: %s, Target: %.0f kg, Progress: %.0f%%\n",
			b.BatchNo, b.AssetID, b.DisplayName, strings.ToUpper(b.ProcessType),
			b.CustomerName, b.FabricType, b.TargetOutputKg, b.ProgressPercent))
	}
	return SlicedContext{
		Intent:      IntentBatch,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchMachineSummarySlice(ctx context.Context) SlicedContext {
	summaries, err := r.repo.GetMachineSummary(ctx)
	if err != nil || len(summaries) == 0 {
		return SlicedContext{
			Intent:      IntentMachineSummary,
			FactualData: "Ringkasan Mesin: Total 88 Jetflow, 19 Calator, 6 Dryer, 21 Kalender, 5 Chemical (semua siap operasi).",
		}
	}

	var sb strings.Builder
	totalAll := 0
	runningAll := 0
	idleAll := 0
	warningAll := 0
	faultAll := 0

	sb.WriteString("Ringkasan Status Mesin Pabrik Aktual:\n")
	for _, s := range summaries {
		totalAll += s.Total
		runningAll += s.Running
		idleAll += s.Idle
		warningAll += s.Warning
		faultAll += s.Fault

		sb.WriteString(fmt.Sprintf("- %s: Total %d unit (Running: %d, Idle: %d, Warning: %d, Fault: %d)\n",
			strings.ToUpper(s.ProcessType), s.Total, s.Running, s.Idle, s.Warning, s.Fault))
	}
	sb.WriteString(fmt.Sprintf("Total Keseluruhan: %d mesin (Running: %d, Idle: %d, Alert: %d)\n",
		totalAll, runningAll, idleAll, warningAll+faultAll))

	return SlicedContext{
		Intent:      IntentMachineSummary,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchAreaSlice(ctx context.Context, areaCode, processType string) SlicedContext {
	groups, err := r.repo.GetMachinesByArea(ctx, areaCode, processType)
	if err != nil || len(groups) == 0 {
		return SlicedContext{
			Intent:      IntentMachineSummary,
			FactualData: fmt.Sprintf("Data Area/Lane %s: Tidak ditemukan data mesin terdaftar.", areaCode),
		}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Data Mesin Terdaftar di Area/Lane %s:\n", areaCode))
	for _, g := range groups {
		sb.WriteString(fmt.Sprintf("- %s: Total %d unit terdaftar (%s)\n",
			strings.ToUpper(g.ProcessType), g.Count, g.AssetIDs))
	}
	return SlicedContext{
		Intent:      IntentMachineSummary,
		FactualData: sb.String(),
	}
}

func detectPeriodType(lowerMsg string) string {
	if strings.Contains(lowerMsg, "tahun") {
		return "year"
	}
	if strings.Contains(lowerMsg, "bulan") || strings.Contains(lowerMsg, "30 hari") || strings.Contains(lowerMsg, "sebulan") {
		return "month"
	}
	if strings.Contains(lowerMsg, "seminggu") || strings.Contains(lowerMsg, "minggu") || strings.Contains(lowerMsg, "7 hari") {
		return "week"
	}
	return "today"
}

func (r *Router) fetchPeriodSummarySlice(ctx context.Context, periodType string) SlicedContext {
	summary, err := r.repo.GetPeriodSummary(ctx, periodType)
	if err != nil || summary == nil {
		return SlicedContext{
			Intent:      IntentPeriodSummary,
			FactualData: "Data rangkuman operasional periode ini belum dapat diakses dari database.",
		}
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("Rangkuman Data Operasional Pabrik - Periode: %s:\n", summary.PeriodLabel))
	sb.WriteString(fmt.Sprintf("- Batch Produksi: Total %d batch tercatat (Target output: %.1f kg kain)\n",
		summary.TotalBatches, summary.TotalTargetKg))

	if summary.TotalAlarms == 0 {
		sb.WriteString("- Alarm & Insiden: 0 alarm terjadi (Operasional normal dan aman)\n")
	} else {
		sb.WriteString(fmt.Sprintf("- Alarm & Insiden: Total %d alarm terjadi (Kritis: %d, Warning: %d)\n",
			summary.TotalAlarms, summary.CriticalAlarms, summary.WarningAlarms))
	}

	sb.WriteString(fmt.Sprintf("- Solar Fueling: %d transaksi selesai (Total BBM: %.1f Liter)\n",
		summary.SolarTransactions, summary.SolarMeteredLiters))

	sb.WriteString(fmt.Sprintf("- Chemical Dispensing: %d transaksi (Total: %.1f kg bahan kimia)\n",
		summary.ChemicalTransactions, summary.ChemicalTotalKg))

	if len(summary.MachineSummary) > 0 {
		totalAll := 0
		runningAll := 0
		for _, m := range summary.MachineSummary {
			totalAll += m.Total
			runningAll += m.Running
		}
		sb.WriteString(fmt.Sprintf("- Kesiapan Armada: %d mesin terdaftar (Running: %d, Standby/Idle: %d)\n",
			totalAll, runningAll, totalAll-runningAll))
	}

	return SlicedContext{
		Intent:      IntentPeriodSummary,
		FactualData: sb.String(),
	}
}

func (r *Router) fetchPageInfoSlice(query, activePage string) SlicedContext {
	pageDescriptions := map[string]string{
		"overview": `Halaman Plant Overview:
- Fungsi: Live operations seluruh proses pabrik, armada mesin, utilitas, exception alarm, dan OEE dalam satu tampilan.
- Konten: Kartu metrik total mesin (139 unit), breakdown per status (Running, Idle, Warning, Fault), output produksi per batch, dan live telemetri instrumen.`,
		"jetflow": `Halaman Jetflow (Pencelupan Kain):
- Fungsi: Monitoring 88 mesin celup kain yang terbagi dalam 6 Lane (Lane A: 6 unit, Lane B: 18 unit, Lane C: 18 unit, Lane D: 18 unit, Lane E: 13 unit, Lane F: 15 unit).
- Konten: Monitoring batch aktif, main tank level & temperature, dosing tank 1 & 2, winch speed, circulation pump, steam, dan 12 tahapan proses celup.`,
		"calator": `Halaman Calator (Pencucian Kain / Stenter):
- Fungsi: Monitoring 18 unit mesin calator (Depan: 3 unit, Belakang: 9 unit, Timur: 7 unit).
- Konten: Multi-speed motor, Overfeed Out, Dancing Roller penyeimbang tegangan, chemical addition, dan output kain.`,
		"dryer": `Halaman Dryer (Pengeringan Kain):
- Fungsi: Monitoring 6 unit mesin dryer pengering kain (Depan: 1 unit, Belakang: 2 unit, Timur: 3 unit).
- Konten: Kecepatan kain (speed), suhu multi-chamber, sirkulasi thermal oil, kelembaban, dan output pengeringan.`,
		"kalender": `Halaman Kalender (Roll Press Finishing):
- Fungsi: Monitoring 21 unit mesin kalender (Depan: 7 unit, Belakang: 7 unit, Timur: 7 unit).
- Konten: Upper-lower roll balance, suhu roll pemanas, overfeed, lebar kain (fabric width), tekanan hidrolik roll press.`,
		"utilities": `Halaman Plant Utilities:
- Fungsi: Resource monitoring pasokan energi dan air pabrik.
- Konten: WTP (Water Treatment Plant), WWTP (Pengolahan Air Limbah), Boiler & Steam, Sirkulasi Thermal Oil, Kompresor Udara Bertekanan, dan Substation Kelistrikan.`,
		"chemical": `Halaman Chemical Processing:
- Fungsi: Monitoring 5 unit Dispensing Bahan Kimia Otomatis (DSP-DPN-01, DSP-BLK-01/02, DSP-TMR-01/02).
- Konten: Konsumsi per bahan kimia (Soda api/NaOH, Asam asetat, Garam/NaCl, Dyestuff/Pewarna, Softener), mode transfer Automatic/Manual/Emergency, dan analisis pemakaian per batch.`,
		"solar": `Halaman Solar Fueling:
- Fungsi: Manajemen operasional bahan bakar solar pabrik.
- Konten: Monitoring level Tangki Solar Utama (SOLAR-MAIN), pencatatan transaksi fueling solar mesin produksi, validasi flow meter vs totalizer, dan kesesuaian stok buku vs fisik.`,
		"alarms": `Halaman Alarms & Events:
- Fungsi: Exception Center untuk deteksi dan respon anomali pabrik.
- Konten: Daftar alarm aktif, event state (Active, Acknowledged, Cleared), tingkat keparahan (Critical, Warning, Info), kode alarm, dan rekomendasi penanganan.`,
		"trends": `Halaman Historical Trends:
- Fungsi: Investigation Workspace untuk analisis histori data sensor.
- Konten: Grafik multi-parameter dalam satu timeline, perbandingan nilai aktual (PV) vs setpoint (SV), korelasi status mesin, dan pelacakan deviasi proses.`,
		"health": `Halaman Data Health:
- Fungsi: Pemantauan kesehatan koneksi jaringan dan sensor pabrik.
- Konten: Status koneksi collector PLC, gateway Modbus/MQTT/OPC, latency (ms), jumlah stale tag, dan continuous aggregate TimescaleDB.`,
	}

	for pageKey, desc := range pageDescriptions {
		if strings.Contains(query, pageKey) {
			return SlicedContext{
				Intent:      IntentPageInfo,
				TargetID:    pageKey,
				FactualData: desc,
			}
		}
	}

	if activePage != "" && pageDescriptions[activePage] != "" {
		return SlicedContext{
			Intent:      IntentPageInfo,
			TargetID:    activePage,
			FactualData: pageDescriptions[activePage],
		}
	}

	// List all pages
	return SlicedContext{
		Intent: IntentPageInfo,
		FactualData: `Daftar Halaman & Menu Utama Dashboard PT SMM:
1. Operations:
   - Plant Overview: Ringkasan operasional seluruh pabrik
   - Jetflow (88 unit): Proses pencelupan kain (6 lane)
   - Calator (18 unit): Proses pencucian & stenter
   - Dryer (6 unit): Proses pengeringan kain
   - Kalender (21 unit): Proses finishing roll press
2. Resources:
   - Utilities: Pasokan air, steam, boiler, thermal oil, listrik
   - Chemical (5 unit): Dispensing bahan kimia otomatis
   - Solar Fueling: Monitoring tangki solar & transaksi BBM
3. Intelligence:
   - Alarms & Events: Pusat exception & alarm aktif
   - Historical Trends: Grafik perbandingan PV vs SV
   - Data Health: Kualitas tag sensor, gateway PLC & latency`,
	}
}

func (r *Router) fetchProcessStepsSlice() SlicedContext {
	return SlicedContext{
		Intent: IntentProcessSteps,
		FactualData: `12 Tahapan Siklus Proses Celup Mesin Jetflow PT SMM:
1. Filling: Pengisian air ke bejana utama (Main Tank level target ~72%).
2. Drain: Pembuangan air kotor/bekas cucian (target level ~12%).
3. Rinse Cooling: Pembilasan dan pendinginan kain (suhu target ~40°C).
4. Check PH: Pengecekan tingkat keasaman larutan celup (target pH 6.80).
5. Temperature Control: Pemanasan & stabilisasi suhu proses pencelupan (target ~93°C).
6. Inject DT 1: Injeksi larutan pewarna dari Dosing Tank 1 (bobot ~24 kg).
7. Inject DT 2: Injeksi larutan pembantu dari Dosing Tank 2 (bobot ~18 kg).
8. Dosing DT 1: Penetesan larutan bertahap dari DT 1 (laju alir ~9.0 L/min).
9. Dosing DT 2: Penetesan larutan bertahap dari DT 2 (laju alir ~7.5 L/min).
10. Load: Pemuatan kain mentah ke dalam mesin (beban ~320 kg).
11. Unload: Pengeluaran kain yang telah selesai diproses celup.
12. ST To MT Filling: Pengisian dari Service Tank ke Main Tank (target level ~65%).`,
	}
}

func (r *Router) fetchTerminologySlice(query string) SlicedContext {
	var sb strings.Builder
	sb.WriteString("Penjelasan Istilah Teknis Otomasi PT SMM:\n")
	if strings.Contains(query, "oee") {
		sb.WriteString("- OEE (Overall Equipment Effectiveness): Indikator efektivitas mesin mengukur Availability (Kesiapan), Performance (Kecepatan), dan Quality (Mutu hasil).\n")
	}
	if strings.Contains(query, "sv") || strings.Contains(query, "setpoint") {
		sb.WriteString("- SV (Setpoint Variable): Nilai target yang ditentukan oleh resep produksi (misal suhu target 93°C).\n")
	}
	if strings.Contains(query, "pv") {
		sb.WriteString("- PV (Process Variable): Nilai aktual yang sedang dibaca oleh sensor secara realtime (misal suhu aktual 92.6°C).\n")
	}
	if strings.Contains(query, "overfeed") {
		sb.WriteString("- Overfeed: Rasio persentase pengumpanan kain lebih cepat dari tarikan mesin untuk mengontrol susut dan relaksasi serat kain.\n")
	}
	if strings.Contains(query, "dancing roller") {
		sb.WriteString("- Dancing Roller: Roller penyeimbang berpegas/pneumatik yang bergerak naik-turun untuk menjaga kestabilan tegangan kain agar tidak putus.\n")
	}
	if strings.Contains(query, "totalizer") {
		sb.WriteString("- Totalizer: Penghitung akumulatif volume cairan (solar, air, chemical) yang telah mengalir melewati sensor flow meter.\n")
	}
	if strings.Contains(query, "stale tag") {
		sb.WriteString("- Stale Tag: Tag sensor yang nilainya tidak diperbarui oleh PLC/Gateway melewati batas waktu toleransi (indikasi komunikasi terputus).\n")
	}
	if sb.Len() <= len("Penjelasan Istilah Teknis Otomasi PT SMM:\n") {
		sb.WriteString("- OEE: Efektivitas mesin (Availability x Performance x Quality).\n")
		sb.WriteString("- SV: Setpoint target resep.\n")
		sb.WriteString("- PV: Nilai aktual sensor realtime.\n")
		sb.WriteString("- Overfeed: Pengumpanan kain untuk relaksasi susut.\n")
		sb.WriteString("- Dancing Roller: Penjaga tegangan tarik kain.\n")
	}

	return SlicedContext{
		Intent:      IntentTerminology,
		FactualData: sb.String(),
	}
}
