package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"regexp"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	apigw "github.com/aws/aws-sdk-go/service/apigatewaymanagementapi"
	"github.com/jackc/pgx/v4"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
	"github.com/systemaccounting/mxfactorial/services/gopkg/tools"
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
	c lpg.Connector,
) {

	msg := e.Records[0].SNS.Message
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
	var IDs []int32
	err := json.Unmarshal([]byte(msg), &IDs)
	if err != nil {
		log.Print(err)
	}

	// package wants interface slice
	var transNotifIDs []interface{}
	for _, v := range IDs {
		transNotifIDs = append(transNotifIDs, v)
	}

	// create select transaction_notifications by id sql
	selNotifSQL, selNotifArgs := sqlb.SelectTransNotifsByIDsSQL(
		transNotifIDs,
	)

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
	}
	defer db.Close(context.Background())

	// get transaction_notifications
	transNotifsRows, err := db.Query(
		context.Background(),
		selNotifSQL,
		selNotifArgs...,
	)
	if err != nil {
		log.Printf("query err: %v", err)
	}

	// unmarshal transaction_notifications
	transNotifs, err := lpg.UnmarshalTransactionNotifications(
		transNotifsRows,
	)
	if err != nil {
		log.Printf("unmarshal err: %v", err)
	}

	// sqlbuilder package In() receiver wants interface slice
	var wssAccountsIFace []interface{}
	for _, v := range transNotifs {
		wssAccountsIFace = append(wssAccountsIFace, *v.AccountName)
	}

	// create select websockets by account sql
	selWssSQL, selWssArgs := sqlb.SelectWebsocketByAccountsSQL(
		wssAccountsIFace,
	)

	// get websockets for notification recipients
	wssRows, err := db.Query(
		context.Background(),
		selWssSQL,
		selWssArgs...,
	)
	if err != nil {
		log.Printf("query err: %v", err)
	}

	// unmarshal websockets
	websockets, err := lpg.UnmarshalWebsockets(
		wssRows,
	)
	if err != nil {
		log.Printf("unmarshal err: %v", err)
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

	var websocketsToDelete []interface{} // sqlbuilder pkg want interface slice
	var notificationsToDelete []interface{}

	// temp solution to https://github.com/aws/aws-sdk-go/issues/3477
	// delete websocket from postgres after matching 410 status code in apigw error
	re, err := regexp.Compile("410")
	if err != nil {
		log.Print(err)
	}

	for _, r := range recipientsWithWebsockets {
		for _, w := range r.Websockets {

			payload, err := r.Notification.Message.MarshalJSON()
			if err != nil {
				log.Print(err)
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
				if re.MatchString(errMsg) && tools.IsStringUnique(*w.ConnectionID, websocketsToDelete) {
					websocketsToDelete = append(websocketsToDelete, *w.ConnectionID)
				}
			} else {
				// add transaction_notification id to delete list if
				// unique after delivering to multiple websockets
				if tools.IsIntUnique(*r.Notification.ID, notificationsToDelete) {
					notificationsToDelete = append(notificationsToDelete, *r.Notification.ID)
				}
			}
		}
	}

	// delete delivered notifications
	if len(notificationsToDelete) > 0 {
		// create delete transaction_notifications by id sql
		delTransNotifsSQL, delTransNotifsArgs := sqlb.DeleteTransNotificationsByIDSQL(
			notificationsToDelete,
		)
		_, err = db.Exec(
			context.Background(),
			delTransNotifsSQL,
			delTransNotifsArgs...,
		)
		if err != nil {
			log.Printf("delete notifications err: %v", err)
		}

	}

	// delete stale websockets
	if len(websocketsToDelete) > 0 {
		// create delete websockets by connection ids sql
		delWssSQL, delWssArgs := sqlb.DeleteWebsocketsByConnectionIDSQL(
			websocketsToDelete,
		)
		_, err = db.Exec(
			context.Background(),
			delWssSQL,
			delWssArgs...,
		)
		if err != nil {
			log.Printf("delete websockets err: %v", err)
		}
	}
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e events.SNSEvent,
) {
	c := lpg.NewConnector(pgx.Connect)
	lambdaFn(ctx, e, c)
}

func main() {
	lambda.Start(handleEvent)
}
