FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/transactions-by-account

RUN go build -o transactions-by-account ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/transactions-by-account/transactions-by-account .

CMD ["/app/transactions-by-account"]