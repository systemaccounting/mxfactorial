package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
)

type IAccountService interface {
	CreateAccount(accountName string) error
	DeleteOwnerAccount(string) error
	DeleteAccount(string) error
}

type AccountService struct {
	*postgres.AccountModel
}

func (a AccountService) CreateAccount(accountName string) error {

	err := a.AccountModel.InsertAccount(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}
func (a AccountService) DeleteOwnerAccount(accountName string) error {

	err := a.AccountModel.DeleteOwnerAccount(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}
func (a AccountService) DeleteAccount(accountName string) error {

	err := a.AccountModel.DeleteAccount(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewAccountService(db *postgres.DB) *AccountService {
	return &AccountService{
		AccountModel: postgres.NewAccountModel(db),
	}
}
