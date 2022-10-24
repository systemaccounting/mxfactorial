package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	cidp "github.com/systemaccounting/mxfactorial/services/gopkg/aws/cognitoidp"
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
	jwks                     *cidp.CognitoJwks
)

type SQLDB interface {
	Close(context.Context) error
}

type IWebsocketService interface {
	SendNotificationOrDeleteStaleWebsocket(connectionID *string, v any) error
	AddAccountToCurrentWebsocket(accountName, connectionID string) error
}

type ITransactionNotificationService interface {
	GetTransNotifsByAccount(accountName string, recordLimit int) (types.TransactionNotifications, error)
}

type IAuthService interface {
	AuthAccount(*cidp.JWToken, *string) (string, error)
}

type Body struct {
	types.WebsocketMessage
	cidp.JWToken
}

func init() {
	jwks = cidp.NewCognitoJwks(cognitoJWKSURI)
	err := jwks.Fetch()
	if err != nil {
		logger.Log(logger.Trace(), err)
		panic(err)
	}
}

func lambdaFn(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
	b *Body,
	a IAuthService,
	dbConnector func(context.Context, string) (SQLDB, error),
	websocketServiceConstructor func(db SQLDB) (IWebsocketService, error),
	notificationServiceConstructor func(db SQLDB) (ITransactionNotificationService, error),
) (events.APIGatewayProxyResponse, error) {

	// unmarshal body from apigw request
	err := json.Unmarshal([]byte(e.Body), &b)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.APIGatewayProxyResponse{}, nil
	}

	// assigns account from cognito token when auth enabled, or
	// temp account property in websocket message when disabled
	accountName, err := a.AuthAccount(&b.JWToken, b.Account)
	if err != nil {
		logger.Log(logger.Trace(), err)
		return events.APIGatewayProxyResponse{}, err
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

	connectionID := e.RequestContext.ConnectionID

	// update websocket with account name
	err = ws.AddAccountToCurrentWebsocket(accountName, connectionID)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Printf("websocket update failure: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}

	// create notification service
	ns, err := notificationServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	// cadet todo: move into separate function
	limit, err := strconv.Atoi(notificationsReturnLimit)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Printf("string to int conversion fail %v", err)
		return events.APIGatewayProxyResponse{}, nil
	}

	transNotifs, err := ns.GetTransNotifsByAccount(accountName, limit)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

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

	// send notification to websocket connection
	// or delete stale websocket from db
	err = ws.SendNotificationOrDeleteStaleWebsocket(
		&connectionID,
		notificationsToSend,
	)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

	// 200 to api gateway
	return events.APIGatewayProxyResponse{StatusCode: 200}, nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	websocketMessageBody := new(Body)
	authService := service.NewAuthService(jwks)
	return lambdaFn(
		ctx,
		e,
		websocketMessageBody,
		authService,
		newIDB,
		newWebsocketService,
		newNotificationService,
	)
}

// enables lambdaFn unit testing
func newWebsocketService(idb SQLDB) (IWebsocketService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newWebsocketService: failed to assert *DB")
	}
	return service.NewWebsocketService(db, &apiGWConnectionsURI, &awsRegion), nil
}

// enables lambdaFn unit testing
func newNotificationService(idb SQLDB) (ITransactionNotificationService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newNotificationService: failed to assert *DB")
	}
	return service.NewTransactionNotificationService(db), nil
}

// enables lambdaFn unit testing
func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

// avoids lambda package dependency during local development
func localEnvOnly(event string) {

	// create test event by assigning to proxy request body
	testEvent := events.APIGatewayWebsocketProxyRequest{
		Body: event,
		RequestContext: events.APIGatewayWebsocketProxyRequestContext{
			// temp hardcoded test value during local development
			ConnectionID: "L0SM9cOFvHcCIhw=",
		},
	}

	// call event handler with test event
	resp, err := handleEvent(context.Background(), testEvent)
	if err != nil {
		panic(err)
	}

	if len(os.Getenv("DEBUG")) > 0 {
		log.Print(resp)
	}

	_ = resp
}

func main() {

	// ### LOCAL ENV only: assign event from env var
	var osTestEvent string = os.Getenv("TEST_EVENT")
	if len(osTestEvent) > 0 {
		localEnvOnly(osTestEvent)
		return
	}
	// ###

	lambda.Start(handleEvent)
}
