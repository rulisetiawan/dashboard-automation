package syncer

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"pt_smm_solar_sync_worker/internal/config"
	"pt_smm_solar_sync_worker/internal/util"
)

type LevelSyncer struct {
	cfg *config.Config
	my  *sql.DB
	pg  *pgxpool.Pool
}

func NewLevelSyncer(cfg *config.Config, my *sql.DB, pg *pgxpool.Pool) *LevelSyncer {
	return &LevelSyncer{
		cfg: cfg,
		my:  my,
		pg:  pg,
	}
}

func (s *LevelSyncer) Sync(ctx context.Context) (*SyncResult, error) {
	startID, err := getStartingID(ctx, s.pg, s.cfg.SourceSystem, "qr_solar_level", "solar_level_sample", s.cfg.FullSync)
	if err != nil {
		return nil, fmt.Errorf("get starting id for qr_solar_level: %w", err)
	}

	cursor := startID
	processed := 0
	badProcessed := 0
	var lastSourceTS *time.Time

	upsertQuery := `
		INSERT INTO solar_level_sample (
			source_system, source_id, tank_id, stock_liters,
			quality, quality_reason, source_ts, source_created_at,
			ingested_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, clock_timestamp(), clock_timestamp())
		ON CONFLICT (source_system, source_id) DO UPDATE SET
			tank_id = EXCLUDED.tank_id,
			stock_liters = EXCLUDED.stock_liters,
			quality = EXCLUDED.quality,
			quality_reason = EXCLUDED.quality_reason,
			source_ts = EXCLUDED.source_ts,
			source_created_at = EXCLUDED.source_created_at,
			updated_at = clock_timestamp()
	`

	for {
		if ctx.Err() != nil {
			return nil, ctx.Err()
		}

		rows, err := s.my.QueryContext(ctx, `
			SELECT id, stock, created_at, update_at
			FROM qr_solar_level
			WHERE id > ?
			ORDER BY id ASC
			LIMIT ?
		`, cursor, s.cfg.BatchSize)
		if err != nil {
			errMsg := err.Error()
			_ = updateSyncState(ctx, s.pg, s.cfg.SourceSystem, "qr_solar_level", cursor, int64(processed), lastSourceTS, "ERROR", &errMsg)
			return nil, fmt.Errorf("query qr_solar_level: %w", err)
		}

		var batchItems []SolarLevelSourceRow
		for rows.Next() {
			var row SolarLevelSourceRow
			if err := rows.Scan(&row.ID, &row.Stock, &row.CreatedAt, &row.UpdateAt); err != nil {
				rows.Close()
				return nil, fmt.Errorf("scan qr_solar_level row: %w", err)
			}
			batchItems = append(batchItems, row)
		}
		rows.Close()

		if len(batchItems) == 0 {
			break
		}

		batch := &pgx.Batch{}
		for _, item := range batchItems {
			stock := 0.0
			if item.Stock.Valid {
				stock = item.Stock.Float64
			}

			isGood := item.Stock.Valid && stock >= 0 && stock <= 100000
			quality := "GOOD"
			var qualityReason *string
			if !isGood {
				quality = "BAD"
				reason := "Nilai di luar sanity range 0–100000 liter"
				qualityReason = &reason
				badProcessed++
			}

			var updateStr *string
			if item.UpdateAt.Valid {
				updateStr = &item.UpdateAt.String
			}
			var createdStr *string
			if item.CreatedAt.Valid {
				createdStr = &item.CreatedAt.String
			}

			parsedUpdate, _ := util.ParseSourceTimestamp(updateStr)
			parsedCreated, _ := util.ParseSourceTimestamp(createdStr)

			sourceTS := parsedUpdate
			if sourceTS == nil {
				sourceTS = parsedCreated
			}
			if sourceTS == nil {
				now := time.Now()
				sourceTS = &now
			}

			if lastSourceTS == nil || sourceTS.After(*lastSourceTS) {
				lastSourceTS = sourceTS
			}

			batch.Queue(upsertQuery,
				s.cfg.SourceSystem,
				item.ID,
				s.cfg.TankID,
				stock,
				quality,
				qualityReason,
				sourceTS,
				parsedCreated,
			)

			if item.ID > cursor {
				cursor = item.ID
			}
		}

		br := s.pg.SendBatch(ctx, batch)
		for i := 0; i < len(batchItems); i++ {
			if _, err := br.Exec(); err != nil {
				br.Close()
				errMsg := err.Error()
				_ = updateSyncState(ctx, s.pg, s.cfg.SourceSystem, "qr_solar_level", cursor, int64(processed), lastSourceTS, "ERROR", &errMsg)
				return nil, fmt.Errorf("execute batch upsert for qr_solar_level: %w", err)
			}
		}
		br.Close()

		processed += len(batchItems)
	}

	var totalCount int64
	var totalBadCount int64
	err = s.pg.QueryRow(ctx, `
		SELECT COUNT(*), COUNT(*) FILTER (WHERE quality = 'BAD')
		FROM solar_level_sample
		WHERE source_system = $1
	`, s.cfg.SourceSystem).Scan(&totalCount, &totalBadCount)
	if err != nil {
		return nil, fmt.Errorf("count solar_level_sample: %w", err)
	}

	if err := updateSyncState(ctx, s.pg, s.cfg.SourceSystem, "qr_solar_level", cursor, totalCount, lastSourceTS, "SUCCESS", nil); err != nil {
		return nil, err
	}

	return &SyncResult{
		SourceTable: "qr_solar_level",
		Scanned:     processed,
		Processed:   processed,
		Total:       int(totalCount),
		BadCount:    int(totalBadCount),
		LastID:      cursor,
		LastTS:      lastSourceTS,
	}, nil
}
