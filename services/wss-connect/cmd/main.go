package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgx/v4"
	lpg "github.com/systemaccounting/mxfactorial/services/gopkg/lambdapg"
	sqlb "github.com/systemaccounting/mxfactorial/services/gopkg/sqlbuilder"
)

const (
	connectRouteKey    string = "$connect"
	disconnectRouteKey string = "$disconnect"
)

var pgConn string = fmt.Sprintf(
	"host=%s port=%s user=%s password=%s dbname=%s",
	os.Getenv("PGHOST"),
	os.Getenv("PGPORT"),
	os.Getenv("PGUSER"),
	os.Getenv("PGPASSWORD"),
	os.Getenv("PGDATABASE"))

func lambdaFn(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
	c lpg.Connector,
	ibc func() sqlb.InsertSQLBuilder,
	dbc func() sqlb.DeleteSQLBuilder,
) (events.APIGatewayProxyResponse, error) {

	// values required to insert and delete on connect and disconnect routes
	routeKey := e.RequestContext.RouteKey
	connectionID := e.RequestContext.ConnectionID
	connectedAt := e.RequestContext.ConnectedAt

	// set success response
	success := events.APIGatewayProxyResponse{StatusCode: 200}

	// connect to postgres
	db, err := c.Connect(ctx, pgConn)
	if err != nil {
		log.Printf("connect error: %v", err)
		return events.APIGatewayProxyResponse{}, err
	}
	defer db.Close(context.Background())

	// insert websocket connection in db on connect
	if routeKey == connectRouteKey {

		// create sql builder with constructor
		ib := ibc()

		insSQL, insArgs := ib.InsertWebsocketConnectionSQL(
			connectionID,
			connectedAt,
		)
		_, err := db.Exec(context.Background(), insSQL, insArgs...)
		if err != nil {
			log.Printf("wss conn insert error: %v", err)
			return events.APIGatewayProxyResponse{}, err
		}
		return success, nil
	}

	// delete websocket connection in db on disconnect
	if routeKey == disconnectRouteKey {
		// create sql builder from constructor
		dbWs := dbc()

		// create sql
		delSQL, delArgs := dbWs.DeleteWebsocketConnectionSQL(connectionID)

		// insert websocket
		_, err := db.Exec(context.Background(), delSQL, delArgs...)
		if err != nil {
			log.Printf("wss conn delete error: %v", err)
			return events.APIGatewayProxyResponse{}, err
		}

		return success, nil
	}

	// return route not found to alert
	// misconfigured route integrations
	ErrRouteNotFound := fmt.Sprintf("route not found: %v", routeKey)
	log.Print(ErrRouteNotFound)

	return events.APIGatewayProxyResponse{
		StatusCode: 404,
		Body:       ErrRouteNotFound,
	}, nil
}

// wraps lambdaFn accepting db interface for testability
func handleEvent(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	c := lpg.NewConnector(pgx.Connect)
	return lambdaFn(ctx, e, c, sqlb.NewInsertBuilder, sqlb.NewDeleteBuilder)
}

func main() {
	lambda.Start(handleEvent)
}
