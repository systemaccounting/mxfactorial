FROM mxfactorial/go-base:v1 as builder

COPY . .

WORKDIR /app/services/graphql

RUN go build -o graphql .

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/graphql/graphql .

EXPOSE 10000

CMD ["/app/graphql"]