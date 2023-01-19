FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/balance-by-account

RUN go build -o balance-by-account ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/balance-by-account/balance-by-account .

CMD ["/app/balance-by-account"]