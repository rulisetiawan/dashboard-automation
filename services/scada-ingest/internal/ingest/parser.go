package ingest

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/google/uuid"
	"pt_smm_scada_ingest/internal/db"
)

type rawSample struct {
	AssetID     *string         `json:"asset_id"`
	TagCode     string          `json:"tag_code"`
	SourceTS    string          `json:"source_ts"`
	ValueNumber *float64        `json:"value_number"`
	ValueText   *string         `json:"value_text"`
	Value       json.RawMessage `json:"value"`
	Quality     string          `json:"quality"`
	GatewayID   *string         `json:"gateway_id"`
	MessageID   string          `json:"message_id"`
}

type envelope struct {
	Samples []rawSample `json:"samples"`
}

// ParseMessage parses raw MQTT payload into normalized db.TelemetrySample slice.
// If asset_id is not specified in the payload, topicAssetID extracted from MQTT topic will be used.
func ParseMessage(payload []byte, topicAssetID string) ([]db.TelemetrySample, error) {
	trimmed := strings.TrimSpace(string(payload))
	if trimmed == "" {
		return nil, nil
	}

	var rawList []rawSample

	if strings.HasPrefix(trimmed, "[") {
		if err := json.Unmarshal(payload, &rawList); err != nil {
			return nil, err
		}
	} else {
		// Check if it's an envelope {"samples": [...]}
		var env envelope
		if err := json.Unmarshal(payload, &env); err == nil && len(env.Samples) > 0 {
			rawList = env.Samples
		} else {
			// Single object
			var single rawSample
			if err := json.Unmarshal(payload, &single); err != nil {
				return nil, err
			}
			rawList = []rawSample{single}
		}
	}

	now := time.Now().UTC()
	var samples []db.TelemetrySample

	for _, item := range rawList {
		tagCode := strings.TrimSpace(item.TagCode)
		if tagCode == "" {
			continue
		}

		assetID := topicAssetID
		if item.AssetID != nil && strings.TrimSpace(*item.AssetID) != "" {
			assetID = strings.TrimSpace(*item.AssetID)
		}
		if assetID == "" {
			continue
		}

		// Source Timestamp
		sourceTS := now
		if item.SourceTS != "" {
			if parsed, err := time.Parse(time.RFC3339Nano, item.SourceTS); err == nil {
				sourceTS = parsed.UTC()
			} else if parsed, err := time.Parse(time.RFC3339, item.SourceTS); err == nil {
				sourceTS = parsed.UTC()
			}
		}

		// Quality
		quality := strings.TrimSpace(item.Quality)
		if quality == "" {
			quality = "GOOD"
		} else {
			quality = strings.ToUpper(quality)
		}

		// Message ID
		msgID := strings.TrimSpace(item.MessageID)
		if _, err := uuid.Parse(msgID); err != nil {
			msgID = uuid.New().String()
		}

		// Gateway ID
		var gatewayID *string
		if item.GatewayID != nil && strings.TrimSpace(*item.GatewayID) != "" {
			cleaned := strings.TrimSpace(*item.GatewayID)
			gatewayID = &cleaned
		}

		// Values
		valNum := item.ValueNumber
		valText := item.ValueText

		if valNum == nil && valText == nil && len(item.Value) > 0 {
			var num float64
			if err := json.Unmarshal(item.Value, &num); err == nil {
				valNum = &num
			} else {
				var str string
				if err := json.Unmarshal(item.Value, &str); err == nil {
					valText = &str
				} else {
					rawStr := string(item.Value)
					valText = &rawStr
				}
			}
		}

		samples = append(samples, db.TelemetrySample{
			AssetID:     assetID,
			TagCode:     tagCode,
			SourceTS:    sourceTS,
			ValueNumber: valNum,
			ValueText:   valText,
			Quality:     quality,
			GatewayID:   gatewayID,
			MessageID:   msgID,
		})
	}

	return samples, nil
}

// ExtractAssetFromTopic extracts asset_id from MQTT topic, e.g. "pt_smm/telemetry/JETFLOW_01" -> "JETFLOW_01"
func ExtractAssetFromTopic(topic string) string {
	parts := strings.Split(strings.Trim(topic, "/"), "/")
	if len(parts) >= 3 && parts[0] == "pt_smm" && parts[1] == "telemetry" {
		return parts[2]
	}
	if len(parts) > 0 {
		return parts[len(parts)-1]
	}
	return ""
}
