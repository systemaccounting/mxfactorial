package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/lib/pq"
)

type lambdaEvent struct {
	ID   string `json:"id"`
	User string `json:"user"`
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

	if event.User != "" {
		initQuery := `
		SELECT * FROM transactions
		WHERE creditor='%s' OR debitor='%s' OR author='%s'
		AND (creditor_approval_time IS NULL OR debitor_approval_time IS NULL)
		ORDER BY id DESC LIMIT $1;`
		queryString := fmt.Sprintf(initQuery, event.User, event.User, event.User)
		return getLastNTransactions(db, queryString, 20)
	}

	// if request empty, or if id property empty
	if (lambdaEvent{} == event) || len(event.ID) == 0 {
		queryString := "SELECT * FROM transactions ORDER BY id DESC LIMIT $1;"
		return getLastNTransactions(db, queryString, 2)
	}

	// cast event.ID to int
	integerID, err := strconv.Atoi(event.ID)
	if err != nil {
		fmt.Println(err)
	}
	queryString := "SELECT * FROM transactions WHERE id=$1;"
	return getTransactionsByID(db, queryString, integerID)
}

func main() {
	lambda.Start(handleLambdaEvent)
	
}
