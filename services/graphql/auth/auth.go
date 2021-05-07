package auth

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/awslabs/aws-lambda-go-api-proxy/core"
)

const ErrNotAuthorized string = "not authorized"

// GetAuthAccount returns account from cognito
func GetAuthAccount(ctx context.Context, graphQLRequestAccount string) (string, error) {

	// enable cognito api auth by setting enable_api_auth terraform variable to true

	if os.Getenv("ENABLE_API_AUTH") == "true" {
		// get api gateway context from proxy request
		// https://github.com/awslabs/aws-lambda-go-api-proxy/blob/8564c1ce2a1c8ccf3571fb1ffa2c6cef1cbf56c0/core/request.go#L223-L226
		apigwCtx, ok := core.GetAPIGatewayContextFromContext(ctx)
		if !ok {
			log.Print("lambda context not avilable from request")
			return "", errors.New(ErrNotAuthorized)
		}

		// get claims from jwt
		claims, ok := apigwCtx.Authorizer["claims"].(map[string]interface{})
		if !ok {
			log.Print("jwt claims not avilable from request")
			return "", errors.New(ErrNotAuthorized)
		}

		// get account from jwt claims
		account, ok := claims["cognito:username"].(string)
		if !ok {
			log.Print("account not available from cognito:username")
			return "", errors.New(ErrNotAuthorized)
		}
		return account, nil
	}

	// return account passed by user in graphql
	// request when cognito disabled in api
	return graphQLRequestAccount, nil
}
