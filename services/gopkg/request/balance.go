package request

import (
	"context"
	"fmt"
	"log"

	"github.com/shopspring/decimal"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

func TestDebitorCapacity(
	db lpg.SQLDB,
	sbc func() sqls.SelectSQLBuilder,
	trItems types.TrItemListHelper,
) error {

	// map required debitor funds from transaction items
	requiredFunds := trItems.MapDebitorsToRequiredFunds()

	// list unique debitors
	debitors := trItems.ListUniqueDebitorAccountsFromTrItems()

	// get debitor account balances from db
	accountBalances, err := GetAccountBalances(db, sbc, debitors)
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

func GetAccountBalance(
	db lpg.SQLDB,
	sbc func() sqls.SelectSQLBuilder,
	accountName *string) (decimal.Decimal, error) {

	// create select builder from constructor
	sb := sbc()

	// create select current account balance sql
	selCurrBalSQL, selCurrBalArgs := sb.SelectCurrentAccountBalanceByAccountNameSQL(
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

func GetAccountBalances(
	db lpg.SQLDB,
	sbc func() sqls.SelectSQLBuilder,
	accountNames []string) ([]*types.AccountBalance, error) {

	// sqlbuilder wants interface slice
	accts := make([]interface{}, 0)
	for _, v := range accountNames {
		accts = append(accts, v)
	}

	// init select builder from constructor
	sb := sbc()

	// create select current account balance sql
	selCurrBalSQL, selCurrBalArgs := sb.SelectAccountBalancesSQL(accts)

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

	// unmarshal current account balances
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

func ChangeAccountBalances(
	db lpg.SQLDB,
	ubc func() sqls.UpdateSQLBuilder,
	trItems []*types.TransactionItem) {

	// todo: change to single sql

	for _, v := range trItems {

		// debitors
		dub := ubc() // create sql builder from constructor
		updDbBalSQL, updDbBalArgs := dub.UpdateDebitorAccountBalanceSQL(v)
		_, err := db.Exec(
			context.Background(),
			updDbBalSQL,
			updDbBalArgs...,
		)
		if err != nil {
			log.Printf("failed to update balance of debitor %v, %v", *v.Debitor, err)
		}

		// creditors
		cub := ubc() // create update sql builder from constructor
		updCrBalSQL, updCrBalArgs := cub.UpdateCreditorAccountBalanceSQL(v)
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
