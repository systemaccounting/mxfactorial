FROM golang:alpine

WORKDIR /app

COPY go.* ./

RUN go mod download