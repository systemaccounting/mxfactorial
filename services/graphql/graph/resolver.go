package graph

import (
	"encoding/json"
	"os"

	"github.com/systemaccounting/mxfactorial/pkg/httpclient"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/model"
)

//go:generate go run github.com/99designs/gqlgen generate

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	ruleUrl                  string = os.Getenv("RULE_URL")
	requestCreateUrl                = os.Getenv("REQUEST_CREATE_URL")
	requestApproveUrl               = os.Getenv("REQUEST_APPROVE_URL")
	requestByIDUrl                  = os.Getenv("REQUEST_BY_ID_URL")
	requestsByAccountUrl            = os.Getenv("REQUESTS_BY_ACCOUNT_URL")
	transactionByIDUrl              = os.Getenv("TRANSACTION_BY_ID_URL")
	transactionsByAccountUrl        = os.Getenv("TRANSACTIONS_BY_ACCOUNT_URL")
	balanceByAccountUrl             = os.Getenv("BALANCE_BY_ACCOUNT_URL")
)

type Resolver struct {
	// todo: httpclient here
}

type IntraEvent struct {
	AuthAccount *string            `json:"auth_account"`
	Transaction *model.Transaction `json:"transaction"`
}

type TransactionResponse struct {
	AuthAccount *string            `json:"auth_account"`
	Transaction *model.Transaction `json:"transaction"`
}

type MultipleTransactionResponse struct {
	AuthAccount  *string              `json:"auth_account"`
	Transactions []*model.Transaction `json:"transactions"`
}

func (e *IntraEvent) UnmarshalTransaction(payload []byte) (*model.Transaction, error) {
	if err := json.Unmarshal(payload, e); err != nil {
		return nil, err
	}
	return e.Transaction, nil
}

func (e *IntraEvent) UnmarshalIntraEvent(payload []byte) error {
	return json.Unmarshal(payload, e)
}

func (r *Resolver) InvokeRules(
	transactionItems []*model.TransactionItemInput,
) (*model.Transaction, error) {

	payload, err := json.Marshal(transactionItems)
	if err != nil {
		return nil, err
	}

	c := httpclient.NewHttpClient(ruleUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	var ruleEvent IntraEvent

	return ruleEvent.UnmarshalTransaction(response)
}

type TransactionItemsClientEvent struct {
	Author           *string                       `json:"author"`
	TransactionItems []*model.TransactionItemInput `json:"transaction_items"`
}

type TransactionClientEvent struct {
	AuthAccount *string                      `json:"auth_account"`
	Transaction *TransactionItemsClientEvent `json:"transaction"`
}

func CreateIntraTransactionClientEvent(authAcct *string, trItems []*model.TransactionItemInput) *TransactionClientEvent {
	return &TransactionClientEvent{
		AuthAccount: authAcct,
		Transaction: &TransactionItemsClientEvent{
			Author:           authAcct,
			TransactionItems: trItems,
		},
	}
}

type QueryByIDEvent struct {
	AuthAccount *string `json:"auth_account"`
	AccountName *string `json:"account_name"`
	ID          *string `json:"id"`
}

func CreateQueryByIDEvent(authAcct *string, accountName *string, ID *string) *QueryByIDEvent {
	return &QueryByIDEvent{
		AuthAccount: authAcct,
		AccountName: accountName,
		ID:          ID,
	}
}

type QueryByAccountEvent struct {
	AuthAccount *string `json:"auth_account"`
	AccountName *string `json:"account_name"`
}

func CreateQueryByAccountEvent(authAcct *string, accountName *string) *QueryByAccountEvent {
	return &QueryByAccountEvent{
		AuthAccount: authAcct,
		AccountName: accountName,
	}
}

type RequestApproveEvent struct {
	AuthAccount *string `json:"auth_account"`
	ID          *string `json:"id"`
	AccountName *string `json:"account_name"`
	AccountRole *string `json:"account_role"`
}

func CreateRequestApproveEvent(
	transactionID,
	accountName,
	accountRole,
	authAccount *string,
) *RequestApproveEvent {
	return &RequestApproveEvent{
		AuthAccount: authAccount,
		ID:          transactionID,
		AccountName: accountName,
		AccountRole: accountRole,
	}
}

func (r *Resolver) InvokeRequestCreate(
	transactionItems []*model.TransactionItemInput,
	authAccount string,
) (*model.Transaction, error) {

	requestEvent := CreateIntraTransactionClientEvent(
		&authAccount,
		transactionItems,
	)

	payload, err := json.Marshal(requestEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(requestCreateUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	// todo: test string(result.Payload) for {"errorMessage":"...","errorType":"errorString"}

	var resp TransactionResponse

	err = json.Unmarshal(response, &resp)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}
	return resp.Transaction, nil
}

func (r *Resolver) InvokeRequestApprove(
	transactionID,
	accountName,
	accountRole,
	authAccount string,
) (*model.Transaction, error) {

	approvalEvent := CreateRequestApproveEvent(
		&transactionID,
		&accountName,
		&accountRole,
		&authAccount,
	)

	payload, err := json.Marshal(approvalEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(requestApproveUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	var resp TransactionResponse

	err = json.Unmarshal(response, &resp)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return resp.Transaction, nil
}

func (r *Resolver) InvokeRequestByID(
	transactionID,
	accountName string,
	authAccount string,
) (*model.Transaction, error) {

	queryByIDEvent := CreateQueryByIDEvent(
		&authAccount,
		&accountName,
		&transactionID,
	)

	payload, err := json.Marshal(queryByIDEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(requestByIDUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	var resp TransactionResponse

	err = json.Unmarshal(response, &resp)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return resp.Transaction, nil
}

func (r *Resolver) InvokeRequestsByAccount(
	accountName,
	authAccount string,
) ([]*model.Transaction, error) {

	queryByAccountEvent := CreateQueryByAccountEvent(
		&authAccount,
		&accountName,
	)

	payload, err := json.Marshal(queryByAccountEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(requestsByAccountUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	var resp MultipleTransactionResponse

	err = json.Unmarshal(response, &resp)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return resp.Transactions, nil
}

func (r *Resolver) InvokeTransactionByID(
	transactionID,
	accountName string,
	authAccount string,
) (*model.Transaction, error) {

	queryByIDEvent := CreateQueryByIDEvent(
		&authAccount,
		&accountName,
		&transactionID,
	)

	payload, err := json.Marshal(queryByIDEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(transactionByIDUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}
	var resp TransactionResponse

	err = json.Unmarshal(response, &resp)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return resp.Transaction, nil
}

func (r *Resolver) InvokeTransactionsByAccount(
	accountName,
	authAccount string,
) ([]*model.Transaction, error) {

	queryByAccountEvent := CreateQueryByAccountEvent(
		&authAccount,
		&accountName,
	)

	payload, err := json.Marshal(queryByAccountEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(transactionsByAccountUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	var resp MultipleTransactionResponse

	err = json.Unmarshal(response, &resp)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	return resp.Transactions, nil
}

func (r *Resolver) InvokeBalanceByAccount(
	accountName,
	authAccount string,
) (*string, error) {

	queryByAccountEvent := CreateQueryByAccountEvent(
		&authAccount,
		&accountName,
	)

	payload, err := json.Marshal(queryByAccountEvent)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return nil, err
	}

	c := httpclient.NewHttpClient(balanceByAccountUrl)

	response, err := c.Post(payload)
	if err != nil {
		return nil, err
	}

	balance := string(response)

	return &balance, nil
}
