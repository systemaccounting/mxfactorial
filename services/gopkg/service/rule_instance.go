package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IRuleInstanceModel interface {
	SelectRuleInstance(string, string, string, string, string, string) error
	InsertRuleInstance(string, string, string, string, string, string) error
	SelectApproveAllCreditRuleInstance(string) (*types.RuleInstance, error)
	InsertApproveAllCreditRuleInstance(string) error
	InsertApproveAllCreditRuleInstanceIfDoesNotExist(string) error
}

type RuleInstanceService struct {
	m IRuleInstanceModel
}

func (ri RuleInstanceService) InsertApproveAllCreditRuleInstance(
	accountName string,
) error {

	err := ri.m.InsertApproveAllCreditRuleInstance(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return err
	}

	return nil
}

func (ri RuleInstanceService) SelectApproveAllCreditRuleInstance(
	accountName string,
) (*types.RuleInstance, error) {

	ruleIn, err := ri.m.SelectApproveAllCreditRuleInstance(accountName)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return ruleIn, nil
}

func (ri RuleInstanceService) InsertApproveAllCreditRuleInstanceIfDoesNotExist(
	accountName string,
) error {

	err := ri.m.InsertApproveAllCreditRuleInstanceIfDoesNotExist(accountName)
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

	err := ri.m.InsertRuleInstance(
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

	err := ri.m.SelectRuleInstance(
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

func NewRuleInstanceService(db SQLDB) *RuleInstanceService {
	return &RuleInstanceService{
		m: postgres.NewRuleInstanceModel(db),
	}
}
