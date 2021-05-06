package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	"github.com/shopspring/decimal"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
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

func lambdaFn(
	ctx context.Context,
	e events.CognitoEventUserPoolsPreSignup,
	c lpg.Connector,
) (events.CognitoEventUserPoolsPreSignup, error) {

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

	// create insert account sql
	insAccSQL, insAccArgs := sqlb.InsertAccountSQL(
		cognitoUser,
	)

	// create insert account balance sql
	beginningBalance, _ := decimal.NewFromString(os.Getenv("INITIAL_ACCOUNT_BALANCE"))
	insAccBalSQL, insAccBalArgs := sqlb.InsertAccountBalanceSQL(
		cognitoUser,
		beginningBalance,
		types.ID("0"), // todo: create transaction before creating account balance, then
		// pass transaction_item.id as arg to account balance insert
	)

	// create insert account profile sql
	profileSQL, profileArgs := sqlb.InsertAccountProfileSQL(
		&fakeProfile,
	)

	// create select rule instance sql
	getRuleInstSQL, getRuleInstArgs := sqlb.SelectRuleInstanceSQL(
		"approver",
		"approveAnyCreditItem",
		"ApprovalAllCreditRequests",
		"creditor",
		cognitoUser,
		fmt.Sprintf(
			"{\"%s\", \"creditor\", \"%s\"}",
			cognitoUser,
			cognitoUser,
		),
	)

	// create insert rule instance sql
	insRuleInstSQL, insRuleInstArgs := sqlb.InsertRuleInstanceSQL(
		"approver",
		"approveAnyCreditItem",
		"ApprovalAllCreditRequests",
		"creditor",
		cognitoUser,
		fmt.Sprintf(
			"{\"%s\", \"creditor\", \"%s\"}",
			cognitoUser,
			cognitoUser,
		),
	)

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("db connect %v", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	defer db.Close(context.Background())

	// insert account
	_, err = db.Exec(context.Background(), insAccSQL, insAccArgs...)
	if err != nil {
		log.Printf("insert account %v", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// insert initial account balance
	_, err = db.Exec(context.Background(), insAccBalSQL, insAccBalArgs...)
	if err != nil {
		log.Printf("insert account balance %v", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// insert profile
	_, err = db.Exec(context.Background(), profileSQL, profileArgs...)
	if err != nil {
		log.Printf("insert profile %v", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// test for approve any credit rule
	row := db.QueryRow(context.Background(), getRuleInstSQL, getRuleInstArgs...)

	var r minimalRuleInstance
	err = row.Scan(
		&r.RuleType,
		&r.RuleName,
		&r.RuleInstanceName,
		&r.AccountRole,
		&r.AccountName,
		&r.VariableValues,
	)
	if err != nil && err != pgx.ErrNoRows {
		log.Printf("select rule instance %v", err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// insert approve all credit rule instance
	// if not in table
	if err == pgx.ErrNoRows {
		_, execErr := db.Exec(
			context.Background(),
			insRuleInstSQL,
			insRuleInstArgs...,
		)
		if execErr != nil {
			log.Printf("insert rule instance %v", execErr)
			return events.CognitoEventUserPoolsPreSignup{}, execErr
		}
	}

	// auto confirm cognito user
	e.Response.AutoConfirmUser = true

	return e, nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(ctx context.Context, e events.CognitoEventUserPoolsPreSignup) (events.CognitoEventUserPoolsPreSignup, error) {
	d := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, d)
}

func main() {
	lambda.Start(handleEvent)
}
