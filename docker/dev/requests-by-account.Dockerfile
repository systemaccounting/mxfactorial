FROM mxfactorial/go-base:v1 as builder

EXPOSE 8080

COPY . .

WORKDIR /app/services/requests-by-account

RUN go build -o requests-by-account ./cmd

FROM golang:alpine

WORKDIR /app

COPY --from=builder /app/services/requests-by-account/requests-by-account .

CMD ["/app/requests-by-account"]