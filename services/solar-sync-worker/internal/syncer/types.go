package syncer

import (
	"database/sql"
	"time"
)

type QRCodeSourceRow struct {
	ID               int64
	Code             sql.NullString
	Jumlah           sql.NullFloat64
	ActualSolar      sql.NullFloat64
	TotalSolarIn     sql.NullFloat64
	TotalSolarOut    sql.NullFloat64
	CalculatedVolume sql.NullFloat64
	ProcessType      sql.NullString
	Status           sql.NullString
	DateCreated      sql.NullString
	ProcessAt        sql.NullString
	DateActivated    sql.NullString
	NamaPemesan      sql.NullString
	NamaPembuat      sql.NullString
	ProcessBy        sql.NullString
	Keterangan       sql.NullString
	RawRecord        map[string]any
}

type SolarLevelSourceRow struct {
	ID        int64
	Stock     sql.NullFloat64
	CreatedAt sql.NullString
	UpdateAt  sql.NullString
}

type SyncResult struct {
	SourceTable string     `json:"sourceTable"`
	Scanned     int        `json:"scanned"`
	Processed   int        `json:"processed"`
	Total       int        `json:"total"`
	BadCount    int        `json:"badCount,omitempty"`
	LastID      int64      `json:"lastId"`
	LastTS      *time.Time `json:"lastTs,omitempty"`
}
