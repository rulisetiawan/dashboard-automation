package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pt_smm_solar_sync_worker/internal/config"
	"pt_smm_solar_sync_worker/internal/db"
	"pt_smm_solar_sync_worker/internal/syncer"
)

func main() {
	cfg := config.Load()

	log.Printf("[INFO] Starting PT SMM Solar Sync Worker (Go)")
	log.Printf("[INFO] MySQL Source: %s@tcp(%s:%d)/%s", cfg.MySQLUser, cfg.MySQLHost, cfg.MySQLPort, cfg.MySQLDatabase)
	log.Printf("[INFO] Postgres Target: %s@%s:%d/%s", cfg.PGUser, cfg.PGHost, cfg.PGPort, cfg.PGDatabase)
	log.Printf("[INFO] Mode: full=%t, follow=%t, interval=%s, batchSize=%d", cfg.FullSync, cfg.Follow, cfg.Interval, cfg.BatchSize)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	myDB, err := db.NewMySQLDB(ctx, cfg.MySQLDSN())
	if err != nil {
		log.Fatalf("[FATAL] Cannot connect to MySQL: %v", err)
	}
	defer myDB.Close()

	pgPool, err := db.NewPostgresPool(ctx, cfg.PostgresConnString())
	if err != nil {
		log.Fatalf("[FATAL] Cannot connect to PostgreSQL: %v", err)
	}
	defer pgPool.Close()

	s := syncer.New(cfg, myDB, pgPool)

	runSync := func() {
		summary, err := s.RunOnce(ctx)
		if err != nil {
			if errors.Is(err, syncer.ErrLockNotAcquired) {
				log.Printf("[WARN] %v; skipping this cycle", err)
			} else {
				log.Printf("[ERROR] Synchronization error: %v", err)
			}
			return
		}

		if summary.Transaction.Processed > 0 || summary.Level.Processed > 0 {
			b, _ := json.Marshal(summary)
			fmt.Println(string(b))
		} else {
			log.Printf("[INFO] In sync: no new records. Last TX ID: %d, Last Level ID: %d",
				summary.Transaction.LastID, summary.Level.LastID)
		}
	}

	// Initial run
	runSync()

	if !cfg.Follow {
		log.Printf("[INFO] Single run completed.")
		return
	}

	log.Printf("[INFO] Follow mode active. Polling every %s...", cfg.Interval)
	ticker := time.NewTicker(cfg.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("[INFO] Shutdown signal received. Exiting worker...")
			return
		case <-ticker.C:
			runSync()
		}
	}
}
