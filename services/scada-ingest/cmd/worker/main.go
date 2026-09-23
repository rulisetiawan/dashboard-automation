package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pt_smm_scada_ingest/internal/config"
	"pt_smm_scada_ingest/internal/db"
	"pt_smm_scada_ingest/internal/mqtt"
)

func main() {
	cfg := config.Load()

	log.Printf("==========================================================")
	log.Printf("  PT SMM SCADA Telemetry Ingest Worker (Go)")
	log.Printf("==========================================================")
	log.Printf("[INFO] MQTT Broker   : %s", cfg.MQTTBroker)
	log.Printf("[INFO] MQTT Topic    : %s (QoS %d)", cfg.MQTTTopic, cfg.MQTTQoS)
	log.Printf("[INFO] MQTT ClientID : %s", cfg.MQTTClientID)
	log.Printf("[INFO] Database Target: %s@%s:%d/%s", cfg.PGUser, cfg.PGHost, cfg.PGPort, cfg.PGDatabase)

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	// Connect to PostgreSQL
	dbPool, err := db.NewPostgresPool(ctx, cfg.PostgresConnString())
	if err != nil {
		log.Fatalf("[FATAL] Failed to connect to PostgreSQL: %v", err)
	}
	defer dbPool.Close()
	log.Printf("[INFO] Successfully connected to PostgreSQL.")

	// Create and start MQTT subscriber
	subscriber := mqtt.NewSubscriber(cfg, dbPool)
	if err := subscriber.Start(); err != nil {
		log.Printf("[WARN] Initial MQTT connection failed: %v (auto-reconnect will continue retrying)", err)
	}
	defer subscriber.Stop()

	log.Printf("[INFO] SCADA Ingest Worker is running. Waiting for telemetry messages...")

	<-ctx.Done()
	log.Printf("[INFO] Shutdown signal received. Exiting gracefully...")

	// Allow brief grace period for in-flight tasks
	time.Sleep(500 * time.Millisecond)
	log.Printf("[INFO] SCADA Ingest Worker stopped.")
}
