package syncer

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"pt_smm_solar_sync_worker/internal/config"
	"pt_smm_solar_sync_worker/internal/util"
)

type TransactionSyncer struct {
	cfg *config.Config
	my  *sql.DB
	pg  *pgxpool.Pool
}

func NewTransactionSyncer(cfg *config.Config, my *sql.DB, pg *pgxpool.Pool) *TransactionSyncer {
	return &TransactionSyncer{
		cfg: cfg,
		my:  my,
		pg:  pg,
	}
}

func (s *TransactionSyncer) Sync(ctx context.Context) (*SyncResult, error) {
	startID, err := getStartingID(ctx, s.pg, s.cfg.SourceSystem, "qr_codes", "solar_fueling_transaction", s.cfg.FullSync)
	if err != nil {
		return nil, fmt.Errorf("get starting id for qr_codes: %w", err)
	}

	cursor := startID
	var sourceRows []QRCodeSourceRow
	var lastSourceTS *time.Time

	if s.cfg.FullSync {
		var scanCursor int64 = 0
		for {
			if ctx.Err() != nil {
				return nil, ctx.Err()
			}
			rows, err := s.queryQRCodes(ctx, "WHERE id > ? ORDER BY id ASC LIMIT ?", scanCursor, s.cfg.BatchSize)
			if err != nil {
				return nil, err
			}
			if len(rows) == 0 {
				break
			}
			sourceRows = append(sourceRows, rows...)
			for _, r := range rows {
				if r.ID > scanCursor {
					scanCursor = r.ID
				}
			}
		}
	} else {
		refreshFrom := cursor - int64(s.cfg.RefreshWindow)
		if refreshFrom < 0 {
			refreshFrom = 0
		}
		var scanCursor int64 = refreshFrom
		for {
			if ctx.Err() != nil {
				return nil, ctx.Err()
			}
			rows, err := s.queryQRCodes(ctx, "WHERE id > ? ORDER BY id ASC LIMIT ?", scanCursor, s.cfg.BatchSize)
			if err != nil {
				return nil, err
			}
			if len(rows) == 0 {
				break
			}
			sourceRows = append(sourceRows, rows...)
			for _, r := range rows {
				if r.ID > scanCursor {
					scanCursor = r.ID
				}
			}
		}

		// Also check open active transactions (older than refreshFrom)
		openRows, err := s.pg.Query(ctx, `
			SELECT source_id 
			FROM solar_fueling_transaction
			WHERE source_system = $1 
			  AND transaction_status IN ('QR_CREATED', 'READY', 'DISPENSING')
			  AND source_id <= $2
		`, s.cfg.SourceSystem, refreshFrom)
		if err == nil {
			var activeIDs []int64
			for openRows.Next() {
				var id int64
				if err := openRows.Scan(&id); err == nil {
					activeIDs = append(activeIDs, id)
				}
			}
			openRows.Close()

			for offset := 0; offset < len(activeIDs); offset += s.cfg.BatchSize {
				end := offset + s.cfg.BatchSize
				if end > len(activeIDs) {
					end = len(activeIDs)
				}
				chunk := activeIDs[offset:end]
				if len(chunk) == 0 {
					continue
				}

				placeholders := make([]string, len(chunk))
				args := make([]any, len(chunk))
				for i, id := range chunk {
					placeholders[i] = "?"
					args[i] = id
				}
				query := fmt.Sprintf("WHERE id IN (%s)", strings.Join(placeholders, ","))
				rows, err := s.queryQRCodes(ctx, query, args...)
				if err == nil {
					sourceRows = append(sourceRows, rows...)
				}
			}
		}
	}

	// Deduplicate by ID
	uniqueMap := make(map[int64]QRCodeSourceRow)
	for _, r := range sourceRows {
		uniqueMap[r.ID] = r
	}

	uniqueRows := make([]QRCodeSourceRow, 0, len(uniqueMap))
	for _, r := range uniqueMap {
		uniqueRows = append(uniqueRows, r)
	}
	sort.Slice(uniqueRows, func(i, j int) bool {
		return uniqueRows[i].ID < uniqueRows[j].ID
	})

	scanned := len(uniqueRows)

	// Fetch existing payloads to skip unchanged rows unless fullSync
	currentPayload := make(map[int64]string)
	if !s.cfg.FullSync && len(uniqueRows) > 0 {
		for offset := 0; offset < len(uniqueRows); offset += s.cfg.BatchSize {
			end := offset + s.cfg.BatchSize
			if end > len(uniqueRows) {
				end = len(uniqueRows)
			}
			chunk := uniqueRows[offset:end]
			ids := make([]int64, len(chunk))
			for i, r := range chunk {
				ids[i] = r.ID
			}

			pRows, err := s.pg.Query(ctx, `
				SELECT source_id, raw_payload
				FROM solar_fueling_transaction
				WHERE source_system = $1 AND source_id = ANY($2::bigint[])
			`, s.cfg.SourceSystem, ids)
			if err == nil {
				for pRows.Next() {
					var sid int64
					var payload any
					if err := pRows.Scan(&sid, &payload); err == nil {
						if b, err := json.Marshal(payload); err == nil {
							currentPayload[sid] = string(b)
						}
					}
				}
				pRows.Close()
			}
		}
	}

	var changedRows []QRCodeSourceRow
	for _, r := range uniqueRows {
		newJSON, _ := json.Marshal(r.RawRecord)
		if s.cfg.FullSync || currentPayload[r.ID] != string(newJSON) {
			changedRows = append(changedRows, r)
		}
	}

	upsertQuery := `
		INSERT INTO solar_fueling_transaction (
			source_system, source_id, qr_code, requested_liters, metered_liters,
			machine_totalizer_liters, source_totalizer_in_liters, source_totalizer_out_liters,
			calculated_stock_liters, operation_type, movement_direction, execution_mode,
			transaction_status, qr_created_at, fueling_started_at, fueling_completed_at,
			requester_name, qr_created_by, processed_by, notes, source_updated_at,
			raw_payload, ingested_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8,
			$9, $10, $11, $12,
			$13, $14, $15, $16,
			$17, $18, $19, $20, $21,
			$22, clock_timestamp(), clock_timestamp()
		)
		ON CONFLICT (source_system, source_id) DO UPDATE SET
			qr_code = EXCLUDED.qr_code,
			requested_liters = EXCLUDED.requested_liters,
			metered_liters = EXCLUDED.metered_liters,
			machine_totalizer_liters = EXCLUDED.machine_totalizer_liters,
			source_totalizer_in_liters = EXCLUDED.source_totalizer_in_liters,
			source_totalizer_out_liters = EXCLUDED.source_totalizer_out_liters,
			calculated_stock_liters = EXCLUDED.calculated_stock_liters,
			operation_type = EXCLUDED.operation_type,
			movement_direction = EXCLUDED.movement_direction,
			execution_mode = EXCLUDED.execution_mode,
			transaction_status = EXCLUDED.transaction_status,
			qr_created_at = EXCLUDED.qr_created_at,
			fueling_started_at = EXCLUDED.fueling_started_at,
			fueling_completed_at = EXCLUDED.fueling_completed_at,
			requester_name = EXCLUDED.requester_name,
			qr_created_by = EXCLUDED.qr_created_by,
			processed_by = EXCLUDED.processed_by,
			notes = EXCLUDED.notes,
			source_updated_at = EXCLUDED.source_updated_at,
			raw_payload = EXCLUDED.raw_payload,
			updated_at = clock_timestamp()
	`

	processed := 0
	for offset := 0; offset < len(changedRows); offset += s.cfg.BatchSize {
		end := offset + s.cfg.BatchSize
		if end > len(changedRows) {
			end = len(changedRows)
		}
		chunk := changedRows[offset:end]

		batch := &pgx.Batch{}
		for _, r := range chunk {
			var codeStr string
			if r.Code.Valid && util.CleanString(r.Code.String) != "" {
				codeStr = util.CleanString(r.Code.String)
			} else {
				codeStr = fmt.Sprintf("SOURCE-%d", r.ID)
			}

			requestedLiters := 0.0
			if r.ActualSolar.Valid && r.ActualSolar.Float64 > 0 {
				requestedLiters = r.ActualSolar.Float64
			} else if r.Jumlah.Valid {
				requestedLiters = r.Jumlah.Float64
			}

			var meteredLiters *float64
			if r.ActualSolar.Valid {
				meteredLiters = &r.ActualSolar.Float64
			}

			var totalizerIn *float64
			if r.TotalSolarIn.Valid {
				totalizerIn = &r.TotalSolarIn.Float64
			}

			var totalizerOut *float64
			if r.TotalSolarOut.Valid {
				totalizerOut = &r.TotalSolarOut.Float64
			}

			var machineTotalizer *float64
			if totalizerOut != nil {
				machineTotalizer = totalizerOut
			} else if totalizerIn != nil {
				machineTotalizer = totalizerIn
			}

			var calculatedStock *float64
			if r.CalculatedVolume.Valid {
				calculatedStock = &r.CalculatedVolume.Float64
			}

			executionMode := "QR"
			if r.ProcessType.Valid {
				executionMode = util.ExecutionMode(r.ProcessType.String)
			}

			status := "MANUAL_REVIEW"
			if r.Status.Valid {
				status = util.NormalizeStatus(r.Status.String)
			}

			var dateCreatedStr *string
			if r.DateCreated.Valid {
				dateCreatedStr = &r.DateCreated.String
			}
			var processAtStr *string
			if r.ProcessAt.Valid {
				processAtStr = &r.ProcessAt.String
			}
			var dateActivatedStr *string
			if r.DateActivated.Valid {
				dateActivatedStr = &r.DateActivated.String
			}

			createdAt, _ := util.ParseSourceTimestamp(dateCreatedStr)
			startedAt, _ := util.ParseSourceTimestamp(processAtStr)
			completedAt, _ := util.ParseSourceTimestamp(dateActivatedStr)
			sourceUpdatedAt := util.LatestTimestamp(completedAt, startedAt, createdAt)

			if sourceUpdatedAt != nil {
				if lastSourceTS == nil || sourceUpdatedAt.After(*lastSourceTS) {
					lastSourceTS = sourceUpdatedAt
				}
			}

			var requesterName *string
			if r.NamaPemesan.Valid {
				requesterName = util.CleanStringValue(r.NamaPemesan.String)
			}
			var qrCreatedBy *string
			if r.NamaPembuat.Valid {
				qrCreatedBy = util.CleanStringValue(r.NamaPembuat.String)
			}
			var processedBy *string
			if r.ProcessBy.Valid {
				processedBy = util.CleanStringValue(r.ProcessBy.String)
			}
			var notes *string
			if r.Keterangan.Valid {
				notes = util.CleanStringValue(r.Keterangan.String)
			}

			rawJSON, _ := json.Marshal(r.RawRecord)

			batch.Queue(upsertQuery,
				s.cfg.SourceSystem,
				r.ID,
				codeStr,
				requestedLiters,
				meteredLiters,
				machineTotalizer,
				totalizerIn,
				totalizerOut,
				calculatedStock,
				"FUELING",
				"OUT",
				executionMode,
				status,
				createdAt,
				startedAt,
				completedAt,
				requesterName,
				qrCreatedBy,
				processedBy,
				notes,
				sourceUpdatedAt,
				rawJSON,
			)

			if r.ID > cursor {
				cursor = r.ID
			}
		}

		br := s.pg.SendBatch(ctx, batch)
		for i := 0; i < len(chunk); i++ {
			if _, err := br.Exec(); err != nil {
				br.Close()
				errMsg := err.Error()
				_ = updateSyncState(ctx, s.pg, s.cfg.SourceSystem, "qr_codes", cursor, int64(processed), lastSourceTS, "ERROR", &errMsg)
				return nil, fmt.Errorf("execute batch upsert for qr_codes: %w", err)
			}
		}
		br.Close()

		processed += len(chunk)
	}

	for _, r := range uniqueRows {
		if r.ID > cursor {
			cursor = r.ID
		}
	}

	var totalCount int64
	err = s.pg.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM solar_fueling_transaction
		WHERE source_system = $1
	`, s.cfg.SourceSystem).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("count solar_fueling_transaction: %w", err)
	}

	if err := updateSyncState(ctx, s.pg, s.cfg.SourceSystem, "qr_codes", cursor, totalCount, lastSourceTS, "SUCCESS", nil); err != nil {
		return nil, err
	}

	return &SyncResult{
		SourceTable: "qr_codes",
		Scanned:     scanned,
		Processed:   processed,
		Total:       int(totalCount),
		LastID:      cursor,
		LastTS:      lastSourceTS,
	}, nil
}

func (s *TransactionSyncer) queryQRCodes(ctx context.Context, whereClause string, args ...any) ([]QRCodeSourceRow, error) {
	query := fmt.Sprintf("SELECT * FROM qr_codes %s", whereClause)
	rows, err := s.my.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query qr_codes: %w", err)
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("read qr_codes columns: %w", err)
	}

	var results []QRCodeSourceRow
	for rows.Next() {
		colVals := make([]any, len(cols))
		colPointers := make([]any, len(cols))
		for i := range cols {
			colPointers[i] = &colVals[i]
		}

		if err := rows.Scan(colPointers...); err != nil {
			return nil, fmt.Errorf("scan qr_codes columns: %w", err)
		}

		rawMap := make(map[string]any, len(cols))
		var r QRCodeSourceRow

		for i, col := range cols {
			val := colVals[i]
			colLower := strings.ToLower(col)

			var strVal *string
			var floatVal *float64
			var intVal *int64

			if val != nil {
				switch v := val.(type) {
				case []byte:
					s := util.CleanString(string(v))
					rawMap[col] = s
					strVal = &s
				case string:
					s := util.CleanString(v)
					rawMap[col] = s
					strVal = &s
				case int64:
					rawMap[col] = v
					intVal = &v
				case int:
					i := int64(v)
					rawMap[col] = i
					intVal = &i
				case int32:
					i := int64(v)
					rawMap[col] = i
					intVal = &i
				case float64:
					rawMap[col] = v
					floatVal = &v
				case float32:
					f := float64(v)
					rawMap[col] = f
					floatVal = &f
				default:
					rawMap[col] = v
				}
			} else {
				rawMap[col] = nil
			}

			switch colLower {
			case "id":
				if intVal != nil {
					r.ID = *intVal
				} else if strVal != nil {
					var id int64
					fmt.Sscanf(*strVal, "%d", &id)
					r.ID = id
				}
			case "code":
				if strVal != nil {
					r.Code = sql.NullString{String: *strVal, Valid: true}
				}
			case "jumlah":
				r.Jumlah = parseNullFloat(floatVal, intVal, strVal)
			case "actual_solar":
				r.ActualSolar = parseNullFloat(floatVal, intVal, strVal)
			case "total_solar_in":
				r.TotalSolarIn = parseNullFloat(floatVal, intVal, strVal)
			case "total_solar_out":
				r.TotalSolarOut = parseNullFloat(floatVal, intVal, strVal)
			case "calculated_volume":
				r.CalculatedVolume = parseNullFloat(floatVal, intVal, strVal)
			case "process_type":
				if strVal != nil {
					r.ProcessType = sql.NullString{String: *strVal, Valid: true}
				}
			case "status":
				if strVal != nil {
					r.Status = sql.NullString{String: *strVal, Valid: true}
				}
			case "date_created":
				if strVal != nil {
					r.DateCreated = sql.NullString{String: *strVal, Valid: true}
				}
			case "process_at":
				if strVal != nil {
					r.ProcessAt = sql.NullString{String: *strVal, Valid: true}
				}
			case "date_activated":
				if strVal != nil {
					r.DateActivated = sql.NullString{String: *strVal, Valid: true}
				}
			case "nama_pemesan":
				if strVal != nil {
					r.NamaPemesan = sql.NullString{String: *strVal, Valid: true}
				}
			case "nama_pembuat":
				if strVal != nil {
					r.NamaPembuat = sql.NullString{String: *strVal, Valid: true}
				}
			case "process_by":
				if strVal != nil {
					r.ProcessBy = sql.NullString{String: *strVal, Valid: true}
				}
			case "keterangan":
				if strVal != nil {
					r.Keterangan = sql.NullString{String: *strVal, Valid: true}
				}
			}
		}

		r.RawRecord = rawMap
		results = append(results, r)
	}

	return results, rows.Err()
}

func parseNullFloat(floatVal *float64, intVal *int64, strVal *string) sql.NullFloat64 {
	if floatVal != nil {
		return sql.NullFloat64{Float64: *floatVal, Valid: true}
	}
	if intVal != nil {
		return sql.NullFloat64{Float64: float64(*intVal), Valid: true}
	}
	if strVal != nil {
		var f float64
		if _, err := fmt.Sscanf(*strVal, "%f", &f); err == nil {
			return sql.NullFloat64{Float64: f, Valid: true}
		}
	}
	return sql.NullFloat64{}
}
