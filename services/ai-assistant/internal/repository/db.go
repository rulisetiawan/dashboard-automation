package repository

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Repository provides strictly READ-ONLY SELECT queries to the database.
type Repository struct {
	pool *pgxpool.Pool
}

func New(ctx context.Context, connString string) (*Repository, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("parse db config: %w", err)
	}

	config.MaxConns = 5
	config.MinConns = 1
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}

	return &Repository{pool: pool}, nil
}

func (r *Repository) Close() {
	if r.pool != nil {
		r.pool.Close()
	}
}

// ---------------------------------------------------------------------------
// 1. Machine Fleets & Summary (Mirrors api.controller.ts)
// ---------------------------------------------------------------------------

type MachineSummary struct {
	ProcessType string
	Total       int
	Running     int
	Warning     int
	Fault       int
	Idle        int
}

func (r *Repository) GetMachineSummary(ctx context.Context) ([]MachineSummary, error) {
	query := `
		SELECT a.process_type,
		       count(*)::int AS total,
		       count(*) FILTER (WHERE s.machine_state = 'running')::int AS running,
		       count(*) FILTER (WHERE s.machine_state = 'warning')::int AS warning,
		       count(*) FILTER (WHERE s.machine_state = 'fault')::int AS fault,
		       count(*) FILTER (WHERE s.machine_state = 'idle' OR s.machine_state IS NULL)::int AS idle
		FROM asset a
		LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id
		WHERE a.active = TRUE
		GROUP BY a.process_type
		ORDER BY a.process_type;
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []MachineSummary
	for rows.Next() {
		var s MachineSummary
		if err := rows.Scan(&s.ProcessType, &s.Total, &s.Running, &s.Warning, &s.Fault, &s.Idle); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, nil
}

type AreaMachineGroup struct {
	AreaCode    string
	ProcessType string
	Count       int
	AssetIDs    string
}

func (r *Repository) GetMachinesByArea(ctx context.Context, areaCodeFilter, processTypeFilter string) ([]AreaMachineGroup, error) {
	query := `
		SELECT COALESCE(area_code, 'GENERAL') as area_code, process_type, count(*)::int as count,
		       array_to_string(array_agg(asset_id ORDER BY asset_id), ', ') as asset_ids
		FROM asset
		WHERE active = TRUE
		  AND ($1 = '' OR area_code ILIKE $1)
		  AND ($2 = '' OR process_type ILIKE $2)
		GROUP BY area_code, process_type
		ORDER BY area_code, process_type;
	`
	rows, err := r.pool.Query(ctx, query, areaCodeFilter, processTypeFilter)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []AreaMachineGroup
	for rows.Next() {
		var g AreaMachineGroup
		if err := rows.Scan(&g.AreaCode, &g.ProcessType, &g.Count, &g.AssetIDs); err != nil {
			return nil, err
		}
		list = append(list, g)
	}
	return list, nil
}

type MachineDetail struct {
	AssetID         string
	ProcessType     string
	DisplayName     string
	MachineState    string
	BatchNo         string
	ProgressPercent float64
	Connected       bool
}

func (r *Repository) GetMachineDetail(ctx context.Context, machineSearch string) (*MachineDetail, error) {
	query := `
		SELECT a.asset_id, a.process_type, a.display_name,
		       COALESCE(s.machine_state, 'idle') as machine_state,
		       COALESCE(s.batch_no, '-') as batch_no,
		       COALESCE(s.progress_percent, 0)::float8 as progress_percent,
		       COALESCE(s.connected, false) as connected
		FROM asset a
		LEFT JOIN asset_snapshot s ON s.asset_id = a.asset_id
		WHERE a.active = TRUE AND (a.asset_id ILIKE $1 OR a.display_name ILIKE $1)
		LIMIT 1;
	`
	param := "%" + strings.TrimSpace(machineSearch) + "%"
	row := r.pool.QueryRow(ctx, query, param)

	var m MachineDetail
	if err := row.Scan(&m.AssetID, &m.ProcessType, &m.DisplayName, &m.MachineState, &m.BatchNo, &m.ProgressPercent, &m.Connected); err != nil {
		return nil, err
	}
	return &m, nil
}

type InstrumentItem struct {
	ParameterCode   string
	SignalRole      string
	EngineeringUnit string
	ValueNumber     *float64
	ValueText       *string
}

func (r *Repository) GetMachineTelemetry(ctx context.Context, machineSearch string) ([]InstrumentItem, error) {
	query := `
		SELECT parameter_code, signal_role, COALESCE(engineering_unit, ''), value_number, value_text
		FROM instrument_state
		WHERE (asset_id ILIKE $1 OR asset_name ILIKE $1) AND active = TRUE
		ORDER BY updated_at DESC
		LIMIT 6;
	`
	param := "%" + strings.TrimSpace(machineSearch) + "%"
	rows, err := r.pool.Query(ctx, query, param)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []InstrumentItem
	for rows.Next() {
		var item InstrumentItem
		if err := rows.Scan(&item.ParameterCode, &item.SignalRole, &item.EngineeringUnit, &item.ValueNumber, &item.ValueText); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, nil
}

// ---------------------------------------------------------------------------
// 2. Solar Fueling Operations (Mirrors solar-fueling.controller.ts)
// ---------------------------------------------------------------------------

type SolarOverview struct {
	TankID                string
	DisplayName           string
	CapacityLiters        float64
	SystemStockLiters     float64
	SensorStockLiters     *float64
	SensorQuality         string
	SensorTs              *time.Time
	CompletedTransactions int
	PendingQrCount        int
	CancelledQrCount      int
	NotMatchCount         int
	MeteredLiters         float64
	RequestedLiters       float64
	FulfillmentPercent    float64
}

func (r *Repository) GetSolarOverview(ctx context.Context, since time.Time) (*SolarOverview, error) {
	// Query 1: Stock calculation mirroring stockAtSql in solar-fueling.controller.ts
	stockQuery := `
		SELECT config.tank_id, config.display_name, config.capacity_liters::float8,
		       COALESCE(
		         (SELECT transaction.calculated_stock_liters
		          FROM solar_fueling_transaction transaction
		          WHERE transaction.transaction_status = 'COMPLETED'
		            AND transaction.calculated_stock_liters IS NOT NULL
		            AND transaction.fueling_completed_at <= NOW()
		          ORDER BY transaction.fueling_completed_at DESC NULLS LAST, transaction.source_id DESC LIMIT 1),
		         config.opening_stock_liters
		         + COALESCE((SELECT SUM(CASE WHEN movement.direction = 'IN' THEN movement.quantity_liters ELSE -movement.quantity_liters END)
		                     FROM solar_stock_movement movement WHERE movement.tank_id = config.tank_id AND movement.occurred_at >= config.opening_at), 0)
		         - COALESCE((SELECT SUM(transaction.metered_liters)
		                     FROM solar_fueling_transaction transaction
		                     WHERE transaction.movement_direction = 'OUT' AND transaction.transaction_status IN ('COMPLETED','PARTIAL')
		                       AND transaction.fueling_completed_at >= config.opening_at), 0)
		       )::float8 AS system_stock_liters,
		       sample.stock_liters::float8 AS sensor_stock_liters,
		       COALESCE(sample.quality, 'NO_DATA') AS sensor_quality,
		       sample.source_ts AS sensor_ts
		FROM solar_stock_config config
		LEFT JOIN LATERAL (
		  SELECT stock_liters, quality, source_ts
		  FROM solar_level_sample
		  WHERE tank_id = config.tank_id
		  ORDER BY source_ts DESC, source_id DESC LIMIT 1
		) sample ON TRUE
		WHERE config.tank_id = 'SOLAR-MAIN'
		LIMIT 1;
	`
	var so SolarOverview
	err := r.pool.QueryRow(ctx, stockQuery).Scan(
		&so.TankID, &so.DisplayName, &so.CapacityLiters, &so.SystemStockLiters,
		&so.SensorStockLiters, &so.SensorQuality, &so.SensorTs,
	)
	if err != nil {
		// Fallback default
		so.TankID = "SOLAR-MAIN"
		so.DisplayName = "Main Solar Tank"
	}

	// Query 2: Transactions summary in period mirroring solar overview query
	txQuery := `
		SELECT COUNT(*) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL'))::int AS completed_transactions,
		       COUNT(*) FILTER (WHERE transaction_status IN ('QR_CREATED','READY','DISPENSING'))::int AS pending_qr_count,
		       COUNT(*) FILTER (WHERE transaction_status = 'CANCELLED')::int AS cancelled_qr_count,
		       COUNT(*) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL') AND requested_liters > 0 AND metered_liters IS NOT NULL AND ABS(metered_liters-requested_liters)/requested_liters > 0.02)::int AS not_match_count,
		       COALESCE(SUM(metered_liters) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL')), 0)::float8 AS metered_liters,
		       COALESCE(SUM(requested_liters) FILTER (WHERE transaction_status IN ('COMPLETED','PARTIAL')), 0)::float8 AS requested_liters,
		       COALESCE(AVG(CASE WHEN requested_liters > 0 AND transaction_status IN ('COMPLETED','PARTIAL') THEN metered_liters / requested_liters * 100 END), 0)::float8 AS fulfillment_percent
		FROM solar_fueling_transaction
		WHERE COALESCE(fueling_completed_at, qr_created_at, fueling_started_at, source_updated_at, ingested_at) >= $1;
	`
	_ = r.pool.QueryRow(ctx, txQuery, since).Scan(
		&so.CompletedTransactions, &so.PendingQrCount, &so.CancelledQrCount,
		&so.NotMatchCount, &so.MeteredLiters, &so.RequestedLiters, &so.FulfillmentPercent,
	)

	return &so, nil
}

// ---------------------------------------------------------------------------
// 3. Chemical Analytics (Mirrors chemical.controller.ts)
// ---------------------------------------------------------------------------

type ChemicalVariantTotal struct {
	ChemicalCode     string
	ChemicalName     string
	TransactionCount int
	TotalKg          float64
}

type DispenserTotal struct {
	DispenserID      string
	TransactionCount int
	TotalKg          float64
	LastTransaction  *time.Time
}

type ChemicalAnalytics struct {
	TransactionCount int
	AutomaticCount   int
	ManualCount      int
	EmergencyCount   int
	TotalKg          float64
	AverageKg        float64
	LastTransaction  *time.Time
	TopChemicals     []ChemicalVariantTotal
	DispenserTotals  []DispenserTotal
}

func (r *Repository) GetChemicalAnalytics(ctx context.Context, since time.Time) (*ChemicalAnalytics, error) {
	ca := &ChemicalAnalytics{}

	// Query 1: Overall summary
	summaryQuery := `
		SELECT
		  COUNT(*)::int AS transaction_count,
		  COUNT(*) FILTER (WHERE mode = 'Automatic')::int AS automatic_count,
		  COUNT(*) FILTER (WHERE mode = 'Manual')::int AS manual_count,
		  COUNT(*) FILTER (WHERE mode = 'Emergency')::int AS emergency_count,
		  COALESCE(SUM(actual_kg), 0)::float8 AS total_kg,
		  COALESCE(AVG(actual_kg), 0)::float8 AS average_kg,
		  MAX(occurred_at) AS last_transaction_at
		FROM chemical_transaction
		WHERE occurred_at >= $1;
	`
	_ = r.pool.QueryRow(ctx, summaryQuery, since).Scan(
		&ca.TransactionCount, &ca.AutomaticCount, &ca.ManualCount, &ca.EmergencyCount,
		&ca.TotalKg, &ca.AverageKg, &ca.LastTransaction,
	)

	// Query 2: Breakdown by chemical code/name
	varQuery := `
		SELECT chemical_code,
		       (ARRAY_AGG(chemical_name ORDER BY occurred_at DESC))[1] AS chemical_name,
		       COUNT(*)::int AS transaction_count,
		       COALESCE(SUM(actual_kg), 0)::float8 AS total_kg
		FROM chemical_transaction
		WHERE occurred_at >= $1 AND actual_kg IS NOT NULL
		GROUP BY chemical_code
		ORDER BY total_kg DESC
		LIMIT 5;
	`
	rows, err := r.pool.Query(ctx, varQuery, since)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var cv ChemicalVariantTotal
			if err := rows.Scan(&cv.ChemicalCode, &cv.ChemicalName, &cv.TransactionCount, &cv.TotalKg); err == nil {
				ca.TopChemicals = append(ca.TopChemicals, cv)
			}
		}
	}

	// Query 3: Breakdown by dispenser
	dispQuery := `
		SELECT dispenser_id,
		       COUNT(*)::int AS transaction_count,
		       COALESCE(SUM(actual_kg), 0)::float8 AS total_kg,
		       MAX(occurred_at) AS last_transaction_at
		FROM chemical_transaction
		WHERE occurred_at >= $1
		GROUP BY dispenser_id
		ORDER BY dispenser_id;
	`
	dRows, err := r.pool.Query(ctx, dispQuery, since)
	if err == nil {
		defer dRows.Close()
		for dRows.Next() {
			var dt DispenserTotal
			if err := dRows.Scan(&dt.DispenserID, &dt.TransactionCount, &dt.TotalKg, &dt.LastTransaction); err == nil {
				ca.DispenserTotals = append(ca.DispenserTotals, dt)
			}
		}
	}

	return ca, nil
}

// ---------------------------------------------------------------------------
// 4. Plant Utilities (Mirrors api.controller.ts utilities snapshot)
// ---------------------------------------------------------------------------

type UtilityItem struct {
	UtilityCode string
	DisplayName string
	FlowRate    *float64
	Pressure    *float64
	Temperature *float64
	TotalUsage  *float64
	UpdatedAt   time.Time
}

func (r *Repository) GetUtilitiesSnapshot(ctx context.Context) ([]UtilityItem, error) {
	query := `
		SELECT utility_code, display_name,
		       flow_rate::float8, pressure::float8, temperature::float8,
		       total_usage::float8, updated_at
		FROM utility_snapshot
		ORDER BY utility_code;
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []UtilityItem
	for rows.Next() {
		var u UtilityItem
		if err := rows.Scan(&u.UtilityCode, &u.DisplayName, &u.FlowRate, &u.Pressure, &u.Temperature, &u.TotalUsage, &u.UpdatedAt); err == nil {
			list = append(list, u)
		}
	}
	return list, nil
}

// ---------------------------------------------------------------------------
// 5. Production Output & Shift Calculation (Mirrors production-output.controller.ts)
// ---------------------------------------------------------------------------

type ShiftInfo struct {
	Code           string
	ProductionDate string
	From           time.Time
	To             time.Time
	Label          string
}

func GetCurrentShift(now time.Time) ShiftInfo {
	// Asia/Jakarta offset is UTC+7
	loc := time.FixedZone("Asia/Jakarta", 7*3600)
	localNow := now.In(loc)
	hour := localNow.Hour()

	var code string
	var prodDate time.Time

	if hour >= 23 {
		code = "C"
		prodDate = time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 0, 0, 0, 0, loc)
	} else if hour >= 15 {
		code = "B"
		prodDate = time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 0, 0, 0, 0, loc)
	} else if hour >= 7 {
		code = "A"
		prodDate = time.Date(localNow.Year(), localNow.Month(), localNow.Day(), 0, 0, 0, 0, loc)
	} else {
		code = "C"
		prodDate = time.Date(localNow.Year(), localNow.Month(), localNow.Day()-1, 0, 0, 0, 0, loc)
	}

	startHour := 7
	endHour := 15
	if code == "B" {
		startHour = 15
		endHour = 23
	} else if code == "C" {
		startHour = 23
		endHour = 7
	}

	shiftStart := time.Date(prodDate.Year(), prodDate.Month(), prodDate.Day(), startHour, 0, 0, 0, loc)
	shiftEnd := shiftStart.Add(8 * time.Hour)
	if now.Before(shiftEnd) {
		shiftEnd = now
	}

	return ShiftInfo{
		Code:           code,
		ProductionDate: prodDate.Format("2006-01-02"),
		From:           shiftStart,
		To:             shiftEnd,
		Label:          fmt.Sprintf("Shift %s (%02d:00-%02d:00 WIB, %s)", code, startHour, endHour, prodDate.Format("2006-01-02")),
	}
}

type ProcessOutputSummary struct {
	ProcessType  string
	BatchCount   int
	OutputMeters float64
	Unit         string
}

func (r *Repository) GetShiftProductionOutput(ctx context.Context, shift ShiftInfo) ([]ProcessOutputSummary, error) {
	query := `
		WITH scoped_runs AS (
		  SELECT r.process_type, r.batch_no,
		         COALESCE(r.output_quantity, 0)::float8 as output_quantity
		  FROM batch_process_run r
		  WHERE r.started_at IS NOT NULL
		    AND r.started_at < $2
		    AND COALESCE(r.ended_at, $2) > $1
		)
		SELECT LOWER(process_type) as process_type,
		       COUNT(DISTINCT batch_no)::int as batch_count,
		       COALESCE(SUM(output_quantity), 0)::float8 as total_output
		FROM scoped_runs
		GROUP BY LOWER(process_type)
		ORDER BY LOWER(process_type);
	`
	rows, err := r.pool.Query(ctx, query, shift.From, shift.To)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []ProcessOutputSummary
	for rows.Next() {
		var p ProcessOutputSummary
		if err := rows.Scan(&p.ProcessType, &p.BatchCount, &p.OutputMeters); err == nil {
			p.Unit = "m"
			list = append(list, p)
		}
	}
	return list, nil
}

// ---------------------------------------------------------------------------
// 6. Batch & Process Run Context (Mirrors batch.controller.ts)
// ---------------------------------------------------------------------------

type BatchContextItem struct {
	ProcessRunID    string
	BatchNo         string
	AssetID         string
	DisplayName     string
	ProcessType     string
	RunStatus       string
	ProgressPercent float64
	CustomerName    string
	FabricType      string
	TargetOutputKg  float64
	StartedAt       *time.Time
}

func (r *Repository) GetRunningBatches(ctx context.Context) ([]BatchContextItem, error) {
	query := `
		SELECT r.process_run_id, r.batch_no, r.asset_id, a.display_name,
		       r.process_type, r.run_status, COALESCE(r.progress_percent, 0)::float8,
		       COALESCE(b.customer_name, '-'), COALESCE(b.fabric_type, '-'),
		       COALESCE(b.target_output_kg, 0)::float8, r.started_at
		FROM batch_process_run r
		JOIN asset a ON a.asset_id = r.asset_id
		LEFT JOIN production_batch b ON b.batch_no = r.batch_no
		WHERE r.run_status IN ('RUNNING', 'HOLD')
		ORDER BY r.started_at DESC NULLS LAST
		LIMIT 8;
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []BatchContextItem
	for rows.Next() {
		var item BatchContextItem
		if err := rows.Scan(
			&item.ProcessRunID, &item.BatchNo, &item.AssetID, &item.DisplayName,
			&item.ProcessType, &item.RunStatus, &item.ProgressPercent,
			&item.CustomerName, &item.FabricType, &item.TargetOutputKg, &item.StartedAt,
		); err == nil {
			list = append(list, item)
		}
	}
	return list, nil
}

// ---------------------------------------------------------------------------
// 7. Alarms & Exception Center (Mirrors api.controller.ts & alarm.controller.ts)
// ---------------------------------------------------------------------------

type AlarmItem struct {
	AlarmCode       string
	AssetID         string
	Title           string
	Severity        string
	SignalRole      string
	EngineeringUnit string
	OccurredAt      time.Time
}

func (r *Repository) GetActiveAlarms(ctx context.Context) ([]AlarmItem, error) {
	query := `
		SELECT COALESCE(ae.alarm_code, 'ALARM'),
		       COALESCE(ae.asset_id, 'SYSTEM'),
		       ae.title,
		       ae.severity,
		       COALESCE(td.signal_role, '-'),
		       COALESCE(td.engineering_unit, ''),
		       ae.occurred_at
		FROM alarm_event ae
		LEFT JOIN alarm_rule ar ON ar.rule_id = ae.rule_id
		LEFT JOIN tag_definition td ON td.tag_code = ae.tag_code
		WHERE COALESCE(ae.event_state, 'ACTIVE') <> 'CLEARED'
		ORDER BY
		  CASE UPPER(COALESCE(ae.severity, 'WARNING')) WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END,
		  ae.occurred_at DESC
		LIMIT 5;
	`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alarms []AlarmItem
	for rows.Next() {
		var a AlarmItem
		if err := rows.Scan(&a.AlarmCode, &a.AssetID, &a.Title, &a.Severity, &a.SignalRole, &a.EngineeringUnit, &a.OccurredAt); err == nil {
			alarms = append(alarms, a)
		}
	}
	return alarms, nil
}

// ---------------------------------------------------------------------------
// 8. Period Summary (Combines all controller queries accurately)
// ---------------------------------------------------------------------------

type PeriodSummary struct {
	PeriodLabel          string
	StartDate            time.Time
	EndDate              time.Time
	TotalBatches         int
	TotalTargetKg        float64
	TotalAlarms          int
	CriticalAlarms       int
	WarningAlarms        int
	SolarTransactions    int
	SolarMeteredLiters   float64
	ChemicalTransactions int
	ChemicalTotalKg      float64
	MachineSummary       []MachineSummary
}

func (r *Repository) GetPeriodSummary(ctx context.Context, period string) (*PeriodSummary, error) {
	now := time.Now()
	var start time.Time
	var label string

	switch strings.ToLower(period) {
	case "today", "hari_ini":
		label = "Hari Ini (24 Jam Terakhir)"
		start = now.Add(-24 * time.Hour)
	case "week", "seminggu":
		label = "7 Hari Terakhir (Seminggu Kebelakang)"
		start = now.Add(-7 * 24 * time.Hour)
	case "month", "bulan_ini":
		label = "Bulan Ini (30 Hari Terakhir)"
		start = now.Add(-30 * 24 * time.Hour)
	case "year", "tahun_ini":
		label = fmt.Sprintf("Tahun Ini (%d)", now.Year())
		start = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
	default:
		label = "Hari Ini (24 Jam Terakhir)"
		start = now.Add(-24 * time.Hour)
	}

	// 1. Batch Production in period
	var totalBatches int
	var totalKg float64
	_ = r.pool.QueryRow(ctx, `
		SELECT count(*)::int, COALESCE(sum(target_output_kg), 0)::float8
		FROM production_batch
		WHERE created_at >= $1
	`, start).Scan(&totalBatches, &totalKg)

	// 2. Alarms in period
	var totalAlarms, critAlarms, warnAlarms int
	_ = r.pool.QueryRow(ctx, `
		SELECT count(*)::int,
		       count(*) FILTER (WHERE UPPER(severity) = 'CRITICAL')::int,
		       count(*) FILTER (WHERE UPPER(severity) = 'WARNING')::int
		FROM alarm_event
		WHERE occurred_at >= $1
	`, start).Scan(&totalAlarms, &critAlarms, &warnAlarms)

	// 3. Solar Fueling in period (using exact column metered_liters and fueling_completed_at)
	var solarTx int
	var solarMeteredLiters float64
	_ = r.pool.QueryRow(ctx, `
		SELECT count(*)::int, COALESCE(sum(metered_liters), 0)::float8
		FROM solar_fueling_transaction
		WHERE transaction_status IN ('COMPLETED', 'PARTIAL')
		  AND COALESCE(fueling_completed_at, qr_created_at, fueling_started_at, source_updated_at, ingested_at) >= $1
	`, start).Scan(&solarTx, &solarMeteredLiters)

	// 4. Chemical Dispensing in period
	var chemTx int
	var chemTotalKg float64
	_ = r.pool.QueryRow(ctx, `
		SELECT count(*)::int, COALESCE(sum(actual_kg), 0)::float8
		FROM chemical_transaction
		WHERE occurred_at >= $1
	`, start).Scan(&chemTx, &chemTotalKg)

	// 5. Machine Summary
	machSummary, _ := r.GetMachineSummary(ctx)

	return &PeriodSummary{
		PeriodLabel:          label,
		StartDate:            start,
		EndDate:              now,
		TotalBatches:         totalBatches,
		TotalTargetKg:        totalKg,
		TotalAlarms:          totalAlarms,
		CriticalAlarms:       critAlarms,
		WarningAlarms:        warnAlarms,
		SolarTransactions:    solarTx,
		SolarMeteredLiters:   solarMeteredLiters,
		ChemicalTransactions: chemTx,
		ChemicalTotalKg:      chemTotalKg,
		MachineSummary:       machSummary,
	}, nil
}
