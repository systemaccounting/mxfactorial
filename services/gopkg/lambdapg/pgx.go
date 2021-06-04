package lambdapg

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
)

// Connector ...
type Connector interface {
	Connect(context.Context, string) (SQLDB, error)
}

// SQLDB ...
type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Close(context.Context) error
}

// PG ...
type PG struct {
	Conn func(context.Context, string) (*pgx.Conn, error)
}

// Connect ...
func (p *PG) Connect(
	ctx context.Context,
	pgConn string,
) (SQLDB, error) {
	c, err := p.Conn(ctx, pgConn)
	if err != nil {
		return nil, err
	}
	return &DB{c}, nil
}

// NewConnector ...
func NewConnector(
	connect func(context.Context, string) (*pgx.Conn, error),
) *PG {
	return &PG{connect}
}

// DB ...
type DB struct {
	pg *pgx.Conn
}

// NewDB ...
func NewDB() *DB {
	return &DB{}
}

// Query TODO cover
func (db *DB) Query(
	ctx context.Context,
	sql string,
	args ...interface{},
) (pgx.Rows, error) {
	return db.pg.Query(ctx, sql, args...)
}

// QueryRow TODO cover
func (db *DB) QueryRow(
	ctx context.Context,
	sql string,
	args ...interface{},
) pgx.Row {
	return db.pg.QueryRow(ctx, sql, args...)
}

// Exec TODO cover
func (db *DB) Exec(
	ctx context.Context,
	sql string,
	args ...interface{},
) (pgconn.CommandTag, error) {
	return db.pg.Exec(ctx, sql, args...)
}

// Close TODO cover
func (db *DB) Close(ctx context.Context) error {
	if db.pg != nil {
		return db.pg.Close(ctx)
	}
	return nil
}
