package config

import (
	"flag"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"time"
)

const (
	DefaultSourceSystem = "SMM_MYSQL_QR_CODE_DB"
	DefaultTankID       = "SOLAR-MAIN"
)

type Config struct {
	// MySQL Settings
	MySQLHost     string
	MySQLPort     int
	MySQLUser     string
	MySQLPassword string
	MySQLDatabase string

	// Postgres Settings
	PGHost     string
	PGPort     int
	PGUser     string
	PGPassword string
	PGDatabase string
	PGSSLMode  string
	PGURL      string

	// Worker Sync Settings
	SourceSystem  string
	TankID        string
	FullSync      bool
	Follow        bool
	Interval      time.Duration
	BatchSize     int
	RefreshWindow int
}

func Load() *Config {
	cfg := &Config{
		MySQLHost:     getEnv("SMM_MYSQL_HOST", "192.168.100.82"),
		MySQLPort:     getEnvInt("SMM_MYSQL_PORT", 3306),
		MySQLUser:     getEnv("SMM_MYSQL_USER", "root"),
		MySQLPassword: getEnv("SMM_MYSQL_PASSWORD", ""),
		MySQLDatabase: getEnv("SMM_MYSQL_DATABASE", "qr_code_db"),

		PGHost:     getEnv("DB_HOST", "localhost"),
		PGPort:     getEnvInt("DB_PORT", 5432),
		PGUser:     getEnv("DB_USER", "postgres"),
		PGPassword: getEnv("DB_PASSWORD", "postgres"),
		PGDatabase: getEnv("DB_NAME", "pt_smm_scada"),
		PGSSLMode:  "disable",
		PGURL:      getEnv("DATABASE_URL", ""),

		SourceSystem:  getEnv("SOLAR_SOURCE_SYSTEM", DefaultSourceSystem),
		TankID:        getEnv("SOLAR_TANK_ID", DefaultTankID),
		FullSync:      getEnvBool("SOLAR_FULL_SYNC", false),
		Follow:        getEnvBool("SOLAR_SYNC_FOLLOW", false),
		Interval:      time.Duration(getEnvInt("SOLAR_SYNC_INTERVAL_MS", 15000)) * time.Millisecond,
		BatchSize:     clamp(getEnvInt("SOLAR_MIGRATION_BATCH_SIZE", 2000), 250, 5000),
		RefreshWindow: max(getEnvInt("SOLAR_TRANSACTION_REFRESH_WINDOW", 500), 250),
	}

	if getEnvBool("DATABASE_SSL", false) {
		cfg.PGSSLMode = "require"
	}

	// CLI Flags override
	fullFlag := flag.Bool("full", cfg.FullSync, "Run full synchronization/reconciliation")
	followFlag := flag.Bool("follow", cfg.Follow, "Run in daemon/follow mode continuously")
	intervalFlag := flag.Duration("interval", cfg.Interval, "Polling interval for daemon mode (e.g. 15s, 1m)")
	batchSizeFlag := flag.Int("batch-size", cfg.BatchSize, "Batch size for reading/writing records")
	refreshWindowFlag := flag.Int("refresh-window", cfg.RefreshWindow, "Sliding window size to recheck recent/active transactions")

	flag.Parse()

	cfg.FullSync = *fullFlag
	cfg.Follow = *followFlag
	if *intervalFlag > 0 {
		cfg.Interval = *intervalFlag
	}
	cfg.BatchSize = clamp(*batchSizeFlag, 250, 5000)
	cfg.RefreshWindow = max(*refreshWindowFlag, 250)

	return cfg
}

func (c *Config) MySQLDSN() string {
	// dateStrings=true & parseTime=false / parseTime=true
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?timeout=10s&readTimeout=30s&writeTimeout=30s",
		c.MySQLUser,
		c.MySQLPassword,
		c.MySQLHost,
		c.MySQLPort,
		c.MySQLDatabase,
	)
}

func (c *Config) PostgresConnString() string {
	if c.PGURL != "" {
		return c.PGURL
	}
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
		url.QueryEscape(c.PGUser),
		url.QueryEscape(c.PGPassword),
		c.PGHost,
		c.PGPort,
		c.PGDatabase,
		c.PGSSLMode,
	)
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		if b, err := strconv.ParseBool(val); err == nil {
			return b
		}
	}
	return fallback
}

func clamp(val, minVal, maxVal int) int {
	if val < minVal {
		return minVal
	}
	if val > maxVal {
		return maxVal
	}
	return val
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
