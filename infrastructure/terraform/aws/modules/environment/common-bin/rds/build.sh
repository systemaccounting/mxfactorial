#!/bin/bash

BUILD_TARGET=$1

build_src() {
  echo 'Building integration test data teardown lambda'
  rm -f teardown-src.zip
  yarn install
  zip -r teardown-src.zip index.js node_modules package.json yarn.lock
}

build_src