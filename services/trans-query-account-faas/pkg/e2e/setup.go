package e2e

import (
	"context"
	"encoding/json"
	"io/ioutil"

	"github.com/jackc/pgx/v4"
	faas "github.com/systemaccounting/mxfactorial/services/trans-query-account-faas"
)

// LoadJSONData ...
func LoadJSONData(path string) (faas.Transactions, error) {
	f, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var trans faas.Transactions
	err = json.Unmarshal(f, &trans)
	return trans, nil
}

// Setup ...
func Setup(path, pgConn, sql string) ([]int32, error) {

	trans, err := LoadJSONData(path)
	if err != nil {
		return nil, err
	}

	conn, err := pgx.Connect(context.Background(), pgConn)
	if err != nil {
		return nil, err
	}
	defer conn.Close(context.Background())

	var addedIDs []int32

	for _, v := range trans {

		params := []interface{}{
			v.Name,
			v.Price,
			v.Quantity,
			v.RuleInstanceID,
			v.TransactionID,
			v.Author,
			v.Debitor,
			v.Creditor,
			v.DebitorApprovalTime,
			v.CreditorApprovalTime,
		}

		var id int32

		err := conn.QueryRow(context.Background(), sql, params...).Scan(&id)
		if err != nil {
			return nil, err
		}
		addedIDs = append(addedIDs, id)
	}

	return addedIDs, nil
}
