package service

import (
	"fmt"

	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/postgres"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type IAccountBalanceModel interface {
	GetAccountBalance(string) (*types.AccountBalance, error)
}

type IAccountBalancesModel interface {
	GetAccountBalances([]string) (types.AccountBalances, error)
	ChangeAccountBalances(types.TransactionItems) error
	// todo: move to AccountBalanceModel
	InsertAccountBalance(string, decimal.Decimal, types.ID) error
}

type BalanceService struct {
	m  IAccountBalanceModel
	ms IAccountBalancesModel
}

func (b BalanceService) GetAccountBalance(accountName string) (*types.AccountBalance, error) {

	ab, err := b.m.GetAccountBalance(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return ab, nil
}

func (b BalanceService) GetAccountBalances(accountNames []string) (types.AccountBalances, error) {

	abs, err := b.ms.GetAccountBalances(accountNames)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return abs, nil
}

func (b BalanceService) GetDebitorAccountBalances(trItems types.TransactionItems) (types.AccountBalances, error) {

	debitors := trItems.ListUniqueDebitorAccountsFromTrItems()

	debitorBalances, err := b.ms.GetAccountBalances(debitors)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return debitorBalances, nil
}

func (b BalanceService) CreateAccountBalance(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) error {

	err := b.ms.InsertAccountBalance(accountName, accountBalance, account)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (b BalanceService) ChangeAccountBalances(trItems types.TransactionItems) error {

	err := b.ms.ChangeAccountBalances(trItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (b BalanceService) TestDebitorCapacity(trItems types.TransactionItems) error {

	debitorBalances, err := b.GetDebitorAccountBalances(trItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// map required debitor funds from transaction items
	requiredFunds := trItems.MapDebitorsToRequiredFunds()

	// loop through map of required debitor funds
	for acct, reqd := range requiredFunds {

		// loop through account balances returned from db
		for _, v := range debitorBalances {

			// match account balance belonging to debitor
			if *v.AccountName == acct {

				// test debitor capacity
				err := TestDebitorBalanceGreaterThanRequiredFunds(acct, reqd, v.CurrentBalance)
				if err != nil {
					return fmt.Errorf("BalanceSerice TestDebitorCapacity: %v", err)
				}
			}
		}
	}

	return nil
}

func NewAccountBalanceService(db SQLDB) *BalanceService {
	return &BalanceService{
		m:  postgres.NewAccountBalanceModel(db),
		ms: postgres.NewAccountBalancesModel(db),
	}
}

func TestDebitorBalanceGreaterThanRequiredFunds(
	accountName string,
	required decimal.Decimal,
	currentDebitorBalance decimal.Decimal,
) error {
	lessThanRequired := currentDebitorBalance.LessThan(required)
	if lessThanRequired {
		return fmt.Errorf(
			"error: insufficient funds in debitor %v account", accountName,
		)
	}
	return nil
}
