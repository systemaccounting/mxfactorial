package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/systemaccounting/mxfactorial/services/graphql/graph/generated"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/model"
)

func (r *mutationResolver) CreateRequest(ctx context.Context, transactionItems []*model.TransactionItemInput, authAccount string) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeRequestCreate(transactionItems, authAccount)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

func (r *mutationResolver) ApproveRequest(ctx context.Context, transactionID int, accountName string, accountRole string, authAccount string) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeRequestApprove(
		transactionID,
		accountName,
		accountRole,
		authAccount,
	)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) Rules(ctx context.Context, transactionItems []*model.TransactionItemInput) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeRules(transactionItems)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) RequestByID(ctx context.Context, transactionID int, authAccount string) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeRequestByID(transactionID, authAccount)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) RequestsByAccount(ctx context.Context, accountName string, authAccount string) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeRequestByAccount(accountName, authAccount)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) TransactionByID(ctx context.Context, transactionID int, authAccount string) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeTransactionByID(transactionID, authAccount)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

func (r *queryResolver) TransactionsByAccount(ctx context.Context, accountName string, authAccount string) (*model.Transaction, error) {
	err := r.CreateLambdaSession()
	if err != nil {
		return nil, err
	}
	tr, err := r.InvokeTransactionByAccount(accountName, authAccount)
	if err != nil {
		return nil, err
	}
	return tr, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }