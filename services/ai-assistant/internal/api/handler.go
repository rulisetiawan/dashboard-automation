package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"pt_smm_ai_assistant/internal/llm"
	"pt_smm_ai_assistant/internal/router"
)

type Handler struct {
	mlxClient *llm.Client
	router    *router.Router
}

func NewHandler(mlxClient *llm.Client, r *router.Router) *Handler {
	return &Handler{
		mlxClient: mlxClient,
		router:    r,
	}
}

type ChatRequestPayload struct {
	Message string `json:"message"`
	Context struct {
		ActivePage      string `json:"activePage"`
		Role            string `json:"role"`
		ActiveRole      string `json:"activeRole"`
		SelectedMachine string `json:"selectedMachine"`
		CustomRole      string `json:"customRole"`
		CustomPrompt    string `json:"customPrompt"`
		History         []struct {
			Sender  string `json:"sender"`
			Role    string `json:"role"`
			Text    string `json:"text"`
			Content string `json:"content"`
			Message string `json:"message"`
		} `json:"history"`
	} `json:"context"`
}

type ChatResponsePayload struct {
	OK        bool   `json:"ok"`
	Message   string `json:"message"`
	Reply     string `json:"reply"`
	Source    string `json:"source"`
	Model     string `json:"model"`
	Intent    string `json:"intent"`
	Timestamp string `json:"timestamp"`
	Error     string `json:"error,omitempty"`
}

func (h *Handler) HandleStatus(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	status := h.mlxClient.CheckStatus(ctx)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	_ = json.NewEncoder(w).Encode(status)
}

func (h *Handler) HandleAssist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Accept")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	var payload ChatRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"ok":false,"error":"Invalid JSON body"}`, http.StatusBadRequest)
		return
	}

	msg := strings.TrimSpace(payload.Message)
	if msg == "" {
		http.Error(w, `{"ok":false,"error":"Pesan tidak boleh kosong"}`, http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	activePage := payload.Context.ActivePage
	selectedMachine := payload.Context.SelectedMachine

	// 1. Target Data Slicing: Only fetch relevant facts based on intent
	slice := h.router.ResolveAndFetchSlices(ctx, msg, activePage, selectedMachine)
	log.Printf("[Intent] Detected: %s for query: %q", slice.Intent, msg)

	// 2. Build Compact System Prompt with only sliced facts
	systemPrompt := h.mlxClient.BuildSystemPrompt(slice.FactualData, payload.Context.CustomRole)

	// Convert history
	var history []llm.ChatMessage
	for _, item := range payload.Context.History {
		role := "user"
		if item.Role == "assistant" || item.Sender == "assistant" {
			role = "assistant"
		}
		content := item.Text
		if content == "" {
			content = item.Content
		}
		if content == "" {
			content = item.Message
		}
		if content != "" {
			history = append(history, llm.ChatMessage{Role: role, Content: content})
		}
	}

	// 3. Check if client wants SSE Streaming
	wantsStream := strings.Contains(r.Header.Get("Accept"), "text/event-stream") || r.URL.Query().Get("stream") == "true"

	if wantsStream {
		flusher, ok := w.(http.Flusher)
		if !ok {
			http.Error(w, "Streaming not supported", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		w.Header().Set("X-Accel-Buffering", "no")

		// First event: metadata (intent & status)
		metaJson, _ := json.Marshal(map[string]any{
			"intent": slice.Intent,
			"source": "mlx",
		})
		fmt.Fprintf(w, "event: metadata\ndata: %s\n\n", string(metaJson))
		flusher.Flush()

		err := h.mlxClient.StreamCompletion(ctx, systemPrompt, msg, history, func(token string) error {
			tokenJson, _ := json.Marshal(map[string]string{"token": token})
			fmt.Fprintf(w, "data: %s\n\n", string(tokenJson))
			flusher.Flush()
			return nil
		})

		if err != nil {
			log.Printf("[Stream Error] %v", err)
			errJson, _ := json.Marshal(map[string]string{"error": err.Error()})
			fmt.Fprintf(w, "event: error\ndata: %s\n\n", string(errJson))
			flusher.Flush()
		}

		fmt.Fprintf(w, "data: [DONE]\n\n")
		flusher.Flush()
		return
	}

	// 4. Non-Streaming JSON Response
	reply, err := h.mlxClient.GenerateCompletion(ctx, systemPrompt, msg, history)
	if err != nil {
		log.Printf("[Generate Error] %v", err)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(ChatResponsePayload{
			OK:        false,
			Message:   msg,
			Reply:     "⚠️ AI lokal (MLX port 8080) sedang tidak merespons. Pastikan server MLX aktif di host.",
			Source:    "offline",
			Model:     "offline",
			Intent:    string(slice.Intent),
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Error:     err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(ChatResponsePayload{
		OK:        true,
		Message:   msg,
		Reply:     reply,
		Source:    "mlx",
		Model:     "mlx-community/Llama-3.2-1B-Instruct-4bit",
		Intent:    string(slice.Intent),
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}
