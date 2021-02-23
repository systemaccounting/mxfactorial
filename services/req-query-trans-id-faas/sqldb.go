package faas

import (
	"context"

	"github.com/jackc/pgx/v4"
)

// Connector ...
type Connector interface {
	Connect(context.Context, string) (SQLDB, error)
}

// SQLDB ...
type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	Close(context.Context) error
	Unmarshal(context.Context, pgx.Rows, *Transactions) error
}
