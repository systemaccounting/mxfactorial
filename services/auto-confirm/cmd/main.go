package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/service"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var pgConn string = fmt.Sprintf(
	"host=%s port=%s user=%s password=%s dbname=%s",
	os.Getenv("PGHOST"),
	os.Getenv("PGPORT"),
	os.Getenv("PGUSER"),
	os.Getenv("PGPASSWORD"),
	os.Getenv("PGDATABASE"))

type minimalRuleInstance struct {
	RuleType         *string   `json:"rule_type"`
	RuleName         *string   `json:"rule_name"`
	RuleInstanceName *string   `json:"rule_instance_name"`
	AccountRole      *string   `json:"account_role"`
	AccountName      *string   `json:"account_name"`
	VariableValues   []*string `json:"variable_values"`
}

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
}

type ICreateAccountService interface {
	CreateAccountFromCognitoTrigger(accountProfile *types.AccountProfile, beginningBalance decimal.Decimal, currentTransactionItemID types.ID) error
}

func lambdaFn(
	ctx context.Context,
	e events.CognitoEventUserPoolsPreSignup,
	dbConnector func(context.Context, string) (SQLDB, error),
	createAccountServiceConstructor func(db SQLDB) (ICreateAccountService, error),
) (events.CognitoEventUserPoolsPreSignup, error) {

	if e.Request.ClientMetadata != nil {
		if _, ok := e.Request.ClientMetadata["skip"]; ok {
			e.Response.AutoConfirmUser = true
			return e, nil
		}
	}

	cognitoUser := e.CognitoEventUserPoolsHeader.UserName

	// temp solution to avoid profile form filling in ui
	// guess first and last name from account name
	firstName, lastName := testdata.GuessFirstAndLastNames(cognitoUser)

	// create a fake profile to minimize sign up labor
	fakeProfile := testdata.CreateFakeProfile(
		cognitoUser,
		firstName,
		lastName,
	)

	// create insert account balance sql
	beginningBalance, err := decimal.NewFromString(os.Getenv("INITIAL_ACCOUNT_BALANCE"))
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	// connect to db
	db, err := dbConnector(context.Background(), pgConn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	defer db.Close(context.Background())

	// delete existing account, todo: move sql to builder
	_, err = db.Exec(context.Background(),
		"delete from account_balance where account_name = $1;",
		cognitoUser)
	if err != nil {
		log.Printf("delete account_balance %v", err)
	}
	_, err = db.Exec(context.Background(),
		"delete from rule_instance where account_name = $1;",
		cognitoUser)
	if err != nil {
		log.Printf("delete rule_instance %v", err)
	}
	_, err = db.Exec(context.Background(),
		"delete from account_profile where account_name = $1;",
		cognitoUser)
	if err != nil {
		log.Printf("delete account_profile %v", err)
	}
	_, err = db.Exec(context.Background(),
		"delete from account_owner where owner_account = $1;",
		cognitoUser)
	if err != nil {
		log.Printf("delete account_owner %v", err)
	}
	_, err = db.Exec(context.Background(),
		"delete from subaccount where name = $1;",
		cognitoUser)
	if err != nil {
		log.Printf("delete subaccount %v", err)
	}
	_, err = db.Exec(context.Background(),
		"delete from account where name = $1;",
		cognitoUser)
	if err != nil {
		log.Printf("delete account %v", err)
	}

	// construct create account balance service
	cas, err := createAccountServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// create 1) account, 2) profile, 3) initial balance
	// and 4) approval all credit rule instance
	err = cas.CreateAccountFromCognitoTrigger(
		&fakeProfile,
		beginningBalance,
		types.ID("0"), // todo: create transaction before creating account balance, then
		// pass transaction_item.id as arg to account balance insert
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// auto confirm cognito user
	e.Response.AutoConfirmUser = true

	return e, nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e events.CognitoEventUserPoolsPreSignup) (events.CognitoEventUserPoolsPreSignup, error) {
	return lambdaFn(
		ctx,
		e,
		newIDB,
		newCreateAccountService,
	)
}

// enables lambdaFn unit testing
func newCreateAccountService(idb SQLDB) (ICreateAccountService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newCreateAccountService: failed to assert *postgres.DB")
	}
	return service.NewCreateAccountService(db), nil
}

// enables lambdaFn unit testing
func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

func main() {
	lambda.Start(handleEvent)
}
