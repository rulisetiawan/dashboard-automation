package db

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TelemetrySample struct {
	AssetID     string
	TagCode     string
	SourceTS    time.Time
	ValueNumber *float64
	ValueText   *string
	Quality     string
	GatewayID   *string
	MessageID   string
}

type Database struct {
	pool *pgxpool.Pool
}

func NewPostgresPool(ctx context.Context, connString string) (*Database, error) {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("parse postgres config: %w", err)
	}

	config.MaxConns = 15
	config.MinConns = 2
	config.MaxConnIdleTime = 5 * time.Minute

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("create postgres pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := pool.Ping(pingCtx); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &Database{pool: pool}, nil
}

func (d *Database) Close() {
	if d.pool != nil {
		d.pool.Close()
	}
}

// IngestBatch inserts telemetry samples with deduplication (ON CONFLICT DO NOTHING)
func (d *Database) IngestBatch(ctx context.Context, samples []TelemetrySample) (int, error) {
	if len(samples) == 0 {
		return 0, nil
	}

	tx, err := d.pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	const insertSQL = `
		INSERT INTO telemetry_sample (
			asset_id, tag_code, source_ts, value_number, value_text, quality, gateway_id, message_id, ingested_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, clock_timestamp()
		)
		ON CONFLICT (message_id, tag_code) DO NOTHING
	`

	inserted := 0
	for _, s := range samples {
		cmdTag, err := tx.Exec(ctx, insertSQL,
			s.AssetID,
			s.TagCode,
			s.SourceTS,
			s.ValueNumber,
			s.ValueText,
			s.Quality,
			s.GatewayID,
			s.MessageID,
		)
		if err != nil {
			return inserted, fmt.Errorf("insert telemetry_sample (asset: %s, tag: %s): %w", s.AssetID, s.TagCode, err)
		}
		if cmdTag.RowsAffected() > 0 {
			inserted++
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("commit transaction: %w", err)
	}

	return inserted, nil
}
