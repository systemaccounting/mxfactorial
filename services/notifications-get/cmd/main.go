package main

import (
	"context"
	"encoding/json"
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
	"github.com/jackc/pgx/v4"
	"github.com/lestrrat-go/jwx/jwk"
	cjwt "github.com/systemaccounting/mxfactorial/services/gopkg/cognitojwt"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	"github.com/systemaccounting/mxfactorial/services/gopkg/sqls"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
	"github.com/systemaccounting/mxfactorial/services/gopkg/websocket"
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
	c lpg.Connector,
	u lpg.PGUnmarshaler,
	sbc func() sqls.SelectSQLBuilder,
	ubc func() sqls.UpdateSQLBuilder,
	dbc func() sqls.DeleteSQLBuilder,
) (events.APIGatewayProxyResponse, error) {

	// unmarshal body from apigw request
	var b Body
	err := json.Unmarshal([]byte(e.Body), &b)
	if err != nil {
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

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}
	defer db.Close(context.Background())

	// update websocket with account name
	err = websocket.AddAccountToCurrentWebsocket(
		db,
		ubc,
		accountName,
		connectionID,
	)
	if err != nil {
		log.Printf("websocket update failure: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}

	// create select notifications sql
	limit, err := strconv.Atoi(notificationsReturnLimit)
	if err != nil {
		log.Printf("string to int conversion fail %v", err)
		return events.APIGatewayProxyResponse{}, nil
	}

	// create sql builder from constructor
	sb := sbc()

	selNotifSQL, selNotifArgs := sb.SelectTransNotifsByAccountSQL(
		accountName,
		limit,
	)

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
		log.Print(err)
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

			// create sql builder from constructor
			dbWs := dbc()

			// create delete websockets by connection ids sql
			delWssSQL, delWssArgs := dbWs.DeleteWebsocketsByConnectionIDSQL(
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

// wraps lambdaFn accepting db interface for testability
func handleEvent(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	c := lpg.NewConnector(pgx.Connect)
	u := lpg.NewPGUnmarshaler()
	return lambdaFn(
		ctx,
		e,
		c,
		u,
		sqls.NewSelectBuilder,
		sqls.NewUpdateBuilder,
		sqls.NewDeleteBuilder)
}

func main() {
	lambda.Start(handleEvent)
}
