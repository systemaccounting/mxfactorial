FROM mxfactorial/go-base:v1 as builder

COPY . .

WORKDIR /app/services/transactions-by-account

RUN go build -o transactions-by-account ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/transactions-by-account/transactions-by-account .

EXPOSE 10008

CMD ["/app/transactions-by-account"]