package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IRuleInstanceService interface {
	InsertApproveAllCreditRuleInstance(string) error
	SelectApproveAllCreditRuleInstance(string) (types.RuleInstance, error)
	InsertApproveAllCreditRuleInstanceIfDoesNotExist(string) error
	AddRuleInstance(string, string, string, string, string, string) error
	GetRuleInstanceByCurrentlyUsedValues(string, string, string, string, string, string) error
}

type RuleInstanceService struct {
	*postgres.RuleInstanceModel
}

func (ri RuleInstanceService) InsertApproveAllCreditRuleInstance(
	accountName string,
) error {

	err := ri.RuleInstanceModel.InsertApproveAllCreditRuleInstance(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (ri RuleInstanceService) SelectApproveAllCreditRuleInstance(
	accountName string,
) (types.RuleInstance, error) {

	err := ri.RuleInstanceModel.SelectApproveAllCreditRuleInstance(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return types.RuleInstance{}, err
	}

	return ri.RuleInstance, nil
}

func (ri RuleInstanceService) InsertApproveAllCreditRuleInstanceIfDoesNotExist(
	accountName string,
) error {

	err := ri.RuleInstanceModel.InsertApproveAllCreditRuleInstanceIfDoesNotExist(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (ri RuleInstanceService) AddRuleInstance(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) error {

	err := ri.RuleInstanceModel.InsertRuleInstance(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValuesArray,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

// complicated name intended
func (ri RuleInstanceService) GetRuleInstanceByCurrentlyUsedValues(
	ruleType,
	ruleName,
	ruleInstanceName,
	accountRole,
	accountName,
	variableValuesArray string,
) error {

	err := ri.RuleInstanceModel.SelectRuleInstance(
		ruleType,
		ruleName,
		ruleInstanceName,
		accountRole,
		accountName,
		variableValuesArray,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func NewRuleInstanceService(db *postgres.DB) *RuleInstanceService {
	return &RuleInstanceService{
		RuleInstanceModel: postgres.NewRuleInstanceModel(db),
	}
}
