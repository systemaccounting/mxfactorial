package types

import "time"

type Websocket struct {
	ID             *ID        `json:"id"`
	ConnectionID   *string    `json:"connection_id"`
	AccountName    *string    `json:"account_name"`
	EpochCreatedAt *int64     `json:"epoch_created_at"`
	CreatedAt      *time.Time `json:"created_at"`
}
