package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
)

type Config struct {
	// MQTT Settings
	MQTTBroker   string
	MQTTClientID string
	MQTTUsername string
	MQTTPassword string
	MQTTTopic    string
	MQTTQoS      byte

	// PostgreSQL Settings
	PGHost     string
	PGPort     int
	PGUser     string
	PGPassword string
	PGDatabase string
	PGSSLMode  string
	PGURL      string
}

func Load() *Config {
	sslMode := "disable"
	if os.Getenv("DATABASE_SSL") == "true" {
		sslMode = "require"
	}

	qosInt := getEnvInt("MQTT_QOS", 1)
	if qosInt < 0 || qosInt > 2 {
		qosInt = 1
	}

	return &Config{
		MQTTBroker:   getEnv("MQTT_BROKER", "tcp://127.0.0.1:1883"),
		MQTTClientID: getEnv("MQTT_CLIENT_ID", "scada-ingest-worker"),
		MQTTUsername: getEnv("MQTT_USERNAME", "engineering"),
		MQTTPassword: getEnv("MQTT_PASSWORD", "admineng"),
		MQTTTopic:    getEnv("MQTT_TOPIC", "pt_smm/telemetry/#"),
		MQTTQoS:      byte(qosInt),

		PGHost:     getEnv("DB_HOST", "localhost"),
		PGPort:     getEnvInt("DB_PORT", 5432),
		PGUser:     getEnv("DB_USER", "postgres"),
		PGPassword: getEnv("DB_PASSWORD", "postgres"),
		PGDatabase: getEnv("DB_NAME", "pt_smm_scada"),
		PGSSLMode:  sslMode,
		PGURL:      getEnv("DATABASE_URL", ""),
	}
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

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return defaultVal
}
