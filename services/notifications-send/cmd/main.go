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
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
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
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	dbc func() sqls.DeleteSQLBuilder,
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

	// create builder from constructor
	sb := sbc()

	// create select transaction_notifications by id sql
	selNotifSQL, selNotifArgs := sb.SelectTransNotifsByIDsSQL(
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
	transNotifs, err := u.UnmarshalTransactionNotifications(
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

	// create sql builder from constructor
	sbWs := sbc()

	// create select websockets by account sql
	selWssSQL, selWssArgs := sbWs.SelectWebsocketByAccountsSQL(
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
	websockets, err := u.UnmarshalWebsockets(
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
				if re.MatchString(errMsg) && tools.IsIfaceStringUnique(*w.ConnectionID, websocketsToDelete) {
					websocketsToDelete = append(websocketsToDelete, *w.ConnectionID)
				}
			}
		}
	}

	// delete stale websockets
	if len(websocketsToDelete) > 0 {

		// create sql builder from constructor
		dbWs := dbc()

		// create delete websockets by connection ids sql
		delWssSQL, delWssArgs := dbWs.DeleteWebsocketsByConnectionIDSQL(
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
	u := lpg.NewPGUnmarshaler()
	lambdaFn(ctx, e, c, u, sqls.NewSelectBuilder, sqls.NewDeleteBuilder)
}

func main() {
	lambda.Start(handleEvent)
}
