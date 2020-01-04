package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq"
)

type lambdaEvent struct {
	TransactionID        string `json:"transaction_id"`
	Account              string `json:"account"`
	GraphQLRequestSender string `json:"graphqlRequestSender"`
}

type transaction struct {
	TableID                   string     `json:"id"`
	Name                      string     `json:"name"`
	Quantity                  string     `json:"quantity"`
	Price                     string     `json:"price"`
	UnitOfMeasurement         NullString `json:"unit_of_measurement"`
	UnitsMeasured             NullString `json:"units_measured"`
	RuleInstanceID            NullString `json:"rule_instance_id"`
	TransactionID             NullString `json:"transaction_id"`
	Author                    NullString `json:"author"`
	ExpirationTime            NullString `json:"expiration_time"`
	Debitor                   NullString `json:"debitor"`
	Creditor                  NullString `json:"creditor"`
	DebitorProfileLatLng      NullString `json:"debitor_profile_latlng"`
	CreditorProfileLatlng     NullString `json:"creditor_profile_latlng"`
	DebitorTransactionLatLng  NullString `json:"debitor_transaction_latlng"`
	CreditorTransactionLatLng NullString `json:"creditor_transaction_latlng"`
	DebitorApprovalTime       NullString `json:"debitor_approval_time"`
	CreditorApprovalTime      NullString `json:"creditor_approval_time"`
	DebitorDevice             NullString `json:"debitor_device"`
	CreditorDevice            NullString `json:"creditor_device"`
	DebitApprover             NullString `json:"debit_approver"`
	CreditApprover            NullString `json:"credit_approver"`
	CreditorRejectionTime     NullString `json:"creditor_rejection_time"`
	DebitorRejectionTime      NullString `json:"debitor_rejection_time"`
	CreatedAt                 string     `json:"createdAt"`
}

// NullString is an alias for sql.NullString data type https://gist.github.com/rsudip90/022c4ef5d98130a224c9239e0a1ab397
type NullString struct {
	sql.NullString
}

// MarshalJSON for NullString
func (ns *NullString) MarshalJSON() ([]byte, error) {
	if !ns.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(ns.String)
}

func handleRequest(db *sql.DB, e lambdaEvent) (string, error) {
	// if account available in event, get transactions
	// where they're either creditor, debitor or author
	if len(e.TransactionID) == 0 {
		q := `
		SELECT * FROM transactions
		WHERE (creditor=$1 OR debitor=$1 OR author=$1)
		AND (creditor_approval_time IS NOT NULL AND debitor_approval_time IS NOT NULL)
		ORDER BY id DESC LIMIT $2;`
		return getLastNTransactions(db, q, e.Account, 20)
	}

	q := "SELECT * FROM transactions WHERE transaction_id=$1;"
	return getTransactionsByID(db, q, e.TransactionID)
}

func handleLambdaEvent(ctx context.Context, event lambdaEvent) (string, error) {
	db, err := sql.Open(
		"postgres",
		fmt.Sprintf(
			"host=%s port=%s user=%s password=%s dbname=%s",
			os.Getenv("PGHOST"),
			os.Getenv("PGPORT"),
			os.Getenv("PGUSER"),
			os.Getenv("PGPASSWORD"),
			os.Getenv("PGDATABASE")))

	if err != nil {
		log.Panic(err)
	}
	return handleRequest(db, event)
}

func main() {
	lambda.Start(handleLambdaEvent)

}
