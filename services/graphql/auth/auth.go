package auth

import (
	"context"
	"errors"
	"log"
	"os"

	"github.com/awslabs/aws-lambda-go-api-proxy/core"
)

// GetAuthAccount returns account from cognito
func GetAuthAccount(ctx context.Context, graphQLRequestAccount string) (string, error) {

	// cognito api auth enabled by setting
	// enable_api_auth terraform variable to true

	if os.Getenv("ENABLE_API_AUTH") == "true" {
		// get api gateway context from proxy request
		// https://github.com/awslabs/aws-lambda-go-api-proxy/blob/8564c1ce2a1c8ccf3571fb1ffa2c6cef1cbf56c0/core/request.go#L223-L226
		apigwCtx, ok := core.GetAPIGatewayContextFromContext(ctx)
		if !ok {
			var errMsg string = "lambda context not avilable from request"
			log.Print(errMsg)
			return "", errors.New(errMsg)
		}

		// get account from jwt claims
		claims := apigwCtx.Authorizer["claims"].(map[string]interface{})
		account, ok := claims["cognito:username"].(string)
		if !ok {
			log.Print("account not available from cognito:username")
			return "", errors.New("not authorized")
		}
		return account, nil
	}

	// return account passed by user in graphql
	// request when cognito disabled in api
	return graphQLRequestAccount, nil
}
