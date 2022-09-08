package postgres

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
)

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

func NewDB(ctx context.Context, dsn string) (*DB, error) {
	db, err := pgx.Connect(ctx, dsn)
	if err != nil {
		return nil, err
	}
	return &DB{db}, nil
}
