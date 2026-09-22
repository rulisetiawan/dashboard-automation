package util

import (
	"testing"
	"time"
)

func TestSanitizer(t *testing.T) {
	if CleanString("hello\x00world  ") != "helloworld" {
		t.Errorf("unexpected CleanString result")
	}

	ptr := CleanStringValue("  test\x00  ")
	if ptr == nil || *ptr != "test" {
		t.Errorf("unexpected CleanStringValue result")
	}

	emptyPtr := CleanStringValue("   \x00   ")
	if emptyPtr != nil {
		t.Errorf("expected nil for empty cleaned string")
	}

	if NormalizeStatus("TERPAKAI") != "COMPLETED" {
		t.Errorf("expected COMPLETED for TERPAKAI")
	}
	if NormalizeStatus("aktif") != "READY" {
		t.Errorf("expected READY for aktif")
	}
	if NormalizeStatus("TIDAK AKTIF") != "CANCELLED" {
		t.Errorf("expected CANCELLED for TIDAK AKTIF")
	}
	if NormalizeStatus("random") != "MANUAL_REVIEW" {
		t.Errorf("expected MANUAL_REVIEW for unknown")
	}

	if ExecutionMode("manual") != "MANUAL" {
		t.Errorf("expected MANUAL for manual")
	}
	if ExecutionMode("auto") != "QR" {
		t.Errorf("expected QR for auto")
	}
}

func TestTimeUtil(t *testing.T) {
	str := "2026-09-02 14:30:00"
	parsed, err := ParseSourceTimestamp(&str)
	if err != nil {
		t.Fatalf("failed to parse timestamp: %v", err)
	}
	if parsed == nil {
		t.Fatalf("expected non-nil parsed time")
	}

	_, offset := parsed.Zone()
	if offset != 7*3600 {
		t.Errorf("expected +07:00 offset, got %d", offset)
	}

	t1 := time.Date(2026, 9, 2, 10, 0, 0, 0, time.UTC)
	t2 := time.Date(2026, 9, 2, 11, 0, 0, 0, time.UTC)
	latest := LatestTimestamp(&t1, &t2, nil)
	if latest == nil || !latest.Equal(t2) {
		t.Errorf("expected t2 as latest timestamp")
	}
}
