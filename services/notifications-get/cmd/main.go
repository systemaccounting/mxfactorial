package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	apigw "github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/lestrrat-go/jwx/jwk"
	cjwt "github.com/systemaccounting/mxfactorial/services/gopkg/cognitojwt"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/service"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
)

var (
	pgConn string = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
	notificationsReturnLimit string = os.Getenv("NOTIFICATIONS_RETURN_LIMIT")
	awsRegion                string = os.Getenv("AWS_REGION")
	apiGWConnectionsURI             = os.Getenv("APIGW_CONNECTIONS_URI")
	cognitoJWKSURI                  = os.Getenv("COGNITO_JWKS_URI")
	jwkSet                   jwk.Set
)

type Body struct {
	Account     *string `json:"account"` // tmp jwt override
	*cjwt.Token `json:"token"`
}

func init() {
	var err error
	jwkSet, err = cjwt.FetchJWKSet(context.Background(), cognitoJWKSURI)
	if err != nil {
		log.Fatalf("json web token key fetch error %v", err)
	}
}

func lambdaFn(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
	dbConnector func(context.Context, string) (postgres.SQLDB, error),
	websocketServiceConstructor func(db postgres.SQLDB) (service.IWebsocketService, error),
	notificationServiceConstructor func(db postgres.SQLDB) (service.ITransactionNotificationService, error),
) (events.APIGatewayProxyResponse, error) {

	// unmarshal body from apigw request
	var b Body
	err := json.Unmarshal([]byte(e.Body), &b)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.APIGatewayProxyResponse{}, nil
	}

	connectionID := e.RequestContext.ConnectionID

	// auth account with cognito
	var accountName string
	if b.Account != nil {
		// override with tmp account property during development
		accountName = *b.Account
	} else {
		// or use cognito auth
		var err error
		accountName, err = b.GetAuthAccount(jwkSet)
		if err != nil {
			log.Printf("cognito auth failure: %v", err)
			return events.APIGatewayProxyResponse{}, err
		}
	}

	// connect to db
	db, err := dbConnector(context.Background(), pgConn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.APIGatewayProxyResponse{}, err
	}
	defer db.Close(context.Background())

	// create websocket service
	ws, err := websocketServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.APIGatewayProxyResponse{}, err
	}

	// update websocket with account name
	err = ws.AddAccountToCurrentWebsocket(accountName, connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Printf("websocket update failure: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}

	// create select notifications sql
	limit, err := strconv.Atoi(notificationsReturnLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Printf("string to int conversion fail %v", err)
		return events.APIGatewayProxyResponse{}, nil
	}

	// create transaction service
	ns, err := notificationServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	transNotifs, err := ns.GetTransNotifsByAccount(accountName, limit)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

	// create api gateway session
	sess := session.Must(session.NewSession())

	// create api gateway service with custom endpoint
	svc := apigw.New(
		sess,
		aws.NewConfig().WithRegion(awsRegion).WithEndpoint(apiGWConnectionsURI),
	)

	// 1. create notification payload
	// 2. store notifications for delete after delivery
	var notificationsToSend types.PendingNotifications
	for _, v := range transNotifs {
		msg := &types.Message{
			NotificationID: v.ID,
			Message:        *v.Message,
		}
		notificationsToSend.Pending = append(notificationsToSend.Pending, msg)
	}

	// temp solution to https://github.com/aws/aws-sdk-go/issues/3477
	// delete websocket from postgres after matching 410 status code in apigw error
	re, err := regexp.Compile("410")
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

	// create payload from notifications slice
	payload, err := json.Marshal(notificationsToSend)
	if err != nil {
		log.Printf("transaction list marshal fail %v", err)
		return events.APIGatewayProxyResponse{}, nil
	}

	// create input to api gateway websocket endpoint
	input := &apigw.PostToConnectionInput{
		ConnectionId: &connectionID,
		Data:         payload,
	}

	// send notifications to websocket connection
	_, err = svc.PostToConnection(input)
	if err != nil {
		errMsg := err.Error()

		// print error if not 410 from api gateway
		if !re.MatchString(errMsg) {
			log.Print(errMsg)
		}

		// queue connection id to delete if
		// 410 status code in error, and connection id is unique
		if re.MatchString(errMsg) {

			err := ws.DeleteWebsocketConnection(connectionID)
			if err != nil {
				logger.Log(logger.Trace(), fmt.Errorf("DeleteWebsocketConnection: %v", err))
			}

			log.Printf("lost websococket on %v", connectionID)
		}
	}

	// 200 to api gateway
	return events.APIGatewayProxyResponse{StatusCode: 200}, nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	return lambdaFn(
		ctx,
		e,
		postgres.NewIDB,
		newWebsocketService,
		newNotificationService,
	)
}

// enables lambdaFn unit testing
func newWebsocketService(idb postgres.SQLDB) (service.IWebsocketService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newWebsocketService: failed to assert *postgres.DB")
	}
	return service.NewWebsocketService(db), nil
}

// enables lambdaFn unit testing
func newNotificationService(idb postgres.SQLDB) (service.ITransactionNotificationService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newNotificationService: failed to assert *postgres.DB")
	}
	return service.NewTransactionNotificationService(db), nil
}

func main() {
	lambda.Start(handleEvent)
}
