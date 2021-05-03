package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/gorillamux"
	"github.com/gorilla/mux"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/generated"
)

const playgroundTitle string = "playground"
const rootRoute string = "/"
const queryRoute string = rootRoute + "query"

// lambda code
func lambdaFn(
	ctx context.Context,
	e events.APIGatewayProxyRequest,
	schema graphql.ExecutableSchema,
	server *handler.Server,
	r *mux.Router,
	ma *gorillamux.GorillaMuxAdapter) (events.APIGatewayProxyResponse, error) {
	r.Handle(queryRoute, server)
	r.Handle(rootRoute, playground.Handler(playgroundTitle, queryRoute))
	resp, err := ma.ProxyWithContext(ctx, e)
	if err != nil {
		log.Println(err)
	}
	return resp, err
}

// wraps lambdaFn with deps
func handleEvent(
	ctx context.Context,
	e events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	var r *mux.Router = mux.NewRouter()
	var muxAdapter *gorillamux.GorillaMuxAdapter = gorillamux.New(r)
	var schema graphql.ExecutableSchema = generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}})
	var server *handler.Server = handler.NewDefaultServer(schema)
	return lambdaFn(ctx, e, schema, server, r, muxAdapter)
}

func main() {
	// set LOCAL_ENV for local development
	var osLocalEnv string = os.Getenv("LOCAL_ENV")
	// test for lambda env
	if len(osLocalEnv) == 0 {
		lambda.Start(handleEvent)
	} else {
		// create web server for local development
		port := "8080"
		r := mux.NewRouter()
		schema := generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}})
		server := handler.NewDefaultServer(schema)
		r.Handle(queryRoute, server)
		r.Handle(rootRoute, playground.Handler(playgroundTitle, queryRoute))
		log.Printf("connect to http://localhost:%s/ for playground", port)
		log.Fatal(http.ListenAndServe(":"+port, r))
	}
}
