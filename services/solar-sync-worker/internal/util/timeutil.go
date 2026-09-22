package util

import (
	"strings"
	"time"
)

var wibLocation = time.FixedZone("WIB", 7*3600)

var datetimeFormats = []string{
	"2006-01-02 15:04:05.999999",
	"2006-01-02 15:04:05",
	"2006-01-02T15:04:05.999999",
	"2006-01-02T15:04:05",
	time.RFC3339Nano,
	time.RFC3339,
	"2006-01-02",
}

// ParseSourceTimestamp parses date/datetime strings from MySQL into time.Time with WIB (+07:00) zone.
func ParseSourceTimestamp(val *string) (*time.Time, error) {
	if val == nil {
		return nil, nil
	}
	text := strings.TrimSpace(*val)
	if text == "" || text == "0000-00-00 00:00:00" || text == "0000-00-00" {
		return nil, nil
	}

	for _, format := range datetimeFormats {
		if t, err := time.ParseInLocation(format, text, wibLocation); err == nil {
			return &t, nil
		}
	}

	// Try without zone assuming WIB
	cleaned := strings.Replace(text, " ", "T", 1)
	if !strings.Contains(cleaned, "+") && !strings.HasSuffix(cleaned, "Z") {
		cleaned += "+07:00"
	}
	t, err := time.Parse(time.RFC3339Nano, cleaned)
	if err == nil {
		return &t, nil
	}
	t2, err2 := time.Parse(time.RFC3339, cleaned)
	if err2 == nil {
		return &t2, nil
	}

	return nil, err
}

// LatestTimestamp returns the latest non-nil time.Time among arguments.
func LatestTimestamp(times ...*time.Time) *time.Time {
	var latest *time.Time
	for _, t := range times {
		if t == nil {
			continue
		}
		if latest == nil || t.After(*latest) {
			latest = t
		}
	}
	return latest
}
