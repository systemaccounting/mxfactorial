package types

import (
	"fmt"
	"time"

	"github.com/jackc/pgtype"
	"github.com/jackc/pgx/v4"
)

type TransactionNotification struct {
	ID            *ID           `json:"id"`
	TransactionID *ID           `json:"transaction_id"`
	AccountName   *string       `json:"account_name"`
	AccountRole   *string       `json:"account_role"`
	Message       *pgtype.JSONB `json:"message"`
	CreatedAt     *time.Time    `json:"created_at"`
}

type TransactionNotifications []*TransactionNotification

func (t *TransactionNotifications) ScanRows(rows pgx.Rows) error {
	defer rows.Close()

	for rows.Next() {

		n := new(TransactionNotification)

		err := rows.Scan(
			&n.ID,
			&n.TransactionID,
			&n.AccountName,
			&n.AccountRole,
			&n.Message,
			&n.CreatedAt,
		)

		if err != nil {
			return fmt.Errorf("TransactionNotifications scan: %v", err)
		}

		*t = append(*t, n)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("TransactionNotifications rows: %v", err)
	}

	return nil
}

func (t *TransactionNotifications) ScanIDs(rows pgx.Rows) error {
	defer rows.Close()

	for rows.Next() {

		n := new(TransactionNotification)

		err := rows.Scan(
			&n.ID,
		)

		if err != nil {
			return fmt.Errorf("TransactionNotifications scan: %v", err)
		}

		*t = append(*t, n)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("TransactionNotifications rows: %v", err)
	}

	return nil
}

func (trs TransactionNotifications) ListIDs() IDs {
	var trIDs IDs

	for _, v := range trs {
		trIDs = append(trIDs, v.ID)
	}

	return trIDs
}

type NotificationEvent struct {
	Service *string
}

type TransactionNotificationEvent struct {
	NotificationEvent
	TransactionNotification
}

type Message struct {
	NotificationID *ID          `json:"notification_id"`
	Message        pgtype.JSONB `json:"message"`
}

type PendingNotifications struct {
	Pending []*Message `json:"pending"`
}

type ClearedNotifications struct {
	Cleared []*ID `json:"cleared"`
}

type NotificationAndWebsockets struct {
	Notification *TransactionNotification
	Websockets   []*Websocket
}
