package service

import (
	"fmt"

	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IBalanceService interface {
	GetAccountBalance(string) (types.AccountBalance, error)
	GetAccountBalances([]string) error
	GetDebitorAccountBalances(types.TransactionItems) error
	CreateAccountBalance(string, decimal.Decimal, types.ID) error
	ChangeAccountBalances(types.TransactionItems) error
	TestDebitorCapacity(types.TransactionItems) error
}

type BalanceService struct {
	*postgres.AccountBalanceModel
	*postgres.AccountBalancesModel
}

func (b BalanceService) GetAccountBalance(accountName string) (types.AccountBalance, error) {

	err := b.AccountBalanceModel.GetAccountBalance(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.AccountBalance{}, err
	}

	return b.AccountBalanceModel.AccountBalance, nil
}

func (b BalanceService) GetAccountBalances(accountNames []string) error {

	err := b.AccountBalancesModel.GetAccountBalances(accountNames)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (b BalanceService) GetDebitorAccountBalances(trItems types.TransactionItems) error {

	err := b.AccountBalancesModel.ChangeAccountBalances(trItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (b BalanceService) CreateAccountBalance(
	accountName string,
	accountBalance decimal.Decimal,
	account types.ID,
) error {

	err := b.AccountBalancesModel.InsertAccountBalance(accountName, accountBalance, account)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (b BalanceService) ChangeAccountBalances(trItems types.TransactionItems) error {

	err := b.AccountBalancesModel.ChangeAccountBalances(trItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (b BalanceService) TestDebitorCapacity(trItems types.TransactionItems) error {

	b.GetDebitorAccountBalances(trItems)

	// map required debitor funds from transaction items
	requiredFunds := trItems.MapDebitorsToRequiredFunds()

	// loop through map of required debitor funds
	for acct, reqd := range requiredFunds {

		// loop through account balances returned from db
		for _, v := range b.AccountBalances {

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

func NewAccountBalanceService(db *postgres.DB) *BalanceService {
	return &BalanceService{
		AccountBalanceModel:  postgres.NewAccountBalanceModel(db),
		AccountBalancesModel: postgres.NewAccountBalancesModel(db),
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
