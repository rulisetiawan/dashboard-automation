package syncer

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"pt_smm_solar_sync_worker/internal/config"
)

var ErrLockNotAcquired = errors.New("solar mysql sync lock already acquired by another process")

type Syncer struct {
	cfg        *config.Config
	my         *sql.DB
	pg         *pgxpool.Pool
	txSyncer   *TransactionSyncer
	lvlSyncer  *LevelSyncer
}

func New(cfg *config.Config, my *sql.DB, pg *pgxpool.Pool) *Syncer {
	return &Syncer{
		cfg:       cfg,
		my:        my,
		pg:        pg,
		txSyncer:  NewTransactionSyncer(cfg, my, pg),
		lvlSyncer: NewLevelSyncer(cfg, my, pg),
	}
}

type SyncSummary struct {
	Timestamp   time.Time   `json:"timestamp"`
	Source      string      `json:"source"`
	Transaction *SyncResult `json:"transaction"`
	Level       *SyncResult `json:"level"`
}

func (s *Syncer) RunOnce(ctx context.Context) (*SyncSummary, error) {
	// Try acquiring advisory lock on dedicated connection
	conn, err := s.pg.Acquire(ctx)
	if err != nil {
		return nil, fmt.Errorf("acquire postgres connection for lock: %w", err)
	}
	defer conn.Release()

	var acquired bool
	err = conn.QueryRow(ctx, "SELECT pg_try_advisory_lock(hashtext('smm_mysql_solar_sync'))").Scan(&acquired)
	if err != nil {
		return nil, fmt.Errorf("check advisory lock: %w", err)
	}
	if !acquired {
		return nil, ErrLockNotAcquired
	}
	defer func() {
		var unlocked bool
		_ = conn.QueryRow(context.Background(), "SELECT pg_advisory_unlock(hashtext('smm_mysql_solar_sync'))").Scan(&unlocked)
	}()

	txRes, err := s.txSyncer.Sync(ctx)
	if err != nil {
		return nil, fmt.Errorf("sync transactions: %w", err)
	}

	lvlRes, err := s.lvlSyncer.Sync(ctx)
	if err != nil {
		return nil, fmt.Errorf("sync levels: %w", err)
	}

	if err := alignOpeningStock(ctx, s.pg, s.cfg.SourceSystem, s.cfg.TankID); err != nil {
		log.Printf("[WARN] Failed to align opening stock: %v", err)
	}

	summary := &SyncSummary{
		Timestamp:   time.Now().UTC(),
		Source:      s.cfg.SourceSystem,
		Transaction: txRes,
		Level:       lvlRes,
	}

	return summary, nil
}
