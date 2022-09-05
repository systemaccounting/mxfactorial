package service

import (
	"github.com/systemaccounting/mxfactorial/services/gopkg/aws/lambda"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type RulesService struct {
	lambda.ILambdaService
}

type IRulesService interface {
	GetRuleAppliedIntraTransactionFromTrItems(types.TransactionItems) (*types.IntraTransaction, error)
}

func (r RulesService) GetRuleAppliedIntraTransactionFromTrItems(trItems types.TransactionItems) (*types.IntraTransaction, error) {

	response, err := r.ILambdaService.Invoke(trItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	var ruleTested types.IntraTransaction
	err = ruleTested.Unmarshal(response)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return &ruleTested, nil
}

func NewRulesService(lambdaFnName, awsRegion *string) *RulesService {
	return &RulesService{
		ILambdaService: lambda.NewLambdaService(lambdaFnName, nil),
	}
}
