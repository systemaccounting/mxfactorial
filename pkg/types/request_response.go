package types

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
)

// IntraEvent is embedded for
// post-auth internal service requests
type IntraEvent struct {
	AuthAccount string `json:"auth_account"`
}

type IntraTransaction struct {
	IntraEvent
	Transaction *Transaction `json:"transaction"`
}

func (it *IntraTransaction) Unmarshal(data []byte) error {
	err := json.Unmarshal(data, &it)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

// Marshal returns a IntraTransaction as json string
func (it *IntraTransaction) MarshalIntraTransaction() (string, error) {
	j, err := json.Marshal(it)
	if err != nil {
		return "", err
	}

	js := string(j)

	// ## debugging only
	transInd, err := json.MarshalIndent(it, "", "  ")
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

func EmptyMarshaledIntraTransaction(authAccount string) (string, error) {
	emptyTr := &Transaction{}
	emptyIntraTr := emptyTr.CreateIntraTransaction(authAccount)
	return emptyIntraTr.MarshalIntraTransaction()
}

type IntraTransactions struct {
	IntraEvent
	Transaction Transactions `json:"transactions"`
}

// Marshal returns a IntraTransaction as json string
func (its *IntraTransactions) MarshalIntraTransactions() (string, error) {
	j, err := json.Marshal(its)
	if err != nil {
		return "", err
	}

	js := string(j)

	// ## debugging only
	transInd, err := json.MarshalIndent(its, "", "  ")
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

type RequestApprove struct {
	IntraEvent
	ID          *ID     `json:"id"`
	AccountName *string `json:"account_name"`
	AccountRole *Role   `json:"account_role"`
}

type AccountProfileID struct {
	ID          *ID     `json:"id"`
	AccountName *string `json:"account_name"`
}

type AccountProfileIDs []*AccountProfileID

func (IDs *AccountProfileIDs) ScanRows(rows pgx.Rows) error {
	defer rows.Close()
	for rows.Next() {

		ap := new(AccountProfileID)

		err := rows.Scan(
			&ap.ID,
			&ap.AccountName,
		)

		if err != nil {
			return fmt.Errorf("AccountProfileIDs scan %v", err)
		}

		*IDs = append(*IDs, ap)
	}

	err := rows.Err()
	if err != nil {
		return fmt.Errorf("AccountProfileIDs rows %v", err)
	}

	return nil
}

func (IDs AccountProfileIDs) MapProfileIDsToAccounts() map[string]ID {
	profileIDs := make(map[string]ID)
	for _, v := range IDs {
		profileIDs[*v.AccountName] = *v.ID
	}
	return profileIDs
}

type QueryByAccount struct {
	IntraEvent
	AccountName *string `json:"account_name"`
}

type QueryByID struct {
	IntraEvent
	ID *ID `json:"id"`
}
