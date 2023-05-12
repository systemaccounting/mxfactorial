FROM mxfactorial/go-base:v1 as builder

COPY . .

WORKDIR /app/services/balance-by-account

RUN go build -o balance-by-account ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/balance-by-account/balance-by-account .

EXPOSE 10004

CMD ["/app/balance-by-account"]