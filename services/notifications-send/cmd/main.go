package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"regexp"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	apigw "github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/service"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
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

type NotificationAndWebsockets struct {
	Notification *types.TransactionNotification
	Websockets   []*types.Websocket
}

func lambdaFn(
	ctx context.Context,
	e events.SNSEvent,
	dbConnector func(context.Context, string) (postgres.SQLDB, error),
	notificationServiceConstructor func(db postgres.SQLDB) (service.ITransactionNotificationService, error),
	websocketServiceConstructor func(db postgres.SQLDB) (service.IWebsocketService, error),
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
	}

	var wssAccounts []string
	for _, v := range transNotifs {
		wssAccounts = append(wssAccounts, *v.AccountName)
	}

	websockets, err := ws.GetWebsocketsByAccounts(wssAccounts)
	if err != nil {
		logger.Log(logger.Trace(), err)
	}

	// attach websockets per recipient
	var recipientsWithWebsockets []NotificationAndWebsockets
	for _, y := range transNotifs {
		wss := NotificationAndWebsockets{
			Notification: y,
		}
		for _, z := range websockets {
			if *z.AccountName == *y.AccountName {
				wss.Websockets = append(wss.Websockets, z)
			}
		}
		recipientsWithWebsockets = append(recipientsWithWebsockets, wss)
	}

	sess := session.Must(session.NewSession())

	svc := apigw.New(
		sess,
		aws.NewConfig().WithRegion(awsRegion).WithEndpoint(apiGWConnectionsURI),
	)

	var websocketsToDelete []string

	// temp solution to https://github.com/aws/aws-sdk-go/issues/3477
	// delete websocket from postgres after matching 410 status code in apigw error
	re, err := regexp.Compile("410")
	if err != nil {
		log.Print(err)
	}

	for _, r := range recipientsWithWebsockets {
		for _, w := range r.Websockets {

			// create notification payload message
			msg := &types.PendingNotifications{
				Pending: []*types.Message{
					{
						NotificationID: r.Notification.ID,
						Message:        *r.Notification.Message,
					},
				},
			}

			// create payload from notifications slice
			payload, err := json.Marshal(msg)
			if err != nil {
				log.Printf("noticiation payload marshal fail %v", err)
			}

			input := &apigw.PostToConnectionInput{
				ConnectionId: w.ConnectionID,
				Data:         payload,
			}

			_, err = svc.PostToConnection(input)
			if err != nil {
				errMsg := err.Error()

				// print error if not 410 from api gateway
				if !re.MatchString(errMsg) {
					log.Print(errMsg)
				}

				// add connection id to delete list if
				// 410 status code in error, and connection id is unique
				if re.MatchString(errMsg) && isStringUnique(*w.ConnectionID, websocketsToDelete) {
					websocketsToDelete = append(websocketsToDelete, *w.ConnectionID)
				}
			}
		}
	}

	// delete stale websockets
	if len(websocketsToDelete) > 0 {

		err := ws.DeleteWebsocketsByConnectionIDs(websocketsToDelete)
		if err != nil {
			logger.Log(logger.Trace(), fmt.Errorf("delete websockets err: %v", err))
		}
	}
}

func isStringUnique(s string, l []string) bool {
	for _, v := range l {
		if v == s {
			return false
		}
	}
	return true
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e events.SNSEvent,
) {
	lambdaFn(
		ctx,
		e,
		postgres.NewIDB,
		newNotificationService,
		newWebsocketService,
	)
}

// enables lambdaFn unit testing
func newNotificationService(idb postgres.SQLDB) (service.ITransactionNotificationService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newNotificationService: failed to assert *postgres.DB")
	}
	return service.NewTransactionNotificationService(db), nil
}

// enables lambdaFn unit testing
func newWebsocketService(idb postgres.SQLDB) (service.IWebsocketService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newWebsocketService: failed to assert *postgres.DB")
	}
	return service.NewWebsocketService(db), nil
}

func main() {
	lambda.Start(handleEvent)
}
