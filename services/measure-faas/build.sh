#!/bin/bash
build() {
  rm -f measure-src.zip
  go get -t
  GOOS=linux go build -o index.handler *.go
  zip measure-src.zip ./index.handler
}

build