package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/testdata"
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
	accSQL, accArgs := sqlb.InsertAccountSQL(
		cognitoUser,
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
		log.Print(err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}
	defer db.Close(context.Background())

	// insert account
	_, err = db.Exec(context.Background(), accSQL, accArgs...)
	if err != nil {
		log.Print(err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// insert profile
	_, err = db.Exec(context.Background(), profileSQL, profileArgs...)
	if err != nil {
		log.Print(err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

	// test for approve any credit rule
	row := db.QueryRow(context.Background(), getRuleInstSQL, getRuleInstArgs...)
	if err != nil {
		log.Print(err)
		return events.CognitoEventUserPoolsPreSignup{}, err
	}

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
		log.Print(err)
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
			log.Print(execErr)
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
