FROM mxfactorial/go-base:v1 as builder

COPY . .

WORKDIR /app/services/request-approve

RUN go build -o request-approve ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/request-approve/request-approve .

EXPOSE 10003

CMD ["/app/request-approve"]