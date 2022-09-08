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
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
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

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
}

type IWebsocketService interface {
	SendNotificationOrDeleteStaleWebsocket(connectionID *string, v any) error
	BroadcastNotificationsToWebsockets(transNotifs types.TransactionNotifications) ([]string, error)
	BroadcastNotificationsOrDeleteStaleWebsockets(transNotifs types.TransactionNotifications) error
	AddAccountToCurrentWebsocket(accountName, connectionID string) error
}

type ITransactionNotificationService interface {
	InsertTransactionApprovalNotifications(n types.TransactionNotifications) (types.IDs, error)
	DeleteTransactionApprovalNotifications(trID types.ID) error
	DeleteTransNotificationsByIDs(notifIDs types.IDs) error
	Publish(notifIDs types.IDs, serviceName *string, topicArn *string) error
	NotifyTransactionRoleApprovers(approvals types.Approvals, transaction *types.Transaction, topicArn *string) error
	GetTransactionNotificationsByIDs(notifIDs types.IDs) (types.TransactionNotifications, error)
	GetTransNotifsByAccount(accountName string, recordLimit int) (types.TransactionNotifications, error)
	CreateNotificationsPerRoleApprover(approvals types.Approvals, transaction *types.Transaction) (types.TransactionNotifications, error)
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
	dbConnector func(context.Context, string) (SQLDB, error),
	websocketServiceConstructor func(db SQLDB) (IWebsocketService, error),
	notificationServiceConstructor func(db SQLDB) (ITransactionNotificationService, error),
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
	return lambdaFn(
		ctx,
		e,
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

func main() {
	lambda.Start(handleEvent)
}
