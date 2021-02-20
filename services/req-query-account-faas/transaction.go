package faas

import (
	"encoding/json"
	"log"

	"gopkg.in/guregu/null.v4"
)

// Event defines a lambda event
type Event struct {
	TransactionID        string `json:"transaction_id"`
	Account              string `json:"account"`
	GraphQLRequestSender string `json:"graphqlRequestSender"`
}

// Transaction defines a transaction
type Transaction struct {
	TableID                   int32       `json:"id,string"`
	Name                      string      `json:"name"`
	Quantity                  string      `json:"quantity"`
	Price                     string      `json:"price"`
	UnitOfMeasurement         null.String `json:"unit_of_measurement"`
	UnitsMeasured             null.String `json:"units_measured"`
	RuleInstanceID            null.String `json:"rule_instance_id"`
	TransactionID             null.String `json:"transaction_id"`
	Author                    null.String `json:"author"`
	ExpirationTime            null.String `json:"expiration_time"`
	Debitor                   null.String `json:"debitor"`
	Creditor                  null.String `json:"creditor"`
	DebitorProfileLatLng      null.String `json:"debitor_profile_latlng"`
	CreditorProfileLatlng     null.String `json:"creditor_profile_latlng"`
	DebitorTransactionLatLng  null.String `json:"debitor_transaction_latlng"`
	CreditorTransactionLatLng null.String `json:"creditor_transaction_latlng"`
	DebitorApprovalTime       null.String `json:"debitor_approval_time"`
	CreditorApprovalTime      null.String `json:"creditor_approval_time"`
	DebitorDevice             null.String `json:"debitor_device"`
	CreditorDevice            null.String `json:"creditor_device"`
	DebitApprover             null.String `json:"debit_approver"`
	CreditApprover            null.String `json:"credit_approver"`
	CreditorRejectionTime     null.String `json:"creditor_rejection_time"`
	DebitorRejectionTime      null.String `json:"debitor_rejection_time"`
	CreatedAt                 null.String `json:"createdAt"`
}

// Transactions ...
type Transactions []*Transaction

// Marshal returns transactions as json
func (ts Transactions) Marshal() (string, error) {
	j, err := json.Marshal(ts)
	if err != nil {
		return "", err
	}

	js := string(j)

	// ### debugging only
	transInd, err := json.MarshalIndent(ts, "", "  ")
	if err != nil {
		log.Print(err)
		return "", err
	}
	indented := string(transInd)
	_ = indented
	// log.Print(indented)
	// ###

	return js, nil
}
