package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/gin-gonic/gin"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
)

const ErrNotAuthorized string = "error: not authorized"

// GetAuthAccount returns account from cognito
func GetAuthAccount(ctx context.Context, graphQLRequestAccount string) (string, error) {

	// enable cognito api auth by setting enable_api_auth terraform variable to true
	if os.Getenv("ENABLE_API_AUTH") == "true" {

		ginCtx, err := GinContextFromContext(ctx)
		if err != nil {
			logger.Log(logger.Trace(), err)
			return "", err
		}

		// https://github.com/awslabs/aws-lambda-web-adapter/issues/107#issuecomment-1355974917
		header := ginCtx.Request.Header.Get("x-amzn-request-context")

		requestContext := new(events.APIGatewayV2HTTPRequestContext)

		err = json.Unmarshal([]byte(header), &requestContext)
		if err != nil {
			logger.Log(logger.Trace(), err)
			return "", err
		}

		// test for missing authorizer
		if requestContext.Authorizer == nil {
			log.Print("missing authorizer")
			return "", errors.New(ErrNotAuthorized)
		}

		// get authenticated account from jwt claims
		authAccount, ok := requestContext.Authorizer.JWT.Claims["cognito:username"]
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

func GinContextFromContext(ctx context.Context) (*gin.Context, error) {
	ginContext := ctx.Value("GinContextKey")
	if ginContext == nil {
		err := fmt.Errorf("could not retrieve gin.Context")
		return nil, err
	}

	gc, ok := ginContext.(*gin.Context)
	if !ok {
		err := fmt.Errorf("gin.Context has wrong type")
		return nil, err
	}
	return gc, nil
}
