package service

import (
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/postgres"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

type IAccountProfileModel interface {
	GetProfileIDsByAccountNames([]string) (types.AccountProfileIDs, error)
	InsertAccountProfile(*types.AccountProfile) error
}

type ProfileService struct {
	m IAccountProfileModel
}

func (p ProfileService) GetProfileIDsByAccountNames(accountNames []string) (types.AccountProfileIDs, error) {
	return p.m.GetProfileIDsByAccountNames(accountNames)
}

func (p ProfileService) CreateAccountProfile(accountProfile *types.AccountProfile) error {

	err := p.m.InsertAccountProfile(accountProfile)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewProfileService(db SQLDB) *ProfileService {
	return &ProfileService{
		m: postgres.NewAccountProfileModel(db),
	}
}
