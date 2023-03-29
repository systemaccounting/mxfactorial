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
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/pkg/logger"
	"github.com/systemaccounting/mxfactorial/pkg/postgres"
	"github.com/systemaccounting/mxfactorial/pkg/service"
	"github.com/systemaccounting/mxfactorial/pkg/types"
)

var (
	awsRegion           string = os.Getenv("AWS_REGION")
	apiGWConnectionsURI        = os.Getenv("APIGW_CONNECTIONS_URI")
	pgConn                     = fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		os.Getenv("PGHOST"),
		os.Getenv("PGPORT"),
		os.Getenv("PGUSER"),
		os.Getenv("PGPASSWORD"),
		os.Getenv("PGDATABASE"))
	snsMsgAttributeName = "SERVICE"
)

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

func lambdaFn(
	ctx context.Context,
	e events.SNSEvent,
	dbConnector func(context.Context, string) (SQLDB, error),
	notificationServiceConstructor func(db SQLDB) (ITransactionNotificationService, error),
	websocketServiceConstructor func(db SQLDB) (IWebsocketService, error),
) {

	msg := e.Records[0].SNS.Message // `["23","45","67"]`
	attributes := e.Records[0].SNS.MessageAttributes

	var service string

	// discover service sending notifications from sns "SERVICE" message attribute
	if s, ok := attributes[snsMsgAttributeName].(map[string]interface{}); ok {
		if val, ok := s["Value"].(string); ok {
			service = val
		} else {
			log.Fatal("attribute value not found")
		}
	} else {
		log.Fatal("SERVICE not found")
	}

	switch service {
	case "TRANSACT": // fall through until transact service code moved to pkg
	default:
		log.Fatalf("service not supported: %v", service)
	}

	// unmarshal transaction_notifcation ids
	var notifIDs types.IDs
	err := json.Unmarshal([]byte(msg), &notifIDs)
	if err != nil {
		log.Print(err)
	}

	// connect to db
	db, err := dbConnector(context.Background(), pgConn)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}
	defer db.Close(context.Background())

	// create transaction service
	ns, err := notificationServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	// get transactions
	transNotifs, err := ns.GetTransactionNotificationsByIDs(notifIDs)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	// create websocket service
	ws, err := websocketServiceConstructor(db)
	if err != nil {
		logger.Log(logger.Trace(), err)
		log.Fatal(err)
	}

	// send notifications to recipients
	err = ws.BroadcastNotificationsOrDeleteStaleWebsockets(transNotifs)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e events.SNSEvent,
) {
	lambdaFn(
		ctx,
		e,
		newIDB,
		newNotificationService,
		newWebsocketService,
	)
}

// enables lambdaFn unit testing
func newNotificationService(idb SQLDB) (ITransactionNotificationService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newNotificationService: failed to assert *postgres.DB")
	}
	return service.NewTransactionNotificationService(db), nil
}

// enables lambdaFn unit testing
func newWebsocketService(idb SQLDB) (IWebsocketService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newWebsocketService: failed to assert *postgres.DB")
	}
	return service.NewWebsocketService(db, &apiGWConnectionsURI, &awsRegion), nil
}

// enables lambdaFn unit testing
func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

func main() {
	lambda.Start(handleEvent)
}
