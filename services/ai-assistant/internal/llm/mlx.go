package llm

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Client struct {
	baseURL    string
	model      string
	timeoutSec int
	httpClient *http.Client
}

func NewClient(baseURL, model string, timeoutSec int) *Client {
	return &Client{
		baseURL:    strings.TrimRight(baseURL, "/"),
		model:      model,
		timeoutSec: timeoutSec,
		httpClient: &http.Client{
			Timeout: time.Duration(timeoutSec) * time.Second,
		},
	}
}

type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Temperature float32       `json:"temperature"`
	MaxTokens   int           `json:"max_tokens"`
	Stream      bool          `json:"stream"`
}

type ChatCompletionResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
		Delta struct {
			Content string `json:"content"`
		} `json:"delta"`
	} `json:"choices"`
	Model string `json:"model"`
}

func (c *Client) BuildSystemPrompt(factualData, customRole string) string {
	role := "Asisten Insinyur Otomasi PT Sarana Makin Mulya (PT SMM)"
	if customRole != "" {
		role = customRole
	}

	return fmt.Sprintf(`Kamu adalah %s.
Jawab pertanyaan operator pabrik tekstil PT SMM secara ramah, ringkas, dan profesional dalam Bahasa Indonesia berdasarkan data di bawah ini. Sebutkan jumlah unit dan angka persis sebagaimana tercantum pada data tanpa mengubah angka. Langsung berikan inti jawaban.

FAKTA PABRIK:
%s`, role, factualData)
}

func cleanReply(reply string) string {
	reply = strings.TrimSpace(reply)
	reply = strings.ReplaceAll(reply, "<|im_end|>", "")
	reply = strings.ReplaceAll(reply, "<|endoftext|>", "")
	reply = strings.ReplaceAll(reply, "<|eot_id|>", "")
	reply = strings.ReplaceAll(reply, "[DATA OPERASIONAL PABRIK]:", "")
	reply = strings.ReplaceAll(reply, "[DATA OPERASIONAL PABRIK]", "")
	reply = strings.ReplaceAll(reply, "FAKTA PABRIK:", "")
	reply = strings.ReplaceAll(reply, "FAKTA PABRIK", "")
	return strings.TrimSpace(reply)
}

// GenerateCompletion calls MLX server non-streaming.
func (c *Client) GenerateCompletion(ctx context.Context, systemPrompt, userMessage string, history []ChatMessage) (string, error) {
	messages := []ChatMessage{
		{Role: "system", Content: systemPrompt},
	}
	// Append up to 3 recent history messages
	if len(history) > 3 {
		history = history[len(history)-3:]
	}
	messages = append(messages, history...)
	messages = append(messages, ChatMessage{Role: "user", Content: userMessage})

	reqBody := ChatCompletionRequest{
		Model:       c.model,
		Messages:    messages,
		Temperature: 0.1,
		MaxTokens:   350,
		Stream:      false,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/v1/chat/completions", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("mlx call failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("mlx returned status %d: %s", resp.StatusCode, string(body))
	}

	var chatResp ChatCompletionResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", fmt.Errorf("decode mlx response: %w", err)
	}

	if len(chatResp.Choices) == 0 {
		return "", fmt.Errorf("empty choices from mlx")
	}

	return cleanReply(chatResp.Choices[0].Message.Content), nil
}

// StreamCompletion streams tokens from MLX to an SSE callback.
func (c *Client) StreamCompletion(ctx context.Context, systemPrompt, userMessage string, history []ChatMessage, onToken func(token string) error) error {
	messages := []ChatMessage{
		{Role: "system", Content: systemPrompt},
	}
	if len(history) > 3 {
		history = history[len(history)-3:]
	}
	messages = append(messages, history...)
	messages = append(messages, ChatMessage{Role: "user", Content: userMessage})

	reqBody := ChatCompletionRequest{
		Model:       c.model,
		Messages:    messages,
		Temperature: 0.1,
		MaxTokens:   350,
		Stream:      true,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/v1/chat/completions", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	// Use a client without global timeout for streaming, relying on ctx
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("mlx stream call failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("mlx stream returned status %d: %s", resp.StatusCode, string(body))
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}
		if !strings.HasPrefix(line, "data: ") {
			continue
		}
		dataStr := strings.TrimPrefix(line, "data: ")
		if dataStr == "[DONE]" {
			break
		}

		var chunk ChatCompletionResponse
		if err := json.Unmarshal([]byte(dataStr), &chunk); err != nil {
			continue
		}

		if len(chunk.Choices) > 0 {
			token := chunk.Choices[0].Delta.Content
			if token != "" {
				if err := onToken(token); err != nil {
					return err
				}
			}
		}
	}
	return scanner.Err()
}

type StatusResult struct {
	OK              bool     `json:"ok"`
	Online          bool     `json:"online"`
	Provider        string   `json:"provider"`
	Engine          string   `json:"engine"`
	Host            string   `json:"host"`
	ActiveModel     string   `json:"activeModel"`
	AvailableModels []string `json:"availableModels"`
}

func (c *Client) CheckStatus(ctx context.Context) StatusResult {
	url := fmt.Sprintf("%s/v1/models", c.baseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return StatusResult{
			OK: false, Online: false, Provider: "mlx", Engine: "mlx",
			ActiveModel: "offline", AvailableModels: []string{},
		}
	}

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return StatusResult{
			OK: false, Online: false, Provider: "mlx", Engine: "mlx",
			Host: c.baseURL, ActiveModel: "offline", AvailableModels: []string{},
		}
	}
	defer resp.Body.Close()

	var data struct {
		Data []struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return StatusResult{
			OK: false, Online: false, Provider: "mlx", Engine: "mlx",
			Host: c.baseURL, ActiveModel: "offline", AvailableModels: []string{},
		}
	}

	var models []string
	for _, m := range data.Data {
		models = append(models, m.ID)
	}
	activeModel := c.model

	return StatusResult{
		OK:              true,
		Online:          true,
		Provider:        "mlx",
		Engine:          "mlx",
		Host:            c.baseURL,
		ActiveModel:     activeModel,
		AvailableModels: models,
	}
}
