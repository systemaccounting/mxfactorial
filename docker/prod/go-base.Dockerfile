FROM golang:alpine

WORKDIR /app

ADD go.* .

RUN go mod download