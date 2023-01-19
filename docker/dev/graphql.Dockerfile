FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/graphql

RUN go build -o graphql .

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/graphql/graphql .

CMD ["/app/graphql"]