package service

import (
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type IAccountService interface {
	CreateAccount(accountName string) error
	DeleteOwnerAccount(accountName string) error
	DeleteAccount(accountName string) error
}

type IProfileService interface {
	GetProfileIDsByAccountNames(accountNames []string) (types.AccountProfileIDs, error)
	CreateAccountProfile(accountProfile *types.AccountProfile) error
}

type IBalanceService interface {
	GetAccountBalance(accountName string) (*types.AccountBalance, error)
	GetAccountBalances(accountNames []string) (types.AccountBalances, error)
	GetDebitorAccountBalances(trItems types.TransactionItems) (types.AccountBalances, error)
	CreateAccountBalance(accountName string, accountBalance decimal.Decimal, account types.ID) error
	ChangeAccountBalances(trItems types.TransactionItems) error
	TestDebitorCapacity(trItems types.TransactionItems) error
}

type IRuleInstanceService interface {
	InsertApproveAllCreditRuleInstance(accountName string) error
	SelectApproveAllCreditRuleInstance(accountName string) (*types.RuleInstance, error)
	InsertApproveAllCreditRuleInstanceIfDoesNotExist(accountName string) error
	AddRuleInstance(ruleType, ruleName, ruleInstanceName, accountRole, accountName, variableValuesArray string) error
	GetRuleInstanceByCurrentlyUsedValues(ruleType, ruleName, ruleInstanceName, accountRole, accountName, variableValuesArray string) error
}

type CreateAccountService struct {
	a  IAccountService
	p  IProfileService
	b  IBalanceService
	ri IRuleInstanceService
}

func (c CreateAccountService) CreateAccountFromCognitoTrigger(
	accountProfile *types.AccountProfile,
	beginningBalance decimal.Decimal,
	currentTransactionItemID types.ID,
) error {

	// create account
	err := c.a.CreateAccount(*accountProfile.AccountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// create profile
	err = c.p.CreateAccountProfile(accountProfile)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// create initial account balance
	err = c.b.CreateAccountBalance(
		*accountProfile.AccountName,
		beginningBalance,
		currentTransactionItemID,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	// insert approve all credit rule for account if does not exist
	err = c.ri.InsertApproveAllCreditRuleInstanceIfDoesNotExist(*accountProfile.AccountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewCreateAccountService(db SQLDB) *CreateAccountService {
	return &CreateAccountService{
		a:  NewAccountService(db),
		p:  NewProfileService(db),
		b:  NewAccountBalanceService(db),
		ri: NewRuleInstanceService(db),
	}
}
