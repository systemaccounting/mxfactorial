package graph

import (
	"encoding/json"
	"log"
	"os"
	"strconv"

	"github.com/pkg/errors"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/model"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var awsRegion string = os.Getenv("AWS_REGION")
var ruleLambdaArn string = os.Getenv("RULE_LAMBDA_ARN")
var reqCreateLambdaArn string = os.Getenv("REQUEST_CREATE_LAMBDA_ARN")
var reqApproveLambdaArn string = os.Getenv("REQUEST_APPROVE_LAMBDA_ARN")
var reqByIDLambdaArn string = os.Getenv("REQUEST_BY_ID_LAMBDA_ARN")
var reqsByAccountLambdaArn string = os.Getenv("REQUESTS_BY_ACCOUNT_LAMBDA_ARN")
var transByIDLambdaArn string = os.Getenv("TRANSACTION_BY_ID_LAMBDA_ARN")
var transByAccountLambdaArn string = os.Getenv("TRANSACTIONS_BY_ACCOUNT_LAMBDA_ARN")

type Resolver struct {
	Lambda struct {
		Sess *lambda.Lambda
	}
}

// IntraEvent is modified from
// services/gopkg/types/transactionItem.go
// for grqphql services/graphql/graph/model
type IntraEvent struct {
	AuthAccount *string            `json:"auth_account"`
	Transaction *model.Transaction `json:"transaction`
}

type TransactionResponse struct {
	AuthAccount *string            `json:"auth_account"`
	Transaction *model.Transaction `json:"transaction"`
}

type MultipleTransactionResponse struct {
	AuthAccount  *string              `json:"auth_account"`
	Transactions []*model.Transaction `json:"transactions"`
}

func UnquoteBytes(b []byte) ([]byte, error) {
	str, err := strconv.Unquote(string(b))
	if err != nil {
		return nil, err
	}
	return []byte(str), nil
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

func (r *Resolver) CreateLambdaSession() error {
	// from https://docs.aws.amazon.com/sdk-for-go/api/aws/session/#pkg-overview
	// Sessions should be cached when possible, because creating a new Session will load all configuration values from the environment, and config files each time the Session is created.
	if r.Lambda.Sess == nil {
		log.Print("creating lambda session")
		if len(awsRegion) == 0 {
			return errors.New("AWS_REGION not set")
		}

		sess, err := session.NewSession(
			&aws.Config{
				Region: aws.String(awsRegion),
			},
		)

		if err != nil {
			return nil
		}

		r.Lambda.Sess = lambda.New(sess)
	}

	return nil
}

func (r *Resolver) InvokeLambda(
	arn string,
	payload []byte,
) (*lambda.InvokeOutput, error) {

	if len(arn) == 0 {
		return nil, errors.New("lambda arn required")
	}

	input := &lambda.InvokeInput{
		FunctionName: aws.String(arn),
		Payload:      payload,
	}

	return r.Lambda.Sess.Invoke(input)
}

func (r *Resolver) InvokeRules(
	transactionItems []*model.TransactionItemInput,
) (*model.Transaction, error) {

	payload, err := json.Marshal(transactionItems)
	if err != nil {
		return nil, err
	}

	result, err := r.InvokeLambda(ruleLambdaArn, payload)
	if err != nil {
		log.Print(err.Error())
		return nil, err
	}

	var rulesEvent IntraEvent

	return rulesEvent.UnmarshalTransaction(result.Payload)
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
	ID          *string `json:"id"`
}

func CreateQueryByIDEvent(authAcct *string, ID *string) *QueryByIDEvent {
	return &QueryByIDEvent{
		AuthAccount: authAcct,
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

	funcName := "request create"

	requestEvent := CreateIntraTransactionClientEvent(
		&authAccount,
		transactionItems,
	)

	payload, err := json.Marshal(requestEvent)
	if err != nil {
		log.Printf("invoke %v marshal: %v", funcName, err.Error())
		return nil, err
	}

	result, err := r.InvokeLambda(reqCreateLambdaArn, payload)
	if err != nil {
		log.Printf("invoke %v lambda: %v", funcName, err.Error())
		return nil, err
	}

	log.Print(string(result.Payload))

	// todo: test string(result.Payload) for {"errorMessage":"...","errorType":"errorString"}

	unquoted, err := UnquoteBytes(result.Payload)
	if err != nil {
		log.Printf("invoke %v unquote: %v", funcName, err.Error())
		return nil, err
	}

	var resp TransactionResponse

	err = json.Unmarshal(unquoted, &resp)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
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

	funcName := "request approve"

	approvalEvent := CreateRequestApproveEvent(
		&transactionID,
		&accountName,
		&accountRole,
		&authAccount,
	)

	payload, err := json.Marshal(approvalEvent)
	if err != nil {
		log.Printf("invoke %v marshal: %v", funcName, err.Error())
		return nil, err
	}

	result, err := r.InvokeLambda(reqApproveLambdaArn, payload)
	if err != nil {
		log.Printf("invoke %v lambda: %v", funcName, err.Error())
		return nil, err
	}

	unquoted, err := UnquoteBytes(result.Payload)
	if err != nil {
		log.Printf("invoke %v unquote bytes: %v", funcName, err.Error())
		return nil, err
	}

	var resp TransactionResponse

	err = json.Unmarshal(unquoted, &resp)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
		return nil, err
	}

	return resp.Transaction, nil
}

func (r *Resolver) InvokeRequestByID(
	transactionID,
	authAccount string,
) (*model.Transaction, error) {

	funcName := "request by id"

	queryByIDEvent := CreateQueryByIDEvent(
		&authAccount,
		&transactionID,
	)

	payload, err := json.Marshal(queryByIDEvent)
	if err != nil {
		log.Printf("invoke %v marshal: %v", funcName, err.Error())
		return nil, err
	}

	result, err := r.InvokeLambda(reqByIDLambdaArn, payload)
	if err != nil {
		log.Printf("invoke %v lambda: %v", funcName, err.Error())
		return nil, err
	}

	unquoted, err := UnquoteBytes(result.Payload)
	if err != nil {
		log.Printf("invoke %v unquote bytes: %v", funcName, err.Error())
		return nil, err
	}

	var resp TransactionResponse

	err = json.Unmarshal(unquoted, &resp)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
		return nil, err
	}

	return resp.Transaction, nil
}

func (r *Resolver) InvokeRequestsByAccount(
	accountName,
	authAccount string,
) ([]*model.Transaction, error) {

	funcName := "requests by acount"

	queryByAccountEvent := CreateQueryByAccountEvent(
		&authAccount,
		&authAccount,
	)

	payload, err := json.Marshal(queryByAccountEvent)
	if err != nil {
		log.Printf("invoke %v marshal: %v", funcName, err.Error())
		log.Print(err.Error())
		return nil, err
	}

	result, err := r.InvokeLambda(reqsByAccountLambdaArn, payload)
	if err != nil {
		log.Printf("invoke %v lambda: %v", funcName, err.Error())
		return nil, err
	}

	unquoted, err := UnquoteBytes(result.Payload)
	if err != nil {
		log.Printf("invoke %v unquote bytes: %v", funcName, err.Error())
		return nil, err
	}

	var resp MultipleTransactionResponse

	err = json.Unmarshal(unquoted, &resp)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
		log.Print(err.Error())
		return nil, err
	}

	return resp.Transactions, nil
}

func (r *Resolver) InvokeTransactionByID(
	transactionID,
	authAccount string,
) (*model.Transaction, error) {

	funcName := "transaction by id"

	queryByIDEvent := CreateQueryByIDEvent(
		&authAccount,
		&transactionID,
	)

	payload, err := json.Marshal(queryByIDEvent)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
		return nil, err
	}

	result, err := r.InvokeLambda(transByIDLambdaArn, payload)
	if err != nil {
		log.Printf("invoke %v lambda: %v", funcName, err.Error())
		return nil, err
	}

	unquoted, err := UnquoteBytes(result.Payload)
	if err != nil {
		log.Printf("invoke %v unquote bytes: %v", funcName, err.Error())
		return nil, err
	}

	var resp TransactionResponse

	err = json.Unmarshal(unquoted, &resp)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
		return nil, err
	}

	return resp.Transaction, nil
}

func (r *Resolver) InvokeTransactionsByAccount(
	accountName,
	authAccount string,
) ([]*model.Transaction, error) {

	funcName := "transactions by account"

	queryByAccountEvent := CreateQueryByAccountEvent(
		&authAccount,
		&authAccount,
	)

	payload, err := json.Marshal(queryByAccountEvent)
	if err != nil {
		log.Printf("invoke %v marshal: %v", funcName, err.Error())
		return nil, err
	}

	result, err := r.InvokeLambda(transByAccountLambdaArn, payload)
	if err != nil {
		log.Printf("invoke %v lambda: %v", funcName, err.Error())
		return nil, err
	}

	unquoted, err := UnquoteBytes(result.Payload)
	if err != nil {
		log.Printf("invoke %v unquote bytes: %v", funcName, err.Error())
		return nil, err
	}

	var resp MultipleTransactionResponse

	err = json.Unmarshal(unquoted, &resp)
	if err != nil {
		log.Printf("invoke %v unmarshal: %v", funcName, err.Error())
		return nil, err
	}

	return resp.Transactions, nil
}
