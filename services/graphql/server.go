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
	"github.com/awslabs/aws-lambda-go-api-proxy/core"
	"github.com/awslabs/aws-lambda-go-api-proxy/gorillamux"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph"
	"github.com/systemaccounting/mxfactorial/services/graphql/graph/generated"
)

const playgroundTitle string = "playground"
const rootRoute string = "/"
const queryRoute string = rootRoute + "query"

func lambdaFn(
	ctx context.Context,
	e core.SwitchableAPIGatewayRequest,
	server *handler.Server,
	r *mux.Router,
	ma *gorillamux.GorillaMuxAdapter,
) (events.APIGatewayV2HTTPResponse, error) {
	r.Handle(queryRoute, server)
	r.Handle(rootRoute, playground.Handler(playgroundTitle, queryRoute))
	resp, err := ma.ProxyWithContext(ctx, e)
	if err != nil {
		log.Println(err)
	}
	return *resp.Version2(), err
}

// wraps lambdaFn with deps
func handleEvent(
	ctx context.Context,
	e core.SwitchableAPIGatewayRequest,
) (events.APIGatewayV2HTTPResponse, error) {
	var r *mux.Router = mux.NewRouter()
	var muxAdapter *gorillamux.GorillaMuxAdapter = gorillamux.New(r)
	var schema graphql.ExecutableSchema = generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}})
	var server *handler.Server = handler.NewDefaultServer(schema)
	return lambdaFn(ctx, e, server, r, muxAdapter)
}

func main() {

	// test for lambda env
	if len(os.Getenv("LOCAL_ENV")) == 0 {
		lambda.Start(handleEvent)
	} else {
		// or serve from local
		schema := generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}})
		server := handler.NewDefaultServer(schema)

		r := mux.NewRouter()
		r.Handle(queryRoute, server)
		r.Handle(rootRoute, playground.Handler(playgroundTitle, queryRoute))

		// create web server for local development
		port := "8080"
		log.Printf("connect to http://localhost:%s/ for playground", port)
		handler := cors.Default().Handler(r) // allow any origin in local dev env
		log.Fatal(http.ListenAndServe(":"+port, handler))
	}
}
