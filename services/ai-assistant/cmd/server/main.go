package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pt_smm_ai_assistant/internal/api"
	"pt_smm_ai_assistant/internal/config"
	"pt_smm_ai_assistant/internal/llm"
	"pt_smm_ai_assistant/internal/repository"
	"pt_smm_ai_assistant/internal/router"
)

func main() {
	cfg := config.Load()
	log.Printf("[AI Service] Starting PT SMM AI Gateway on port :%s", cfg.Port)
	log.Printf("[AI Service] Connecting to MLX server at %s (Model: %s)", cfg.MLXURL, cfg.MLXModel)

	// Connect to Database (Read-Only)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	repo, err := repository.New(ctx, cfg.DBConnString())
	if err != nil {
		log.Printf("[AI Service] WARNING: Database connection failed (%v). Service will run with offline DB fallback.", err)
	} else {
		defer repo.Close()
		log.Printf("[AI Service] PostgreSQL database pool connected successfully (Read-Only).")
	}

	mlxClient := llm.NewClient(cfg.MLXURL, cfg.MLXModel, cfg.MLXTimeoutSeconds)
	intentRouter := router.New(repo)
	handler := api.NewHandler(mlxClient, intentRouter)

	mux := http.NewServeMux()

	// Health Check
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("OK"))
	})

	// Status Routes
	mux.HandleFunc("GET /api/v1/ai-status", handler.HandleStatus)
	mux.HandleFunc("GET /api/ai-status", handler.HandleStatus)

	// Assist Routes
	mux.HandleFunc("POST /api/v1/ai-assist", handler.HandleAssist)
	mux.HandleFunc("POST /api/ai-assist", handler.HandleAssist)
	mux.HandleFunc("OPTIONS /api/v1/ai-assist", handler.HandleAssist)
	mux.HandleFunc("OPTIONS /api/ai-assist", handler.HandleAssist)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("[AI Service] Listen error: %v", err)
		}
	}()

	log.Printf("[AI Service] Ready and listening on http://0.0.0.0:%s", cfg.Port)

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[AI Service] Shutting down gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("[AI Service] Server forced to shutdown: %v", err)
	}

	log.Println("[AI Service] Exited cleanly.")
}
