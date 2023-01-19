FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/request-by-id

RUN go build -o request-by-id ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/request-by-id/request-by-id .

CMD ["/app/request-by-id"]