FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/request-create

RUN go build -o request-create ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/request-create/request-create .

CMD ["/app/request-create"]