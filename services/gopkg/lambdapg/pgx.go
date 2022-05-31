package lambdapg

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
)

type Connector interface {
	Connect(context.Context, string) (SQLDB, error)
}

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
}

type PG struct {
	Conn func(context.Context, string) (*pgx.Conn, error)
}

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

func NewConnector(
	connect func(context.Context, string) (*pgx.Conn, error),
) *PG {
	return &PG{connect}
}

type DB struct {
	pg *pgx.Conn
}

func (db *DB) Begin(ctx context.Context) (pgx.Tx, error) {
	return db.pg.Begin(ctx)
}

func (db *DB) Close(ctx context.Context) error {
	if db.pg != nil {
		return db.pg.Close(ctx)
	}
	return nil
}

func (db *DB) IsClosed() bool {
	return db.pg.IsClosed()
}

func (db *DB) QueryRow(
	ctx context.Context,
	sql string,
	args ...interface{},
) pgx.Row {
	return db.pg.QueryRow(ctx, sql, args...)
}

func (db *DB) Query(
	ctx context.Context,
	sql string,
	args ...interface{},
) (pgx.Rows, error) {
	return db.pg.Query(ctx, sql, args...)
}

func (db *DB) Exec(
	ctx context.Context,
	sql string,
	args ...interface{},
) (pgconn.CommandTag, error) {
	return db.pg.Exec(ctx, sql, args...)
}

func NewDB() *DB {
	return &DB{}
}
