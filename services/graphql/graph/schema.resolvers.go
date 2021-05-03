package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"log"

	"github.com/pkg/errors"
	"github.com/systemaccounting/mxfactorial/services/graphql/auth"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/generated"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/model"
)

func (r *mutationResolver) CreateRequest(ctx context.Context, transactionItems []*model.TransactionItemInput, authAccount string) (*model.Transaction, error) {
	funcName := "create request resolver"

	authAccount, err := auth.GetAuthAccount(ctx, authAccount)
	if err != nil {
		var errFmtMsg string = fmt.Sprintf("cognito auth %v: %v", funcName, err.Error())
		log.Print(errFmtMsg)
		return nil, errors.New(errFmtMsg)
	}

	err = r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	tr, err := r.InvokeRequestCreate(transactionItems, authAccount)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return tr, nil
}

func (r *mutationResolver) ApproveRequest(ctx context.Context, transactionID string, accountName string, accountRole string, authAccount string) (*model.Transaction, error) {
	funcName := "approve request resolver"

	authAccount, err := auth.GetAuthAccount(ctx, authAccount)
	if err != nil {
		var errFmtMsg string = fmt.Sprintf("cognito auth %v: %v", funcName, err.Error())
		log.Print(errFmtMsg)
		return nil, errors.New(errFmtMsg)
	}

	err = r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	tr, err := r.InvokeRequestApprove(
		transactionID,
		accountName,
		accountRole,
		authAccount,
	)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) Rules(ctx context.Context, transactionItems []*model.TransactionItemInput) (*model.Transaction, error) {
	funcName := "rules resolver"
	err := r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	tr, err := r.InvokeRules(transactionItems)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) RequestByID(ctx context.Context, transactionID string, authAccount string) (*model.Transaction, error) {
	funcName := "request by id resolver"

	authAccount, err := auth.GetAuthAccount(ctx, authAccount)
	if err != nil {
		var errFmtMsg string = fmt.Sprintf("cognito auth %v: %v", funcName, err.Error())
		log.Print(errFmtMsg)
		return nil, errors.New(errFmtMsg)
	}

	err = r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	tr, err := r.InvokeRequestByID(transactionID, authAccount)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) RequestsByAccount(ctx context.Context, accountName string, authAccount string) ([]*model.Transaction, error) {
	funcName := "requests by account"

	authAccount, err := auth.GetAuthAccount(ctx, authAccount)
	if err != nil {
		var errFmtMsg string = fmt.Sprintf("cognito auth %v: %v", funcName, err.Error())
		log.Print(errFmtMsg)
		return nil, errors.New(errFmtMsg)
	}

	err = r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	trs, err := r.InvokeRequestsByAccount(accountName, authAccount)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return trs, nil
}

func (r *queryResolver) TransactionByID(ctx context.Context, transactionID string, authAccount string) (*model.Transaction, error) {
	funcName := "transaction by id"

	authAccount, err := auth.GetAuthAccount(ctx, authAccount)
	if err != nil {
		var errFmtMsg string = fmt.Sprintf("cognito auth %v: %v", funcName, err.Error())
		log.Print(errFmtMsg)
		return nil, errors.New(errFmtMsg)
	}

	err = r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	tr, err := r.InvokeTransactionByID(transactionID, authAccount)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) TransactionsByAccount(ctx context.Context, accountName string, authAccount string) ([]*model.Transaction, error) {
	funcName := "transactions by account"

	authAccount, err := auth.GetAuthAccount(ctx, authAccount)
	if err != nil {
		var errFmtMsg string = fmt.Sprintf("cognito auth %v: %v", funcName, err.Error())
		log.Print(errFmtMsg)
		return nil, errors.New(errFmtMsg)
	}

	err = r.CreateLambdaSession()
	if err != nil {
		log.Printf("create lambda session %v: %v", funcName, err.Error())
		return nil, err
	}
	trs, err := r.InvokeTransactionsByAccount(accountName, authAccount)
	if err != nil {
		log.Printf("invoke %v: %v", funcName, err.Error())
		return nil, err
	}
	return trs, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
