@echo off
title SCADA Telemetry Ingest Worker
echo ==============================================================
echo   PT SMM SCADA Telemetry Ingest Worker (Go)
echo ==============================================================
echo Menghubungkan ke EMQX (192.168.100.82:1883) dan PostgreSQL (192.168.100.82:5433)...
echo.
set DB_HOST=192.168.100.82
set DB_PORT=5433
set DB_USER=postgres
set DB_PASSWORD=sensorSMM!
set DB_NAME=pt_smm_scada
set MQTT_BROKER=tcp://192.168.100.82:1883
set MQTT_CLIENT_ID=scada-ingest-worker
set MQTT_USERNAME=engineering
set MQTT_PASSWORD=admineng
set MQTT_TOPIC=pt_smm/telemetry/#

go run cmd/worker/main.go
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Worker berhenti atau gagal dijalankan.
    pause
)
