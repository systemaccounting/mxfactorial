package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
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
	e events.APIGatewayWebsocketProxyRequestContext,
	// c lpg.Connector,
) (string, error) {

	log.Print(e)
	// connect to postgres
	// db, err := c.Connect(ctx, pgConn)
	// if err != nil {
	// 	log.Printf("connect error: %v", err)
	// 	return "", err
	// }
	// defer db.Close(context.Background())

	// send string or error response to client
	return "", nil
}

func main() {
	lambda.Start(lambdaFn)
}
