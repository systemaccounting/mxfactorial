package request

import (
	"context"
	"fmt"
	"log"

	"github.com/shopspring/decimal"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestDebitorCapacity(
	db lpg.SQLDB,
	trItems []*types.TransactionItem,
) error {

	// map required debitor funds from transaction items
	requiredFunds := MapDebitorsToRequiredFunds(trItems)

	// list unique debitors
	debitors := tools.ListUniqueDebitorAccountsFromTrItems(trItems)

	// get debitor account balances from db
	accountBalances, err := GetAccountBalances(db, debitors)
	if err != nil {
		var errMsg string = "get account balances %v"
		log.Printf(errMsg, err)
		return fmt.Errorf(errMsg, err)
	}

	// loop through map of required debitor funds
	for acct, reqd := range requiredFunds {

		// loop through account balances returned from db
		for _, v := range accountBalances {

			// match account balance belonging to debitor
			if *v.AccountName == acct {

				// test debitor capacity
				err = TestDebitorBalanceGreaterThanRequiredFunds(&acct, reqd, v.CurrentBalance)
				if err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func MapDebitorsToRequiredFunds(trItems []*types.TransactionItem) map[string]decimal.Decimal {

	// map stores debitor funds required for transaction
	// e.g. JacobWebb needs 10.000, SarahBell needs 1.000
	reqd := make(map[string]decimal.Decimal)

	// loop through transaction items
	for _, v := range trItems {

		// test map for debitor
		if _, ok := reqd[*v.Debitor]; !ok {

			// init decimal value for account
			// when account not found in map
			reqd[*v.Debitor] = decimal.New(0, 1)
		}

		// test for pending approval timestamp
		if v.DebitorApprovalTime == nil {

			// increase required debitor funds by price * quantity
			reqd[*v.Debitor] = reqd[*v.Debitor].Add(v.Price.Mul(v.Quantity))
		}
	}

	return reqd
}

func GetAccountBalance(db lpg.SQLDB, accountName *string) (decimal.Decimal, error) {
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

func GetAccountBalances(db lpg.SQLDB, accountNames []string) ([]*types.AccountBalance, error) {

	// sqlbuilder wants interface slice
	accts := make([]interface{}, 0)
	for _, v := range accountNames {
		accts = append(accts, v)
	}

	// create select current account balance sql
	selCurrBalSQL, selCurrBalArgs := sqlb.SelectAccountBalancesSQL(accts)

	// query
	rows, err := db.Query(
		context.Background(),
		selCurrBalSQL,
		selCurrBalArgs...,
	)
	if err != nil {
		log.Printf("query account balances %v", err)
		return nil, err
	}

	// unmarshal current account balance
	balances, err := lpg.UnmarshalAccountBalances(rows)
	if err != nil {
		log.Printf("unmarshal account balance %v", err)
		return nil, err
	}

	return balances, nil
}

func TestDebitorBalanceGreaterThanRequiredFunds(
	accountName *string,
	required decimal.Decimal,
	currentDebitorBalance decimal.Decimal,
) error {
	lessThanRequired := currentDebitorBalance.LessThan(required)
	if lessThanRequired {
		return fmt.Errorf(
			"error: insufficient funds in debitor %v account", *accountName,
		)
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
