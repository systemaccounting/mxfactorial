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
	awsRegion           string = os.Getenv("AWS_REGION")
	apiGWConnectionsURI        = os.Getenv("APIGW_CONNECTIONS_URI")
)

type Body struct {
	Action          *string     `json:"action"`
	Token           *string     `json:"token"`
	NotificationIDs []*types.ID `json:"notification_ids"`
}

func lambdaFn(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
	c lpg.Connector,
) (events.APIGatewayProxyResponse, error) {

	// unmarshal body from apigw request
	var b Body
	err := json.Unmarshal([]byte(e.Body), &b)
	if err != nil {
		return events.APIGatewayProxyResponse{}, nil
	}

	connectionID := e.RequestContext.ConnectionID
	accountName := *b.Token
	connectedAt := int64(e.RequestContext.ConnectedAt)
	notificationIDsToClear := b.NotificationIDs

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}
	defer db.Close(context.Background())

	// add wesocket to table if not stored

	// create select websockets by conn id sql
	connIDSQL, connIDArgs := sqlb.SelectWebsocketByConnectionIDSQL(
		connectionID, // e.RequestContext.ConnectionID
	)

	// query websockets for current id
	row := db.QueryRow(context.Background(), connIDSQL, connIDArgs...)

	// add current websocket to db if ErrNoRows
	_, err = lpg.UnmarshalWebsocket(row)
	if err != nil {
		if err == pgx.ErrNoRows {
			insErr := insertCurrentWebsocket(
				db,
				connectionID,
				accountName,
				connectedAt,
			)
			if insErr != nil {
				log.Printf("websocket insert %v", err)
				return events.APIGatewayProxyResponse{}, err
			}
		} else {
			log.Printf("unmarshal websocket %v", err)
			return events.APIGatewayProxyResponse{}, nil
		}
	}

	// add ids to interface slice for sql pkg
	notifIDsArg := []interface{}{}
	for _, v := range notificationIDsToClear {
		notifIDsArg = append(notifIDsArg, v)
	}

	// create delete transaction notifications sql
	delNotifSQL, delNotifArgs := sqlb.DeleteTransNotificationsByIDSQL(
		notifIDsArg,
	)

	// delete transaction_notifications
	_, err = db.Exec(
		context.Background(),
		delNotifSQL,
		delNotifArgs...,
	)
	if err != nil {
		log.Printf("query err: %v", err)
	}

	// create api gateway session
	sess := session.Must(session.NewSession())

	// create api gateway service with custom endpoint
	svc := apigw.New(
		sess,
		aws.NewConfig().WithRegion(awsRegion).WithEndpoint(apiGWConnectionsURI),
	)

	// store connection id in interface slice
	// for sqlbuilder package in case of error
	var websocketsToDeleteOnErr = []interface{}{connectionID}
	notificationsToSend := types.ClearedNotifications{
		Cleared: notificationIDsToClear,
	}

	// temp solution to https://github.com/aws/aws-sdk-go/issues/3477
	// delete websocket from postgres after matching 410 status code in apigw error
	re, err := regexp.Compile("410")
	if err != nil {
		log.Print(err)
	}

	// create payload from notifications slice
	payload, err := json.Marshal(notificationsToSend)
	if err != nil {
		log.Printf("cleared notifications marshal fail %v", err)
		return events.APIGatewayProxyResponse{}, nil
	}

	// create input to api gateway websocket endpoint
	input := &apigw.PostToConnectionInput{
		ConnectionId: &connectionID,
		Data:         payload,
	}

	// send notification to websocket connection
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
			// create delete websockets by connection ids sql
			delWssSQL, delWssArgs := sqlb.DeleteWebsocketsByConnectionIDSQL(
				websocketsToDeleteOnErr,
			)
			// delete current websocket
			_, err = db.Exec(
				context.Background(),
				delWssSQL,
				delWssArgs...,
			)
			if err != nil {
				log.Printf("delete websockets err: %v", err)
			}
			log.Printf("lost websococket on %v", connectionID)
		}
	}

	// 200 to api gateway
	return events.APIGatewayProxyResponse{StatusCode: 200}, nil
}

func insertCurrentWebsocket(
	db lpg.SQLDB,
	connID,
	accountName string,
	connectedAt int64,
) error {
	insSQL, insArgs := sqlb.InsertWebsocketConnectionSQL(
		connID,
		accountName,
		connectedAt,
	)
	_, err := db.Exec(context.Background(), insSQL, insArgs...)
	if err != nil {
		log.Printf("wss conn insert error: %v", err)
		return err
	}
	return nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	c := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, c)
}

func main() {
	lambda.Start(handleEvent)
}
