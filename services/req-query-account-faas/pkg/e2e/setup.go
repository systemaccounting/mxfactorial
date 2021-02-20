package e2e

import (
	"context"
	"encoding/json"
	"io/ioutil"

	"github.com/jackc/pgx/v4"
	faas "github.com/systemaccouting/mxfactorial/services/req-query-account-faas"
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

	ascOrderTransactions, err := LoadJSONData(path)
	if err != nil {
		return nil, err
	}
	var trans faas.Transactions

	// api returns transactions in descending order
	// reverse transaction list to match
	for y := len(ascOrderTransactions) - 1; y >= 0; y-- {
		trans = append(trans, ascOrderTransactions[y])
	}

	conn, err := pgx.Connect(context.Background(), pgConn)
	if err != nil {
		return nil, err
	}
	defer conn.Close(context.Background())

	var ascOrderQueryResponse []int32

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
		ascOrderQueryResponse = append(ascOrderQueryResponse, id)
	}

	// api returns transactions in descending order
	// reverse id list to match
	var addedIDs []int32
	for j := len(ascOrderQueryResponse) - 1; j >= 0; j-- {
		addedIDs = append(addedIDs, ascOrderQueryResponse[j])
	}

	return addedIDs, nil
}
