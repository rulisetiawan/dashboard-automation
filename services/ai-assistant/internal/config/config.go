package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	Port              string
	DBHost            string
	DBPort            string
	DBUser            string
	DBPassword        string
	DBName            string
	MLXURL            string
	MLXModel          string
	MLXTimeoutSeconds int
}

func Load() *Config {
	port := getEnv("PORT", "8090")
	dbHost := getEnv("DB_HOST", "postgres")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "pt_smm_scada")

	mlxURL := getEnv("MLX_URL", "http://host.orb.internal:8080")
	mlxModel := getEnv("MLX_MODEL", "mlx-community/Llama-3.2-1B-Instruct-4bit")

	timeoutSec := 25
	if rawTimeout := os.Getenv("MLX_TIMEOUT_SECONDS"); rawTimeout != "" {
		if val, err := strconv.Atoi(rawTimeout); err == nil && val > 0 {
			timeoutSec = val
		}
	}

	return &Config{
		Port:              port,
		DBHost:            dbHost,
		DBPort:            dbPort,
		DBUser:            dbUser,
		DBPassword:        dbPassword,
		DBName:            dbName,
		MLXURL:            mlxURL,
		MLXModel:          mlxModel,
		MLXTimeoutSeconds: timeoutSec,
	}
}

func (c *Config) DBConnString() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
