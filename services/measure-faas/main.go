package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/lambda"
	_ "github.com/go-sql-driver/mysql"
)

type lambdaEvent struct {
	ID string `json:"id"`
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

func handleLambdaEvent(event lambdaEvent) (string, error) {
	db, err := sql.Open(
		"mysql",
		fmt.Sprintf(
			"%s:%s@tcp(%s:3306)/mxfactorial",
			os.Getenv("USER"),
			os.Getenv("PASSWORD"),
			os.Getenv("HOST"))) // "user:password@tcp(host:port)/database"

	if err != nil {
		log.Panic(err)
	}

	// if request empty, or if id property empty
	if (lambdaEvent{} == event) || len(event.ID) == 0 {
		queryString := "(SELECT * FROM transactions ORDER BY id DESC LIMIT ?) ORDER BY id;"
		return getLast2Transactions(db, queryString, 20)
	}

	// cast event.ID to int
	integerID, err := strconv.Atoi(event.ID)
	if err != nil {
		fmt.Println(err)
	}
	queryString := "SELECT * FROM transactions WHERE id=?"
	return getTransactionsByID(db, queryString, integerID)
}

func main() {
	lambda.Start(handleLambdaEvent)
}
