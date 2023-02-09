package main

import (
	"context"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin"

	"github.com/systemaccounting/mxfactorial/services/graphql/graph"
)

var (
	readinessCheckPath string = os.Getenv("READINESS_CHECK_PATH")
	rootRoute                 = "/"
	queryRoute                = rootRoute + "query"
)

// https://github.com/99designs/gqlgen/blob/9d22d98c792ba7214dc1aad4366e3f7eba0299f7/docs/content/recipes/gin.md
func graphqlHandler() gin.HandlerFunc {
	h := handler.NewDefaultServer(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{}}))
	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func playgroundHandler() gin.HandlerFunc {
	h := playground.Handler("GraphQL", queryRoute)

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

func GinContextToContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.WithValue(c.Request.Context(), "GinContextKey", c)
		c.Request = c.Request.WithContext(ctx)
		c.Next()
	}
}

func main() {

	r := gin.Default()

	r.Use(
		cors.New(cors.Options{
			AllowOriginFunc: func(origin string) bool { return true },
			AllowedMethods: []string{
				http.MethodOptions,
				http.MethodHead,
				http.MethodGet,
				http.MethodPost,
			},
			AllowedHeaders:   []string{"*"},
			AllowCredentials: false,
		}),
		GinContextToContextMiddleware(),
	)

	// aws-lambda-web-adapter READINESS_CHECK_*
	r.GET(readinessCheckPath, func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r.POST(queryRoute, graphqlHandler())

	r.GET(rootRoute, playgroundHandler())

	r.Run()
}
