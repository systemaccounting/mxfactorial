package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
)

func getLastNTransactions(db *sql.DB, queryString string, limit int) (string, error) {

	rows, err := db.Query(queryString, limit)

	if err != nil {
		log.Fatal(err)
	}

	transactions := make([]*transaction, 0)

	defer rows.Close()

	for rows.Next() {
		item := new(transaction)
		err := rows.Scan(
			&item.TableID, &item.Name, &item.Price, &item.Quantity,
			&item.UnitOfMeasurement, &item.UnitsMeasured, &item.RuleInstanceID,
			&item.TransactionID, &item.Author, &item.ExpirationTime, &item.Debitor,
			&item.Creditor, &item.DebitorProfileLatLng, &item.CreditorProfileLatlng, &item.DebitorTransactionLatLng,
			&item.CreditorTransactionLatLng, &item.DebitorApprovalTime, &item.CreditorApprovalTime, &item.DebitorDevice,
			&item.CreditorDevice, &item.DebitApprover, &item.CreditApprover, &item.CreditorRejectionTime,
			&item.DebitorRejectionTime,
		)
		transactions = append(transactions, item)
		if err != nil {
			log.Fatal(err)
		}
		// log.Println(&item.TableID, )
	}

	err = rows.Err()

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	transactionsJSON, err := json.Marshal(transactions)

	if err != nil {
		log.Fatal("Cannot encode to JSON", err)
	}

	jsonString := string(transactionsJSON)
	fmt.Println(jsonString)
	return jsonString, nil
}
