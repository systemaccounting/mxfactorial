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

	debitors := tools.ListUniqueDebitorAccountsFromTrItems(trItems)

	for _, d := range debitors {
		// measure debitor funds required by transaction items
		required := DebitorFundsRequired(&d, trItems)

		// get debitor balance to test approval capacity
		approverBalance, err := GetAccountBalance(db, &d)
		if err != nil {
			var errMsg string = "get approver balance %v"
			log.Printf(errMsg, err)
			return fmt.Errorf(errMsg, err)
		}

		// test debitor capacity
		err = TestDebitorBalanceGreaterThanRequiredFunds(&d, required, approverBalance)
		if err != nil {
			return err
		}
	}

	return nil
}

func DebitorFundsRequired(accountName *string, trItems []*types.TransactionItem) decimal.Decimal {
	var reqd decimal.Decimal = decimal.New(0, 1)
	for _, v := range trItems {
		if *v.Debitor == *accountName && v.DebitorApprovalTime == nil {
			reqd = reqd.Add(v.Price.Mul(v.Quantity))
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
