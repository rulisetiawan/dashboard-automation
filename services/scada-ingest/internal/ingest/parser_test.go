package ingest

import (
	"testing"
)

func TestParseArrayPayload(t *testing.T) {
	payload := []byte(`[
		{
			"asset_id": "JETFLOW_01",
			"tag_code": "JF01_TEMP_ACTUAL",
			"source_ts": "2026-09-23T08:35:00.125Z",
			"value_number": 85.50,
			"value_text": null,
			"quality": "GOOD",
			"gateway_id": "plc-gateway-01",
			"message_id": "8f3b2a14-7e8c-4a31-b8d9-2c3e1a5f6e7d"
		},
		{
			"asset_id": "JETFLOW_01",
			"tag_code": "JF01_PUMP_RUN",
			"source_ts": "2026-09-23T08:35:00.125Z",
			"value_number": 1.0,
			"value_text": "true",
			"quality": "GOOD",
			"gateway_id": "plc-gateway-01",
			"message_id": "8f3b2a14-7e8c-4a31-b8d9-2c3e1a5f6e7d"
		}
	]`)

	samples, err := ParseMessage(payload, "JETFLOW_01")
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if len(samples) != 2 {
		t.Fatalf("Expected 2 samples, got %d", len(samples))
	}

	s1 := samples[0]
	if s1.AssetID != "JETFLOW_01" || s1.TagCode != "JF01_TEMP_ACTUAL" {
		t.Errorf("Mismatch in sample 1: %+v", s1)
	}
	if s1.ValueNumber == nil || *s1.ValueNumber != 85.50 {
		t.Errorf("Mismatch in sample 1 value: %+v", s1.ValueNumber)
	}
	if s1.Quality != "GOOD" {
		t.Errorf("Mismatch in sample 1 quality: %s", s1.Quality)
	}

	s2 := samples[1]
	if s2.ValueText == nil || *s2.ValueText != "true" {
		t.Errorf("Mismatch in sample 2 valueText: %+v", s2.ValueText)
	}
}

func TestExtractAssetFromTopic(t *testing.T) {
	tests := []struct {
		topic    string
		expected string
	}{
		{"pt_smm/telemetry/JETFLOW_01", "JETFLOW_01"},
		{"pt_smm/telemetry/IPAL_EQUALISASI", "IPAL_EQUALISASI"},
		{"pt_smm/telemetry/CALATOR_01", "CALATOR_01"},
	}

	for _, tt := range tests {
		got := ExtractAssetFromTopic(tt.topic)
		if got != tt.expected {
			t.Errorf("ExtractAssetFromTopic(%q) = %q, want %q", tt.topic, got, tt.expected)
		}
	}
}
