package service

import (
	"encoding/json"

	"github.com/systemaccounting/mxfactorial/services/gopkg/httpclient"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

type IHttpClient interface {
	Post([]byte) ([]byte, error)
}

type RulesService struct {
	Client IHttpClient
}

func (r RulesService) GetRuleAppliedIntraTransactionFromTrItems(trItems types.TransactionItems) (*types.IntraTransaction, error) {

	b, err := json.Marshal(trItems)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	response, err := r.Client.Post(b)
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

func NewRulesService(url string) *RulesService {
	return &RulesService{
		Client: httpclient.NewHttpClient(url),
	}
}
