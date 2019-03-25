#!/bin/bash
build_src() {
  rm -f rules-lambda.zip
  yarn install
  yarn test && zip -r rules-lambda.zip index.js src node_modules package.json yarn.lock
}

build_src