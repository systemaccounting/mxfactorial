package pg

import (
	"context"
	"log"

	"github.com/jackc/pgx/v4"
	faas "github.com/systemaccounting/mxfactorial/services/trans-query-account-faas"
)

// PG ...
type PG struct {
	Conn func(context.Context, string) (*pgx.Conn, error)
}

// Connect ...
func (p *PG) Connect(
	ctx context.Context,
	pgConn string,
) (faas.SQLDB, error) {
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

// Close TODO cover
func (db *DB) Close(ctx context.Context) error {
	if db.pg != nil {
		return db.pg.Close(ctx)
	}
	return nil
}

// Unmarshal ...
func (db *DB) Unmarshal(
	ctx context.Context,
	rows pgx.Rows,
	trs *faas.Transactions,
) error {
	defer db.Close(ctx)
	defer rows.Close()
	for rows.Next() {
		var item faas.Transaction
		err := rows.Scan(
			&item.TableID,
			&item.Name,
			&item.Price,
			&item.Quantity,
			&item.UnitOfMeasurement,
			&item.UnitsMeasured,
			&item.RuleInstanceID,
			&item.TransactionID,
			&item.Author,
			&item.ExpirationTime,
			&item.Debitor,
			&item.Creditor,
			&item.DebitorProfileLatLng,
			&item.CreditorProfileLatlng,
			&item.DebitorTransactionLatLng,
			&item.CreditorTransactionLatLng,
			&item.DebitorApprovalTime,
			&item.CreditorApprovalTime,
			&item.DebitorDevice,
			&item.CreditorDevice,
			&item.DebitApprover,
			&item.CreditApprover,
			&item.CreditorRejectionTime,
			&item.DebitorRejectionTime,
			&item.CreatedAt,
		)
		if err != nil {
			return err
		}
		*trs = append(*trs, &item)
	}

	err := rows.Err()
	if err != nil {
		log.Print(err)
		return err
	}

	return nil
}
