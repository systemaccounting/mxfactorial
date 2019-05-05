#!/bin/bash
build() {
  rm -f measure-src.zip
  GOOS=linux go build -o index.handler *.go
  zip measure-src.zip ./index.handler
}

build