package auth

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/awslabs/aws-lambda-go-api-proxy/core"
)

const ErrNotAuthorized string = "error: not authorized"

// GetAuthAccount returns account from cognito
func GetAuthAccount(ctx context.Context, graphQLRequestAccount string) (string, error) {

	// enable cognito api auth by setting enable_api_auth terraform variable to true
	if os.Getenv("ENABLE_API_AUTH") == "true" {

		// get api gateway context from proxy request
		apigwCtx, ok := core.GetAPIGatewayV2ContextFromContext(ctx)
		if !ok {
			log.Print("api gateway context not avilable from request")
			return "", errors.New(ErrNotAuthorized)
		}

		// test for missing authorizer
		if apigwCtx.Authorizer == nil {
			log.Print("missing authorizer")
			return "", errors.New(ErrNotAuthorized)
		}

		// get authenticated account from jwt claims
		authAccount, ok := apigwCtx.Authorizer.JWT.Claims["cognito:username"]
		if !ok {
			log.Print("cognito username not avilable from jwt claims")
			return "", errors.New(ErrNotAuthorized)
		}

		return authAccount, nil
	}

	// return account passed by user in graphql
	// request when cognito disabled in api
	return graphQLRequestAccount, nil
}
