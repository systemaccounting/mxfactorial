#!/bin/bash

BUILD_TARGET=$1

build_src() {
  echo 'Building auto-deploy from s3 lambda'
  rm -f deploy-lambda-src.zip
  yarn install
  zip -r deploy-lambda-src.zip index.js
}

build_src