FROM mxfactorial/go-base:v1 as builder

COPY . .

WORKDIR /app/services/request-create

RUN go build -o request-create ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/request-create/request-create .

EXPOSE 10002

CMD ["/app/request-create"]