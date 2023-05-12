FROM mxfactorial/go-base:v1 as builder

COPY . .

WORKDIR /app/services/request-by-id

RUN go build -o request-by-id ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/request-by-id/request-by-id .

EXPOSE 10005

CMD ["/app/request-by-id"]