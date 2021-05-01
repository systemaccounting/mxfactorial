package types

import (
	"time"

	"github.com/jackc/pgtype"
)

type TransactionNotification struct {
	ID            *ID           `json:"id"`
	TransactionID *ID           `json:"transaction_id"`
	AccountName   *string       `json:"account_name"`
	AccountRole   *string       `json:"account_role"`
	Message       *pgtype.JSONB `json:"message"`
	CreatedAt     *time.Time    `json:"created_at"`
}

type NotificationEvent struct {
	Service *string
}

type TransactionNotificationEvent struct {
	NotificationEvent
	TransactionNotification
}
