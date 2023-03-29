package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	cidp "github.com/systemaccounting/mxfactorial/pkg/aws/cognitoidp"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/postgres"
	"github.com/systemaccounting/mxfactorial/pkg/service"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

var (
	pgConn string = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
	awsRegion           string = os.Getenv("AWS_REGION")
	apiGWConnectionsURI        = os.Getenv("APIGW_CONNECTIONS_URI")
	cognitoJWKSURI             = os.Getenv("COGNITO_JWKS_URI")
	jwks                *cidp.CognitoJwks
)

type SQLDB interface {
	Close(context.Context) error
}

type IWebsocketService interface {
	SendNotificationOrDeleteStaleWebsocket(connectionID *string, v any) error
	AddAccountToCurrentWebsocket(accountName, connectionID string) error
}

type ITransactionNotificationService interface {
	DeleteTransNotificationsByIDs(notifIDs types.IDs) error
}

type IAuthenticate interface {
	GetAuthAccount(token string) (string, error)
}

type IAuthService interface {
	AuthAccount(*cidp.JWToken, *string) (string, error)
}

type Body struct {
	types.WebsocketMessage
	NotificationIDs types.IDs `json:"notification_ids"`
	cidp.JWToken    `json:"token"`
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
	jwkeys *cidp.CognitoJwks,
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
	notificationIDsToClear := b.NotificationIDs

	// update websocket with account name
	err = ws.AddAccountToCurrentWebsocket(accountName, connectionID)
	if err != nil {
		log.Printf("websocket update failure: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}

	// create notification service
	ns, err := notificationServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	err = ns.DeleteTransNotificationsByIDs(notificationIDsToClear)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

	// create response with cleared notifications
	notificationsToSend := types.ClearedNotifications{
		Cleared: notificationIDsToClear,
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
		jwks,
		websocketMessageBody,
		authService,
		newIDB,
		newWebsocketService,
		newNotificationService,
	)
}

func newWebsocketService(idb SQLDB) (IWebsocketService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newWebsocketService: failed to assert *postgres.DB")
	}
	return service.NewWebsocketService(db, &apiGWConnectionsURI, &awsRegion), nil
}

func newNotificationService(idb SQLDB) (ITransactionNotificationService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newNotificationService: failed to assert *postgres.DB")
	}
	return service.NewTransactionNotificationService(db), nil
}

func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

// avoids lambda package dependency during local development
func localEnvOnly(event string) {

	// create test event by assigning to proxy request body
	testEvent := events.APIGatewayWebsocketProxyRequest{
		Body: event,
		RequestContext: events.APIGatewayWebsocketProxyRequestContext{
			// temp hardcoded ConnectionID
			// todo:
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
