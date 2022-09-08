package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
)

type IAccountModel interface {
	InsertAccount(string) error
	DeleteOwnerAccount(string) error
	DeleteAccount(string) error
}

type AccountService struct {
	m IAccountModel
}

func (a AccountService) CreateAccount(accountName string) error {

	err := a.m.InsertAccount(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}
func (a AccountService) DeleteOwnerAccount(accountName string) error {

	err := a.m.DeleteOwnerAccount(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}
func (a AccountService) DeleteAccount(accountName string) error {

	err := a.m.DeleteAccount(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewAccountService(db SQLDB) *AccountService {
	return &AccountService{
		m: postgres.NewAccountModel(db),
	}
}
