package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/systemaccounting/mxfactorial/services/gopkg/logger"
	"github.com/systemaccounting/mxfactorial/services/gopkg/postgres"
	"github.com/systemaccounting/mxfactorial/services/gopkg/service"
	"github.com/systemaccounting/mxfactorial/services/gopkg/types"
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

type SQLDB interface {
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Begin(context.Context) (pgx.Tx, error)
	Close(context.Context) error
	IsClosed() bool
}

type IWebsocketStorageService interface {
	AddAccountToCurrentWebsocket(accountName, connectionID string) error
	AddWebsocketConnection(epochCreatedAt int64, connectionID string) error
	DeleteWebsocketConnection(connectionID string) error
	GetWebsocketsByAccounts(accounts []string) (types.Websockets, error)
	DeleteWebsocketsByConnectionIDs(connectionIDs []string) error
}

func lambdaFn(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
	dbConnector func(context.Context, string) (SQLDB, error),
	websocketServiceConstructor func(db SQLDB) (IWebsocketStorageService, error),
) (events.APIGatewayProxyResponse, error) {

	// values required to insert and delete on connect and disconnect routes
	routeKey := e.RequestContext.RouteKey
	connectionID := e.RequestContext.ConnectionID
	connectedAt := e.RequestContext.ConnectedAt

	// set success response
	success := events.APIGatewayProxyResponse{StatusCode: 200}

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

	// insert websocket connection in db on connect
	if routeKey == connectRouteKey {

		err := ws.AddWebsocketConnection(connectedAt, connectionID)
		if err != nil {
			logger.Log(logger.Trace(), err)
			return events.APIGatewayProxyResponse{}, err
		}

		return success, nil
	}

	// delete websocket connection in db on disconnect
	if routeKey == disconnectRouteKey {

		err := ws.DeleteWebsocketConnection(connectionID)
		if err != nil {
			logger.Log(logger.Trace(), err)
			return events.APIGatewayProxyResponse{}, err
		}

		return success, nil
	}

	// return route not found to alert misconfigured route integrations
	ErrRouteNotFound := fmt.Sprintf("route not found: %v", routeKey)
	log.Print(ErrRouteNotFound)

	return events.APIGatewayProxyResponse{
		StatusCode: 404,
		Body:       ErrRouteNotFound,
	}, nil
}

// wraps lambdaFn accepting interfaces for testability
func handleEvent(
	ctx context.Context,
	e events.APIGatewayWebsocketProxyRequest,
) (events.APIGatewayProxyResponse, error) {
	return lambdaFn(
		ctx,
		e,
		newIDB,
		newWebsocketStorageService,
	)
}

// enables lambdaFn unit testing
func newWebsocketStorageService(idb SQLDB) (IWebsocketStorageService, error) {
	db, ok := idb.(*postgres.DB)
	if !ok {
		return nil, errors.New("newWebsocketService: failed to assert *postgres.DB")
	}

	// not using ApiGatewayMgmtAPIService so passing nil to NewWebsocketService()
	return service.NewWebsocketService(db, nil, nil), nil
}

// enables lambdaFn unit testing
func newIDB(ctx context.Context, dsn string) (SQLDB, error) {
	return postgres.NewDB(ctx, dsn)
}

func main() {
	lambda.Start(handleEvent)
}
