package e2e

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v4"
)

// CreateDeletSQL ...
func CreateDeletSQL(ids []int32) string {
	var initSQL string = "DELETE FROM transactions WHERE id in ("
	for i := 1; i < len(ids)+1; i++ {
		initSQL = initSQL + fmt.Sprintf("$%d,", i)
	}
	var trimmedSQL string = strings.TrimSuffix(initSQL, ",")
	var sql string = trimmedSQL + ") RETURNING id;"
	return sql
}

// CreateParameters ...
func CreateParameters(ids []int32) []interface{} {
	slice := make([]interface{}, len(ids))
	for i, v := range ids {
		slice[i] = v
	}
	return slice
}

// TearDown ...
func TearDown(pgConn, sql string, params []interface{}) ([]int32, error) {
	conn, err := pgx.Connect(context.Background(), pgConn)
	if err != nil {
		return nil, err
	}
	defer conn.Close(context.Background())
	var ascOrderIDs []int32
	rows, err := conn.Query(context.Background(), sql, params...)
	for rows.Next() {
		var id int32
		err = rows.Scan(&id)
		if err != nil {
			return nil, err
		}
		ascOrderIDs = append(ascOrderIDs, id)
	}
	if rows.Err() != nil {
		return nil, err
	}
	var deletedIDs []int32
	for y := len(ascOrderIDs) - 1; y >= 0; y-- {
		deletedIDs = append(deletedIDs, ascOrderIDs[y])
	}

	return deletedIDs, nil
}
