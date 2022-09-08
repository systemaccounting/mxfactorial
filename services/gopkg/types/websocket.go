package types

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v4"
)

type Websocket struct {
	ID             *ID        `json:"id"`
	ConnectionID   *string    `json:"connection_id"` // e.g. "L0SM9cOFvHcCIhw="
	AccountName    *string    `json:"account_name"`
	EpochCreatedAt *int64     `json:"epoch_created_at"`
	CreatedAt      *time.Time `json:"created_at"`
}

func (ws *Websocket) Scan(row pgx.Row) error {

	err := row.Scan(
		&ws.ID,
		&ws.ConnectionID,
		&ws.AccountName,
		&ws.EpochCreatedAt,
		&ws.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("Websocket scan: %v", err)
	}

	return nil
}

type Websockets []*Websocket

func (ws *Websockets) ScanRows(rows pgx.Rows) error {
	defer rows.Close()
	for rows.Next() {

		w := new(Websocket)

		err := rows.Scan(
			&w.ID,
			&w.ConnectionID,
			&w.AccountName,
			&w.EpochCreatedAt,
			&w.CreatedAt,
		)
		if err != nil {
			return fmt.Errorf("Websockets scan: %v", err)
		}

		*ws = append(*ws, w)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("Websockets rows %v", err)
	}

	return nil
}
