package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IProfileService interface {
	GetProfileIDsByAccountNames([]string) (types.AccountProfileIDs, error)
	CreateAccountProfile(*types.AccountProfile) error
}

type ProfileService struct {
	*postgres.AccountProfileModel
}

func (p ProfileService) GetProfileIDsByAccountNames(accountNames []string) (types.AccountProfileIDs, error) {
	return p.AccountProfileModel.GetProfileIDsByAccountNames(accountNames)
}

func (p ProfileService) CreateAccountProfile(accountProfile *types.AccountProfile) error {

	err := p.AccountProfileModel.InsertAccountProfile(accountProfile)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewProfileService(db *postgres.DB) *ProfileService {
	return &ProfileService{
		AccountProfileModel: postgres.NewAccountProfileModel(db),
	}
}
