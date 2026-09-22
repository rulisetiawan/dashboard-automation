package syncer

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func alignOpeningStock(ctx context.Context, pool *pgxpool.Pool, sourceSystem, tankID string) error {
	query := `
		UPDATE solar_stock_config config SET
			opening_stock_liters = sample.stock_liters,
			opening_at = sample.source_ts,
			updated_by = 'SMM_MYSQL_WORKER_GO',
			updated_at = clock_timestamp()
		FROM (
			SELECT stock_liters, source_ts
			FROM solar_level_sample
			WHERE source_system = $1 AND tank_id = $2 AND quality = 'GOOD'
			ORDER BY source_ts ASC, source_id ASC
			LIMIT 1
		) sample
		WHERE config.tank_id = $2
		  AND config.opening_stock_liters = 0
		  AND config.opening_at <= '2000-01-02'::timestamptz
	`
	_, err := pool.Exec(ctx, query, sourceSystem, tankID)
	if err != nil {
		return fmt.Errorf("align opening stock: %w", err)
	}
	return nil
}

func getStartingID(ctx context.Context, pool *pgxpool.Pool, sourceSystem, sourceTable, targetTable string, fullSync bool) (int64, error) {
	if fullSync {
		return 0, nil
	}

	var lastID int64
	err := pool.QueryRow(ctx, `
		SELECT last_source_id 
		FROM solar_source_sync_state 
		WHERE source_system = $1 AND source_table = $2
	`, sourceSystem, sourceTable).Scan(&lastID)
	if err == nil {
		return lastID, nil
	}

	// Fallback to max(source_id) from target table
	fallbackQuery := fmt.Sprintf(`SELECT COALESCE(MAX(source_id), 0) FROM %s WHERE source_system = $1`, targetTable)
	err = pool.QueryRow(ctx, fallbackQuery, sourceSystem).Scan(&lastID)
	if err != nil {
		return 0, fmt.Errorf("query max source_id from %s: %w", targetTable, err)
	}

	return lastID, nil
}

func updateSyncState(ctx context.Context, pool *pgxpool.Pool, sourceSystem, sourceTable string, lastID int64, rowCount int64, lastTS *time.Time, status string, errMsg *string) error {
	query := `
		INSERT INTO solar_source_sync_state (
			source_system, source_table, last_source_id, source_row_count, 
			last_source_ts, last_sync_at, last_status, last_error
		) VALUES ($1, $2, $3, $4, $5, clock_timestamp(), $6, $7)
		ON CONFLICT (source_system, source_table) DO UPDATE SET
			last_source_id = EXCLUDED.last_source_id,
			source_row_count = EXCLUDED.source_row_count,
			last_source_ts = COALESCE(EXCLUDED.last_source_ts, solar_source_sync_state.last_source_ts),
			last_sync_at = EXCLUDED.last_sync_at,
			last_status = EXCLUDED.last_status,
			last_error = EXCLUDED.last_error
	`
	_, err := pool.Exec(ctx, query, sourceSystem, sourceTable, lastID, rowCount, lastTS, status, errMsg)
	if err != nil {
		return fmt.Errorf("update sync state for %s: %w", sourceTable, err)
	}
	return nil
}
