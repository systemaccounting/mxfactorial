package transact

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/shopspring/decimal"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func IsEquilibrium(t *types.Transaction) bool {
	if t.EquilibriumTime == nil {
		return false
	}
TransactionItems:
	for _, v := range t.TransactionItems {
		if v.CreditorApprovalTime != nil && v.DebitorApprovalTime != nil {
		Approvers:
			for _, w := range v.Approvers {
				if w.ApprovalTime != nil {
					continue Approvers
				} else {
					return false
				}
			}
			continue TransactionItems
		} else {
			return false
		}
	}
	return true
}

func TestDebitorCapacity(
	db lpg.SQLDB,
	accountName string,
	trItems []*types.TransactionItem,
) error {
	// measure debitor funds required by transaction items
	required := DebitorFundsRequired(accountName, trItems)

	// get debitor balance to test approval capacity
	approverBalance, err := GetAccountBalance(db, accountName)
	if err != nil {
		var errMsg string = "get approver balance %v"
		log.Printf(errMsg, err)
		return fmt.Errorf(errMsg, err)
	}

	// test debitor capacity
	err = TestDebitorBalanceGreaterThanRequiredFunds(required, approverBalance)
	if err != nil {
		log.Print(err)
		return err
	}
	return nil
}

func DebitorFundsRequired(accountName string, trItems []*types.TransactionItem) decimal.Decimal {
	var reqd decimal.Decimal = decimal.New(0, 1)
	for _, v := range trItems {
		if *v.Debitor == accountName && v.DebitorApprovalTime == nil {
			reqd.Add(v.Price.Mul(v.Quantity))
		}
	}
	return reqd
}

func GetAccountBalance(db lpg.SQLDB, accountName string) (decimal.Decimal, error) {
	// create select current account balance sql
	selCurrBalSQL, selCurrBalArgs := sqlb.SelectCurrentAccountBalanceByAccountNameSQL(
		accountName,
	)

	// query
	row := db.QueryRow(
		context.Background(),
		selCurrBalSQL,
		selCurrBalArgs...,
	)

	// unmarshal current account balance
	balance, err := lpg.UnmarshalAccountBalance(
		row,
	)

	if err != nil {
		log.Printf("unmarshal account balance %v", err)
		return decimal.Decimal{}, err
	}

	return balance, nil
}

func TestDebitorBalanceGreaterThanRequiredFunds(required, currentDebitorBalance decimal.Decimal) error {
	lessThanRequired := currentDebitorBalance.LessThan(required)
	zero := decimal.New(0, 1)
	lessThanOrEqualToZero := currentDebitorBalance.LessThanOrEqual(zero) // defensive, anything can happen in dev
	if lessThanOrEqualToZero {
		return errors.New("illegal negative balance")
	}
	if lessThanRequired {
		insufficient := required.Sub(currentDebitorBalance)
		return fmt.Errorf("account requires %s more before approving", insufficient.String())
	}
	return nil
}

func ChangeAccountBalances(db lpg.SQLDB, trItems []*types.TransactionItem) {
	for _, v := range trItems {
		// debitors
		updDbBalSQL, updDbBalArgs := sqlb.UpdateDebitorAccountBalanceSQL(v)
		_, err := db.Exec(
			context.Background(),
			updDbBalSQL,
			updDbBalArgs...,
		)
		if err != nil {
			log.Printf("failed to update balance of debitor %v, %v", *v.Debitor, err)
		}
		// creditors
		updCrBalSQL, updCrBalArgs := sqlb.UpdateCreditorAccountBalanceSQL(v)
		_, err = db.Exec(
			context.Background(),
			updCrBalSQL,
			updCrBalArgs...,
		)
		if err != nil {
			log.Printf("failed to update balance of creditor %v, %v", *v.Creditor, err)
		}
	}
}
