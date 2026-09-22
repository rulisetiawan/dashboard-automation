package util

import (
	"encoding/json"
	"strings"
)

// CleanString removes NUL bytes and trims whitespace.
func CleanString(val string) string {
	cleaned := strings.ReplaceAll(val, "\x00", "")
	return strings.TrimSpace(cleaned)
}

// CleanTextPointer returns nil if string is empty after cleaning, or pointer to cleaned string.
func CleanTextPointer(val *string) *string {
	if val == nil {
		return nil
	}
	cleaned := CleanString(*val)
	if cleaned == "" {
		return nil
	}
	return &cleaned
}

// CleanStringValue returns pointer to cleaned string or nil if empty.
func CleanStringValue(val string) *string {
	cleaned := CleanString(val)
	if cleaned == "" {
		return nil
	}
	return &cleaned
}

// NormalizeStatus translates MySQL status string to standardized transaction_status enum.
func NormalizeStatus(val string) string {
	status := strings.ToUpper(CleanString(val))
	switch status {
	case "TERPAKAI":
		return "COMPLETED"
	case "AKTIF":
		return "READY"
	case "TIDAK AKTIF":
		return "CANCELLED"
	default:
		return "MANUAL_REVIEW"
	}
}

// ExecutionMode maps process_type to execution_mode.
func ExecutionMode(val string) string {
	mode := strings.ToLower(CleanString(val))
	if mode == "manual" {
		return "MANUAL"
	}
	return "QR"
}

// CanonicalJSON marshals a map with deterministic sorted keys.
func CanonicalJSON(data map[string]any) (string, error) {
	bytes, err := json.Marshal(data)
	if err != nil {
		return "{}", err
	}
	return string(bytes), nil
}
