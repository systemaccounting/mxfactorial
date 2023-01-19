FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/request-approve

RUN go build -o request-approve ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/request-approve/request-approve .

CMD ["/app/request-approve"]