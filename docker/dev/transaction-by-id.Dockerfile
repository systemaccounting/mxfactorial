FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/transaction-by-id

RUN go build -o transaction-by-id ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/transaction-by-id/transaction-by-id .

CMD ["/app/transaction-by-id"]