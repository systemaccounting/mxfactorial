package service

import (
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type ICreateAccountService interface {
	IAccountService
	IProfileService
	IBalanceService
	IRuleInstanceService
	CreateAccountFromCognitoTrigger(*types.AccountProfile, decimal.Decimal, types.ID) error
}

type CreateAccountService struct {
	AccountService
	ProfileService
	BalanceService
	RuleInstanceService
}

func (c CreateAccountService) CreateAccountFromCognitoTrigger(
	accountProfile *types.AccountProfile,
	beginningBalance decimal.Decimal,
	currentTransactionItemID types.ID,
) error {

	// create account
	err := c.AccountService.AccountModel.InsertAccount(*accountProfile.AccountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// create initial account balance
	err = c.BalanceService.CreateAccountBalance(
		*accountProfile.AccountName,
		beginningBalance,
		currentTransactionItemID,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// create profile
	err = c.ProfileService.CreateAccountProfile(accountProfile)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// insert approve all credit rule for account if does not exist
	err = c.RuleInstanceService.InsertApproveAllCreditRuleInstanceIfDoesNotExist(*accountProfile.AccountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewCreateAccountService(db *postgres.DB) *CreateAccountService {
	return &CreateAccountService{
		AccountService:      *NewAccountService(db),
		ProfileService:      *NewProfileService(db),
		BalanceService:      *NewAccountBalanceService(db),
		RuleInstanceService: *NewRuleInstanceService(db),
	}
}
